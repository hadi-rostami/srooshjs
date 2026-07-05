# SrooshJS

A Srooosh client written in JavaScript for Node.js and browsers, with its core being based on
[Telethon](https://github.com/LonamiWebs/Telethon).

## How to get started

Here you'll learn how to obtain necessary information to create sroosh application, authorize into your account and send yourself a message.

> **Note** that if you want to use a SrooshJS inside of a browser, refer to [this instructions](https://gram.js.org/introduction/advanced-installation).

Install SrooshJS:

```bash
$ npm i sroosh
```

After installation, you'll need to obtain an API ID and hash:

1. Sroosh ApiID: `1030400`
2. Sroosh ApiHash: `6edb16cf88714a4e9a805e928c39c937`

Then run this code to send a message to yourself.

```javascript
const { SrooshClient } = require("sroosh");
const { StringSession } = require("sroosh/sessions");
const readline = require("readline");

const apiId = 1030400;
const apiHash = "6edb16cf88714a4e9a805e928c39c937";
const stringSession = new StringSession("");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  console.log("Loading interactive example...");
  const client = new SrooshClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () =>
      new Promise((resolve) =>
        rl.question("Please enter your number: ", resolve),
      ),
    password: async () =>
      new Promise((resolve) =>
        rl.question("Please enter your password: ", resolve),
      ),
    phoneCode: async () =>
      new Promise((resolve) =>
        rl.question("Please enter the code you received: ", resolve),
      ),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  console.log(client.session.save()); // Save this string to avoid logging in again
  await client.sendMessage("me", { message: "Hello!" });
})();
```

> **Note** that you can also save auth key to a folder instead of a string, change `stringSession` into this:
>
> ```javascript
> const storeSession = new StoreSession("folder_name");
> ```

Be sure to save output of `client.session.save()` into `stringSession` or `storeSession` variable to avoid logging in again.

## Running SrooshJS inside browsers

SrooshJS works great in combination with frontend libraries such as React, Vue and others.

While working within browsers, SrooshJS is using `localStorage` to cache the layers.

To get a browser bundle of SrooshJS, use the following command:

```bash
NODE_ENV=production npx webpack
```

You can also use the helpful script `generate_webpack.js`

```bash
node generate_webpack.js
```

## Calling the raw API

To use raw telegram API methods use [invoke function](https://gram.js.org/beta/classes/TelegramClient.html#invoke).

```javascript
await client.invoke(new RequestClass(args));
```

## Documentation

General documentation, use cases, quick start, refer to [gram.js.org](https://gram.js.org), or [older version of documentation](https://painor.gitbook.io/SrooshJS) (will be removed in the future).

For more advanced documentation refer to [gram.js.org/beta](https://gram.js.org/beta) (work in progress).

If your ISP is blocking Telegram, you can check [My ISP blocks Telegram. How can I still use SrooshJS?](https://gist.github.com/SecurityAndStuff/7cd04b28216c49b73b30a64d56d630ab)
