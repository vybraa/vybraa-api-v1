import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestService } from 'src/request/request.service';
import { ExploreData } from 'src/types/explore';

@Injectable()
export class ProfileService {
  // Reusable select object for celebrity profiles
  private readonly celebritySelect = {
    id: true,
    displayName: true,
    requestPrice: true,
    requestPriceCurrency: true,
    category: true,
    profession: true,
    profilePhotoUrl: true,
  } as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly requestService: RequestService,
  ) {}

  async getMe(user: User, category: string): Promise<ExploreData> {
    // Fetch all active categories from database
    const categories = await this.prisma.category.findMany({
      where: { status: true },
      select: { id: true, name: true },
    });

    // Initialize metrics with trendingCelebrities and dynamic category keys
    const allExploreMetrics: ExploreData = {
      trendingCelebrities: [],
    };

    // Initialize all category keys
    for (const cat of categories) {
      allExploreMetrics[cat.name.toLowerCase()] = [];
    }

    if (category === 'all') {
      // Fetch trending and all category celebrities in parallel
      const [trending, ...categoryResults] = await Promise.all([
        this.fetchTrending(),
        ...categories.map((cat) => this.fetchByCategoryId(cat.id)),
      ]);

      allExploreMetrics.trendingCelebrities = trending;

      // Map results to their respective category names
      categories.forEach((cat, index) => {
        allExploreMetrics[cat.name.toLowerCase()] = categoryResults[index];
      });
    } else if (category === 'trending') {
      allExploreMetrics.trendingCelebrities = await this.fetchTrending();
    } else {
      // Find the matching category by name (case-insensitive)
      const matchingCategory = categories.find(
        (cat) => cat.name.toLowerCase() === category.toLowerCase(),
      );

      if (matchingCategory) {
        const results = await this.fetchByCategoryId(matchingCategory.id);
        allExploreMetrics[matchingCategory.name.toLowerCase()] = results;
      }
    }

    // Handle currency conversion for Nigerian users
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { ipAddressCountry: true },
    });

    if (userData?.ipAddressCountry?.toLowerCase() === 'ng') {
      await this.convertAllPricesToNGN(allExploreMetrics);
    }

    return allExploreMetrics;
  }

  private async fetchTrending() {
    return this.prisma.celebrityProfile.findMany({
      where: {
        isTrending: true,
        isUnderReview: false,
        reviewStatus: 'APPROVED',
        isOnboardingComplete: true,
      },
      select: this.celebritySelect,
      orderBy: { requestPrice: 'desc' },
      take: 10,
    });
  }

  private async fetchByCategoryId(categoryId: string) {
    return this.prisma.celebrityProfile.findMany({
      where: {
        categoryId,
        isUnderReview: false,
        reviewStatus: 'APPROVED',
        isOnboardingComplete: true,
      },
      select: this.celebritySelect,
    });
  }

  private async convertAllPricesToNGN(metrics: ExploreData): Promise<void> {
    // Collect all items from all categories (dynamic keys)
    const allItems = Object.values(metrics).flat();

    // Convert all prices in parallel
    await Promise.all(
      allItems.map(async (item) => {
        const convertedPrice =
          await this.requestService.handleCurrencyConversion(
            Number(item.requestPrice),
            'NGN',
          );
        item.requestPrice = convertedPrice as any;
        item.requestPriceCurrency = 'NGN';
      }),
    );
  }

  async getCelebrityProfile(id: string, user: User) {
    const celebrityProfile = await this.prisma.celebrityProfile.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        requestPrice: true,
        category: true,
        profession: true,
        profilePhotoUrl: true,
        requestPriceCurrency: true,
        additionalDescription: true,
        requests: true,
      },
    });
    if (!celebrityProfile) {
      throw new NotFoundException('Celebrity profile not found');
    }
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (userData.ipAddressCountry.toLowerCase() === 'ng') {
      const convertedRequestPrice =
        await this.requestService.handleCurrencyConversion(
          Number(celebrityProfile.requestPrice),
          'NGN',
        );
      celebrityProfile.requestPrice = convertedRequestPrice as any;
      celebrityProfile.requestPriceCurrency = 'NGN' as any;
    }
    return celebrityProfile;
  }
}
