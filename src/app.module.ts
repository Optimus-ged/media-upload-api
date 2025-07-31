import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DocumentsModule } from './documents/documents.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', 'uploads', 'images'),
        serveRoot: '/images',
        useGlobalPrefix: true,
      },
      {
        rootPath: join(__dirname, '..', '', 'documents'),
        serveRoot: '/documents',
        useGlobalPrefix: true,
      },
    ),
    DocumentsModule,
    ImagesModule,
  ],
})
export class AppModule {}
