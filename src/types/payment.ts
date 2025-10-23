export type FlutterwaveResponse<T> = {
  status: string;
  message: string;
  data: T;
};

export interface FlutterwaveTransaction {
  id: number;
  tx_ref: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  card: {
    first_6digits: string;
    last_4digits: string;
    issuer: string;
    type: string;
    country: string;
    token: string;
    expiry: string;
  };
  metadata: any;
}
