import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CountryCode } from '../entities/country-code.entity';

@Injectable()
export class CountryCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CountryCode[]> {
    return this.prisma.countryCode.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<CountryCode | null> {
    return this.prisma.countryCode.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<CountryCode | null> {
    return this.prisma.countryCode.findUnique({
      where: { code },
    });
  }

  async findByDialCode(dialCode: string): Promise<CountryCode | null> {
    return this.prisma.countryCode.findFirst({
      where: { dialCode },
    });
  }

  async searchByName(name: string): Promise<CountryCode[]> {
    return this.prisma.countryCode.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        isActive: true,
      },
      orderBy: { name: 'asc' },
      take: 10,
    });
  }
}

