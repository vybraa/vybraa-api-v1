import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Pagination } from 'src/types/pagination';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers(
    page: number,
    limit: number,
    search: string,
  ): Promise<Pagination<User>> {
    try {
      if (!this.prisma) {
        throw new Error('PrismaService is not injected properly');
      }

      // Ensure page and limit are numbers and validate them
      const pageNum = Number(page);
      const limitNum = Number(limit);

      if (isNaN(pageNum) || isNaN(limitNum)) {
        throw new BadRequestException('Page and limit must be valid numbers');
      }

      if (pageNum < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }

      if (limitNum < 1 || limitNum > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }

      const whereClause: Prisma.UserWhereInput = {};

      if (search) {
        whereClause.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const users = await this.prisma.user.findMany({
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        data: users,
        total: users.length,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      console.error('Error in getUsers:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get users: ${error.message}`,
      );
    }
  }

  async getMetrics(): Promise<any> {
    try {
      const userCount = await this.prisma.user.count();
      const categoryCount = await this.prisma.category.count();
      const celebrityCount = await this.prisma.celebrityProfile.count();
      const flutterwaveKeyCount = await this.prisma.flutterWaveKey.count();

      return {
        userCount,
        categoryCount,
        celebrityCount,
        flutterwaveKeyCount,
        revenue: 0,
        requests: 0,
      };
    } catch (error) {
      console.error('Error in getMetrics:', error);
      throw new InternalServerErrorException('Failed to get metrics');
    }
  }
}
