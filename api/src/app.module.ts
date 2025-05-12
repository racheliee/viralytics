import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { ConfigService } from './config/config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV}.local`,
        `.env.local`,
        `.env.${process.env.NODE_ENV}`,
        `.env`
      ]
    }),
    AuthModule
  ],
  controllers: [],
  providers: [AppService, ConfigService]
})
export class AppModule {}
