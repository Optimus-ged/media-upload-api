import { Module } from '@nestjs/common';
import { ImagesModule } from './images/images.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads', 'images'),
      serveRoot: '/images',
      useGlobalPrefix: true,
    }),
    ImagesModule,
  ],
})
export class AppModule {}
