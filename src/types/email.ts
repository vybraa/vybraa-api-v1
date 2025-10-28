import { TemplateConfigEnum } from 'src/utils/enum';

export type EmailTemplateValueType = {
  [TemplateConfigEnum.Celebrity_Request_Notification]: {
    celebrityName: string;
    fromName: string;
    forName: string;
    occasion: string;
    currency: string;
    price: string;
    instruction: string;
  };

  [TemplateConfigEnum.Success_Request_Payment_Notification]: {
    celebrityName: string;
    fanName: string;
    occasion: string;
    currency: string;
    paymentRef: string;
    requestId: string;
    amount: string;
  };

  [TemplateConfigEnum.Request_Completed_Notification]: {
    celebrityName: string;
    fanName: string;
    forName: string;
    occasion: string;
    requestId: string;
  };

  [TemplateConfigEnum.Celebrity_Approved_Notification]: {
    celebrityName: string;
  };
};
