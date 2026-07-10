import { generateRandomBytes } from "../../Helpers";
import { ObfuscatedConnection } from "./Connection";
import { AbridgedPacketCodec } from "./TCPAbridged";
import { CTR } from "../../crypto/CTR";
import { PromisedWebSockets } from "../../extensions";

export class ObfuscatedIO {
    header?: Buffer = undefined;
    private connection: PromisedWebSockets;
    private _encrypt?: CTR;
    private _decrypt?: CTR;
    private _packetClass: AbridgedPacketCodec;

    constructor(connection: ConnectionWebSocket) {
        this.connection = connection.socket as PromisedWebSockets;
        this._packetClass = new AbridgedPacketCodec(connection);
    }

    async initHeader() {
        const keywords = [
            Buffer.from("50567247", "hex"),  // PVrG
            Buffer.from("474554", "hex"),    // GET
            Buffer.from("504f5354", "hex"),  // POST
            Buffer.from("eeeeeeee", "hex"),
        ];
        let random;

        while (true) {
            random = generateRandomBytes(64);
            if (
                random[0] !== 0xef &&
                !random.slice(4, 8).equals(Buffer.alloc(4))
            ) {
                let ok = true;
                for (const key of keywords) {
                    if (key.equals(random.slice(0, 4))) {
                        ok = false;
                        break;
                    }
                }
                if (ok) break;
            }
        }
        random = random.toJSON().data;

        const randomReversed = Buffer.from(random.slice(8, 56)).reverse();
        
        const encryptKey = Buffer.from(random.slice(8, 40));
        const encryptIv = Buffer.from(random.slice(40, 56));
        const decryptKey = Buffer.from(randomReversed.slice(0, 32));
        const decryptIv = Buffer.from(randomReversed.slice(32, 48));
        
        const encryptor = new CTR(encryptKey, encryptIv);
        const decryptor = new CTR(decryptKey, decryptIv);

        random = Buffer.concat([
            Buffer.from(random.slice(0, 56)),
            this._packetClass.obfuscateTag,  // efefefef
            Buffer.from(random.slice(60)),
        ]);
        
        random = Buffer.concat([
            Buffer.from(random.slice(0, 56)),
            Buffer.from(encryptor.encrypt(random).slice(56, 64)),
            Buffer.from(random.slice(64)),
        ]);
        
        this.header = random;
        this._encrypt = encryptor;
        this._decrypt = decryptor;
    }

    async read(n: number) {
        const data = await this.connection.readExactly(n);
        return this._decrypt!.encrypt(data);
    }

    write(data: Buffer) {
        this.connection.write(this._encrypt!.encrypt(data));
    }
}

export class ConnectionWebSocket extends ObfuscatedConnection {
    ObfuscatedIO = ObfuscatedIO;
    PacketCodecClass = AbridgedPacketCodec;

    constructor(props: any) {
        super({
            ...props,
            socket: PromisedWebSockets,
        });
    }
}