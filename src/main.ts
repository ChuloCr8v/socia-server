import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://fda-server.onrender.com', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });
  // app.useGlobalPipes(new ValidationPipe());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  await app.listen(3000, "0.0.0.0");
}
bootstrap();
