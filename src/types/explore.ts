import { CelebrityProfileType } from './profile';

export interface ExploreData {
  trendingCelebrities: CelebrityProfileType[];
  singers: CelebrityProfileType[];
  influencers: CelebrityProfileType[];
  actors: CelebrityProfileType[];
  comedians: CelebrityProfileType[];
}
