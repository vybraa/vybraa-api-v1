import { generate } from 'randomized-string';
import configuration from 'src/config/configuration';
import { PrismaService } from 'src/prisma/prisma.service';

export const brevoTemplateConfig = {
  Vybraa_Verify_Mail: 6,
  Celebrity_Request_Notification: 7,
  Dit_Verify_Mail: 2,
  Dit_Password_Reset_Mail: 3, // Add your password reset template ID
};

export const generateEmailVerificationToken = async () => {
  return generate({
    charset: 'number',
    length: 5,
  });
};

export const serializeAmount = (amount: number) => {
  return amount.toFixed(2);
};

export const generateFlutterwaveTransactionRef = async (length: number) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `flw_tx_ref_${result}`;
};
