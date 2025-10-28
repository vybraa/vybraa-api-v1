export enum MessageEnum {
  NEEDS_TO_VERIFY_EMAIL = 'needs_to_verify_email',
  VERIFICATION_TOKEN_SENT = 'verification_token_sent',
}

export enum FolderEnum {
  PROFILE = 'vybraa/profiles',
  CELEBRITY_PROFILE = 'vybraa/celebrity_profiles',
}

export enum PaymentChannelEnum {
  FLUTTERWAVE = 'flutterwave',
  PAYSTACK = 'paystack',
}

export enum TemplateConfigEnum {
  Celebrity_Approved_Notification = 10,
  Celebrity_Rejected_Notification = 11,
  Request_Completed_Notification = 9,
  Success_Request_Payment_Notification = 8,
  Vybraa_Verify_Mail = 6,
  Celebrity_Request_Notification = 7,
  Dit_Verify_Mail = 2,
  Dit_Password_Reset_Mail = 3,
}
