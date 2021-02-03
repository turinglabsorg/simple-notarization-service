import { Injectable } from '@nestjs/common'
import { isMaster } from 'cluster'
const ScryptaCore = require('@scrypta/core')
require('dotenv').config()

@Injectable()
export class AppService {
  async getIdanodeStatus(): Promise<any> {
    const scrypta = new ScryptaCore
    scrypta.debug = true
    scrypta.staticnodes = true
    let status = await scrypta.get('/wallet/getinfo')
    return status;
  }

  async getIdentity(hash): Promise<any> {
    const scrypta = new ScryptaCore
    scrypta.staticnodes = true

    if (process.env.MAIN_WALLET !== undefined) {

      try {
        /**
         * Deriving path from requested hash using Core method:
         * https://scrypta.wiki/en/#/core/advanced-management#hashtopathhash-hardened--false
         */
        let hashtopath = await scrypta.hashtopath(hash)

        /**
         * Deriving key from mnemonic using Core method:
         * https://scrypta.wiki/en/#/core/advanced-management#derivekeyfrommnemonic-menmonic-index
         */

        let identity = await scrypta.deriveKeyFromMnemonic(process.env.MAIN_WALLET, hashtopath)
        identity.path = hashtopath

        return identity;
      } catch (e) {
        return { message: "Service errored, retry.", error: true }
      }

    } else {
      return { message: "Identity passphrase not found", error: true }
    }
  }

  async returnData(hash): Promise<any> {
    const scrypta = new ScryptaCore
    scrypta.debug = true
    scrypta.staticnodes = true

    try {

      /**
       * Returning identity using previous method
       */
      const identity = await this.getIdentity(hash)

      /**
       * Reading data from IdaNode using post endpoint:
       * https://scrypta.wiki/en/#/idanode/pdm#post-read
       */

      const data = await scrypta.post('/read', { address: identity.pub })

      if (data.data !== undefined) {
        return data.data;
      } else {
        return { message: "IdANode errored, retry.", error: true }
      }

    } catch (e) {
      return { message: "Service errored, retry.", error: true }
    }
  }
  async notarizeData(hash, data): Promise<any> {
    const scrypta = new ScryptaCore
    scrypta.debug = true

    try {

      let canWrite = true

      /**
       * Returning identity using previous method.
       */
      const identity = await this.getIdentity(hash)

      /**
       * Returning address balance using get endpoint:
       * https://scrypta.wiki/en/#/idanode/block-explorer#get-balanceaddress
       */
      const balance = await scrypta.get('/balance/' + identity.pub)

      /**
       * Checking if balance is enough, if not funding balance with master key.
       */
      if (balance.balance < 0.001) {

        /**
         * Deriving key with Core method:
         * https://scrypta.wiki/en/#/core/advanced-management#derivekeyfrommnemonic-menmonic-index
         */
        var master = await scrypta.deriveKeyFromMnemonic(process.env.MAIN_WALLET, 'm/0')

        /**
         * Funding address using Core method:
         * https://scrypta.wiki/en/#/core/addresses-management#fundaddressprivatekey-to-amount
         */
        canWrite = await scrypta.fundAddress(master.prv, identity.pub, 0.001)
        await scrypta.sleep(1500)

      }

      if (canWrite) {
        /**
         * Importing private key because we always need encrypted wallets by default:
         * https://scrypta.wiki/en/#/core/addresses-management#importprivatekeykey-password
         */
        let temporaryKey = await scrypta.importPrivateKey(identity.prv, '-', false)

        /**
         * Checking if data can be stringified because we must pass a string into write method.
         */
        try {
          data = JSON.stringify(data)
        } catch (e) {
          console.log('Data is a string.')
        }

        /**
         * Finally write the data using Core method:
         * https://scrypta.wiki/en/#/core/pdm#writepassword-metadata-collection---refid---protocol---key---uuid--
         */
        return await scrypta.write(temporaryKey.walletstore, '-', data)
      } else {
        return { message: "This address can't write right now, seems master address can't fund it.", master: master.pub, error: true }
      }

    } catch (e) {
      console.log(e)
      return { message: "Service errored, retry.", error: true }
    }
  }
}
