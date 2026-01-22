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

export interface PaymentHistoryItem {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhotoUrl: string | null;
  };
  recipient: string;
  forName: string | null;
  fromName: string | null;
  occasion: string;
  instructions: string;
  price: string;
  currency: string;
  status: string;
  videoUrl: string | null;
  isRequestPaid: boolean;
  createdAt: string;
  celebrityProfile: {
    id: string;
    displayName: string;
    profilePhotoUrl: string | null;
    profession: string;
  };
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RequestSummary {
  totalRequests: number;
  totalPendingRequests: number;
  totalCompletedRequests: number;
  totalDeclinedRequests: number;
}
