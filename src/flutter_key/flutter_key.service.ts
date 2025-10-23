import { Injectable, NotFoundException } from '@nestjs/common';
import { FlutterWaveKey } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateFlutterKeyDto,
  UpdateFlutterKeyDto,
} from './dtos/flutter-key.dto';

@Injectable()
export class FlutterKeyService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllFlutterKeys(): Promise<FlutterWaveKey[]> {
    return this.prisma.flutterWaveKey.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFlutterKeyById(id: string): Promise<FlutterWaveKey> {
    const flutterKey = await this.prisma.flutterWaveKey.findUnique({
      where: { id },
    });

    if (!flutterKey) {
      throw new NotFoundException(`Flutterwave key with ID ${id} not found`);
    }

    return flutterKey;
  }

  async createFlutterKey(
    createFlutterKeyDto: CreateFlutterKeyDto,
  ): Promise<FlutterWaveKey> {
    return this.prisma.flutterWaveKey.create({
      data: createFlutterKeyDto,
    });
  }

  async updateFlutterKey(
    id: string,
    updateFlutterKeyDto: UpdateFlutterKeyDto,
  ): Promise<FlutterWaveKey> {
    await this.getFlutterKeyById(id); // Check if key exists

    return this.prisma.flutterWaveKey.update({
      where: { id },
      data: updateFlutterKeyDto,
    });
  }

  async deleteFlutterKey(id: string): Promise<void> {
    await this.getFlutterKeyById(id); // Check if key exists

    await this.prisma.flutterWaveKey.delete({
      where: { id },
    });
  }
}
