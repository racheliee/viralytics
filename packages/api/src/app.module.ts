import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { ConfigService } from './config/config.service'
import { InstagramService } from './modules/instagram/instagram.service'
import { InstagramController } from './modules/instagram/instagram.controller'
import { InstagramModule } from './modules/instagram/instagram.module'
import { ModelModule } from './modules/model/model.module';

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
    AuthModule,
    InstagramModule,
    ModelModule
  ],
  controllers: [],
  providers: [AppService, ConfigService, InstagramService]
})
export class AppModule {}
