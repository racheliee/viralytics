import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { ConfigService } from '@nestjs/config'

@Module({
  controllers: [AuthController],
  providers: [AuthService, ConfigService]
})
export class AuthModule {}
