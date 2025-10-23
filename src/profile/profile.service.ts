import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestService } from 'src/request/request.service';
import { ExploreData } from 'src/types/explore';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestService: RequestService,
  ) {}
  async getMe(user: User, category: string): Promise<Partial<ExploreData>> {
    const allExploreMetrics: ExploreData = {
      trendingCelebrities: [],
      singers: [],
      influencers: [],
      actors: [],
      comedians: [],
    };
    const singersRelation = [
      'artist',
      'artists',
      'singer',
      'rapper',
      'songwriter',
    ];

    const influencersRelation = [
      'influencer',
      'influencers',
      'content creator',
      'content creators',
    ];

    const actorsRelation = [
      'actor',
      'actors',
      'director',
      'directors',
      'producer',
    ];

    const comediansRelation = ['comedian', 'comedians', 'comedy', 'comedies'];

    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (category === 'all') {
      allExploreMetrics.trendingCelebrities =
        await this.prisma.celebrityProfile.findMany({
          where: {
            isTrending: true,
          },
          select: {
            id: true,
            displayName: true,
            requestPrice: true,
            category: true,
            requestPriceCurrency: true,
            profession: true,
            profilePhotoUrl: true,
          },
          orderBy: {
            requestPrice: 'desc',
          },
          take: 10,
        });

      allExploreMetrics.singers = await this.prisma.celebrityProfile.findMany({
        where: {
          category: {
            name: {
              in: singersRelation,
            },
          },
        },
        select: {
          id: true,
          displayName: true,
          requestPrice: true,
          requestPriceCurrency: true,
          category: true,
          profession: true,
          profilePhotoUrl: true,
        },
      });

      allExploreMetrics.influencers =
        await this.prisma.celebrityProfile.findMany({
          where: {
            category: {
              name: {
                in: influencersRelation,
              },
            },
          },
          select: {
            id: true,
            displayName: true,
            requestPrice: true,
            requestPriceCurrency: true,
            category: true,
            profession: true,
            profilePhotoUrl: true,
          },
        });

      allExploreMetrics.actors = await this.prisma.celebrityProfile.findMany({
        where: {
          category: {
            name: {
              in: actorsRelation,
            },
          },
        },
        select: {
          id: true,
          displayName: true,
          requestPrice: true,
          requestPriceCurrency: true,
          category: true,
          profession: true,
          profilePhotoUrl: true,
        },
      });

      allExploreMetrics.comedians = await this.prisma.celebrityProfile.findMany(
        {
          where: {
            category: {
              name: {
                in: comediansRelation,
              },
            },
          },
          select: {
            id: true,
            displayName: true,
            requestPrice: true,
            requestPriceCurrency: true,
            category: true,
            profession: true,
            profilePhotoUrl: true,
          },
        },
      );
    }

    if (category === 'trending') {
      allExploreMetrics.trendingCelebrities =
        await this.prisma.celebrityProfile.findMany({
          where: {
            isTrending: true,
          },
          select: {
            id: true,
            displayName: true,
            requestPrice: true,
            requestPriceCurrency: true,
            category: true,

            profession: true,
            profilePhotoUrl: true,
          },
        });
    }

    if (category === 'artists') {
      allExploreMetrics.singers = await this.prisma.celebrityProfile.findMany({
        where: {
          category: {
            name: {
              in: singersRelation,
            },
          },
        },
        select: {
          id: true,
          displayName: true,
          requestPrice: true,
          requestPriceCurrency: true,
          category: true,
          profession: true,
          profilePhotoUrl: true,
        },
      });
    }

    if (category === 'influencers') {
      allExploreMetrics.influencers =
        await this.prisma.celebrityProfile.findMany({
          where: {
            category: {
              name: {
                in: influencersRelation,
              },
            },
          },
          select: {
            id: true,
            displayName: true,
            requestPrice: true,
            requestPriceCurrency: true,
            category: true,
            profession: true,
            profilePhotoUrl: true,
          },
        });
    }

    if (category === 'actors') {
      allExploreMetrics.actors = await this.prisma.celebrityProfile.findMany({
        where: {
          category: {
            name: {
              in: actorsRelation,
            },
          },
        },
        select: {
          id: true,
          displayName: true,
          requestPrice: true,
          requestPriceCurrency: true,
          category: true,
          profession: true,
          profilePhotoUrl: true,
        },
      });
    }

    if (category === 'comedians') {
      const comedians = await this.prisma.celebrityProfile.findMany({
        where: {
          category: {
            name: {
              in: comediansRelation,
            },
          },
        },
        select: {
          id: true,
          displayName: true,
          requestPrice: true,
          requestPriceCurrency: true,
          category: true,
          profession: true,
          profilePhotoUrl: true,
        },
      });

      if (userData.ipAddressCountry === 'ng') {
        comedians.forEach(async (comedian) => {
          const convertedRequestPrice =
            await this.requestService.handleCurrencyConversion(
              Number(comedian.requestPrice),
              'NGN',
            );
          comedian.requestPrice = convertedRequestPrice as any;
        });
      }

      allExploreMetrics.comedians = comedians;
    }

    //  const category = await this.prisma.category.findFirst({
    //     where: {
    //       name: {
    //         in: [category],

    //       },
    //     },
    //   });
    //   if (category) {
    //     allExploreMetrics.singers = category.celebrityProfile;
    //   }
    if (userData.ipAddressCountry.toLowerCase() === 'ng') {
      const keys = Object.keys(allExploreMetrics);

      for (const key of keys) {
        for await (const item of allExploreMetrics[key]) {
          const convertedRequestPrice =
            await this.requestService.handleCurrencyConversion(
              Number(item.requestPrice),
              'NGN',
            );

          item.requestPrice = convertedRequestPrice as any;
          item.requestPriceCurrency = 'NGN';
        }
      }
    }

    return allExploreMetrics;
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
