import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Finna medias API Documentation')
    .setDescription('API endpoints for Finna medias App')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addSecurityRequirements('access-token')
    .addServer('http://localhost:3000/v1/uploads', 'Local development server')
    .addServer(
      'https://finna-media.buy-one-store.com/v1/uploads',
      'Production server',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/api-docs', app, document);
  app.setGlobalPrefix('v1/uploads');
  await app.listen(3000);
}
bootstrap();
