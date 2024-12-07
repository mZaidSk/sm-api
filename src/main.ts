import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // List of allowed origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allowed methods
    credentials: true, // Allow credentials like cookies
  });

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
