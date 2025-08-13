import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let port = 3000;
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Documentation API - Bookstore')
    .setDescription('API documentation for the bookstore application')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  port = process.env.APPLICATION_PORT ? +process.env.APPLICATION_PORT : port;
  await app.listen(port);
}

bootstrap()
  .then(() => console.log(`Server is running on port ${port}`))
  .catch((err) => console.error(err));
