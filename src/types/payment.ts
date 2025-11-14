export type FlutterwaveResponse<T> = {
  status: string;
  message: string;
  data: T;
};

export type PaymentResponseType<T> = {
  message: string;
  status: boolean;
  data: T;
};

export type TransferRecipientResponseType = {
  recipient_code: string;
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

export interface BankListType {
  code: string;
  country: string;
  currency: string;
  name: string;
  support_transfer: boolean;
}

export interface AccountResolutionResponse {
  account_number: string;
  bank_code: string;
  account_name: string;
  bank_name: string;
}
