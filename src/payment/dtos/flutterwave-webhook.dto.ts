export class FlutterwaveCustomer {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export class FlutterwaveCard {
  first_6digits: string;
  last_4digits: string;
  issuer: string;
  country: string;
  type: string;
  token: string;
  expiry: string;
}

export class FlutterwaveWebhookData {
  id: number;
  tx_ref: string;
  flw_ref: string;
  device_fingerprint: string;
  amount: number;
  currency: string;
  charged_amount: number;
  app_fee: number;
  merchant_fee: number;
  processor_response: string;
  auth_model: string;
  ip: string;
  narration: string;
  status: string;
  payment_type: string;
  created_at: string;
  account_id: number;
  customer: FlutterwaveCustomer;
  card?: FlutterwaveCard;
  meta?: any;
  amount_settled?: number;
  tx_id?: number;
}

export class FlutterwaveWebhookDto {
  event: string;
  data: FlutterwaveWebhookData;
  'event.type'?: string;
}
