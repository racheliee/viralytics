import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import fastifyCors from '@fastify/cors'
import fastifyCookie from '@fastify/cookie'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )

  await app.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  })

  await app.register(fastifyCookie)

  app.setGlobalPrefix('api')
  await app.listen(3002)
}
bootstrap()
