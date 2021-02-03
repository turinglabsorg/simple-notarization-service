import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getIdanodeStatus(): Promise<string> {
    return this.appService.getIdanodeStatus();
  }

  @Get('identity/:hash')
  async getIdentity(@Request() request): Promise<Object> {
    if(request.params.hash !== undefined && request.params.hash.length === 64){
      return await this.appService.getIdentity(request.params.hash)
    }else{
      return JSON.stringify({
        error: true,
        message: "*hash* is required."
      })
    }
  }

  @Get('data/:hash')
  async returnData(@Request() request): Promise<Object> {
    if(request.params.hash !== undefined && request.params.hash.length === 64){
      return await this.appService.returnData(request.params.hash)
    }else{
      return JSON.stringify({
        error: true,
        message: "*hash* is required."
      })
    }
  }

  @Post('notarize')
  async notarizeData(@Body() request): Promise<Object> {
    if(request.hash !== undefined && request.data !== undefined){
      return await this.appService.notarizeData(request.hash, request.data)
    }else{
      return JSON.stringify({
        error: true,
        message: "*hash* and *data* are required."
      })
    }
  }

}
