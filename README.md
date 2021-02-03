# Simple notarization service based on Scrypta Blockchain

This is a simple application which can be useful to start your own notarization service. It's based on [Scrypta dApp Composer](https://github.com/scryptachain/scrypta-dapp-composer) so it's written in NodeJS using Nest as framework.

It connects directly to the public [IdaNode network](https://watchtower.scryptachain.org) which is maintained by Scrypta Community so you don't need your own IdANode to run it.

Follow these instructions to install and run it:

```
git clone https://github.com/oyb-scrypta/scrypta-dapp-composer
cd scrypta-dapp-composer
npm install
```

Because it's intended as a managed service you have to create a passphrase from where all addresses are derived. You can create it using your favourite BIP39 generator or leave the service create it for you at first start.

The service will expect parameter `MAIN_WALLET` into the `.env` file.

You're now ready to start the service with `npm start`. 

*Please note: if you generate the mnemonic phrase you will need to restart the service because it will stop after the creation process.*

Once is running you can run three simple methods, if you have Postman you can simply import the [collection](./postman.json.)

## [GET] /

Returns the connection to the fastest IdaNode, can be useful if you want to say to your customers that the service is up and running.

## [GET] /identity/:hash

This endpoint will return the identity derived from a specific hash256. This means you can create your own hashes based on your own identification data, let's say an e-mail.

So the e-mail `sebastiano.c@scrypta.foundation` will be hashed into `cd84c222dd728f7fdb3924f37fbd47eb9d2c80d1d01239e64d9a194e8ecb05d1`.

Response will be like this:

```
{
    "xpub": "xpub6TP7X6JXcHrEVeffG9zuuob9gK6cs97TZ8au4ZeLpSKhpV968Xr1B9HiecsbdZ68WchTzbVLC7mmesgQwYbD1ht7nCfmHyD2RUmoN43Prx6",
    "xprv": "xprvAEPm7amdmvHwHAbCA8TuYfeR8HG8TgPcBufJGBEjG6niwgowazXkdLyEoNuHFPJhxG7BcoG3NJxknqTCGdJbjjoidYZ78XWJFQsnd2xBrQc",
    "key": "026cc27d5d0cc44bfa62d89edde4bee299d436fb77487ef3421700f6e4b84d6437",
    "prv": "StDMZRpWfe1wok22G1oZv3JHu8DQhQqz6dBGaL5jjRT4hT32JTZQ",
    "pub": "LYy4GeCgnWeHqqnrZ8WWTiRcthA6WUgKww",
    "path": "m/20513219/43422111/41431272/19573624/31271897/12351574/41282092/08185723/07715425/78142203/5209"
}
```

## [POST] /notarize

This endpoint will notarize the specified data, you need to give these params: 

- **hash**: the identifier of the user
- **data**: a string or object containing your data, please note that objects will be automatically `stringified`.

If is the first time you will probably see something like this as response:

```
{
    "message": "This address can't write right now, seems master address can't fund it.",
    "master": "LKjvThy4EsJYhqui1QHQzKoT7TjEYnqd3U",
    "error": true
}
```

This means that your master address (LKjvThy4EsJYhqui1QHQzKoT7TjEYnqd3U) doesn't have enough balance, so first send a small amount of LYRA.
After your master balance is at least `0.002 LYRA` (we suggest something like 1 LYRA to test enough notarizations) you can retry again.

Response will be something like:

```
{
    "uuid": "8d4e9ca5.8b7a.41d1.8010.738d8b371fb5",
    "address": "LYeg8H28G7Sdq9EFofZtsncBHZ76Rvz1ZT",
    "fees": 0.001,
    "collection": "",
    "refID": "",
    "protocol": "",
    "dimension": 78,
    "chunks": 1,
    "stored": "*!*8d4e9ca5.8b7a.41d1.8010.738d8b371fb5!*!!*!!*!!*!*=>\"hello world, again.\"*!*",
    "txs": [
        "e7ccf9f4735baeb255e5ec0cef86bc231df10369b82e2db53eb51433d3318706"
    ]
}
```

You've successully notarized your first data! You can always share the PoE by using the `data explorer` here: https://proof.scryptachain.org/#/uuid/8d4e9ca5.8b7a.41d1.8010.738d8b371fb5

## [GET] /data/:hash

This endpoint will return an array of all notarized data by specific address. So in this case it will return:

```
[
    {
        "_id": "601a8222a6095d4a02b6fb81",
        "address": "LYeg8H28G7Sdq9EFofZtsncBHZ76Rvz1ZT",
        "uuid": "8d4e9ca5.8b7a.41d1.8010.738d8b371fb5",
        "collection": "",
        "refID": "",
        "protocol": "",
        "contract": "",
        "data": "hello world, again.",
        "txid": "e7ccf9f4735baeb255e5ec0cef86bc231df10369b82e2db53eb51433d3318706",
        "block": null,
        "is_file": false
    }
]
```