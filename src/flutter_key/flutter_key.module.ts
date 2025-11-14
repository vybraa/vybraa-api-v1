import { Module } from '@nestjs/common';
import { FlutterKeyService } from './flutter_key.service';
import { FlutterKeyController } from './flutter_key.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FlutterKeyController],
  providers: [FlutterKeyService, JwtService],
  exports: [FlutterKeyService],
})
export class FlutterKeyModule {}
