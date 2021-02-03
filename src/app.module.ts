import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
const fs = require('fs')
const ScryptaCore = require('@scrypta/core')

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('Checking if .env file exists and have a mnemonic inside.')
    if (process.env.MAIN_WALLET === undefined) {
      console.log('Master mnemonic not found, creating.')
      const scrypta = new ScryptaCore
      scrypta.staticnodes = true
      scrypta.generateMnemonic().then(mnemonic => {
        fs.writeFileSync('.env', "MAIN_WALLET=" + mnemonic)
        console.log('Mnemonic generated successfully, please restart the process now.')
        process.exit(1);
      })
    }
  }
}
