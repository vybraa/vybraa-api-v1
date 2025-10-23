export interface CelebrityRequest {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhotoUrl: string;
  };
  recipient: string;
  forName: string;
  fromName?: string | null;
  occasion: string;
  instructions: string;
  price: string;
  currency: string;
  status: string;
  celebrityProfile?: {
    id: string;
    displayName: string;
    profilePhotoUrl: string;
    profession: string;
  };
}

export interface RequestSummary {
  totalRequests: number;
  totalPendingRequests: number;
  totalCompletedRequests: number;
  totalDeclinedRequests: number;
}
