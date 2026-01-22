import { CelebrityProfileType } from './profile';

export interface ExploreData {
  trendingCelebrities: CelebrityProfileType[];
  // Dynamic category keys from database
  [categoryName: string]: CelebrityProfileType[];
}
