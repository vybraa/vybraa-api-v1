// export default () => ({
//   port: parseInt(process.env.PORT, 10) || 3000,
//   database: {
//     host: process.env.DATABASE_HOST,
//     port: parseInt(process.env.DATABASE_PORT, 10) || 5432
//   }
// });
export default () => ({
  environment: process.env.NODE_ENV || 'development',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
    region: process.env.AWS_REGION || 'eu-central-1',
    bucket: process.env.AWS_BUCKET_NAME || 'shopnest-vendor',
    s3Endpoint: process.env.AWS_S3_ENDPOINT,
    s3_api: process.env.S3_API,
    s3_public_api: process.env.S3_Public_API,
    s3ForcePathStyle: true,
  },
  meta: {
    meta_backend_url:
      process.env.META_BACKEND_URL || 'http://localhost:3011/meta/v1',
  },
  shopnest: {
    messaging_url: process.env.MESSAGING_URL || 'http://127.0.0.1:3002',
    domain: process.env.SHOPNEST_DOMAIN || 'https://staging5.shopnest.africa',
    domain_blog: process.env.SHOPNEST_DOMAIN_BLOG || 'https://shopnest.africa',
    paystack_secret_key: process.env.PAYSTACK_SECRET_KEY || '',
  },
  auth: {
    jwt: {
      secret:
        process.env.AUTH_JWT_SECRET ||
        '217021ec9192dd9982fce8a2d3884748e092520de386f8eeb936a41b216f5447656a16d9f4d59c2fec9ab911cde51b425ae56bf2b90c4f3c1cef95109be8d400',
      expirationTime: process.env.AUTH_JWT_EXPIRATION || '60000s',
    },
  },
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT as string, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'oisync-db',
  },
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || '123',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '123',
    callbackURL:
      process.env.INSTAGRAM_CALLBACK_URL ||
      'http://localhost:4200/instagram/basic-api-cb',
    tokenURL:
      process.env.INSTAGRAM_TOKEN_URL ||
      'https://api.instagram.com/oauth/access_token',
  },

  redis: {
    host: 'localhost',
    port: 6379,
    url: '127.0.0.1:6379',
  },
  facebook: {
    profileUrl:
      process.env.FACEBOOK_PROFILE_URL || 'https://graph.facebook.com/me',
    debugUrl:
      process.env.FACEBOOK_DEBUG_URL ||
      'https://graph.facebook.com/debug_token',
    appId: process.env.FACEBOOK_APP_ID || '815037957113168',
    appSecret: process.env.FACEBOOK_APP_SECRET || '-Jz1c0ZLXGo_mir_0cHQhEroxEo',
    appAppIdAndSecret:
      process.env.FACEBOOK_APP_ID_AND_SECRET ||
      '815037957113168|-Jz1c0ZLXGo_mir_0cHQhEroxEo',
    apiUrl: process.env.META_HOST || 'http://localhost:3009/meta/v1',
  },
  brevo: {
    apiUrl: 'https://api.brevo.com/v3',
    apiSecret: process.env.SMTP_API_KEY,
    name: process.env.SMTP_NAME || 'Vybraa Team',
    email: process.env.SMTP_EMAIL || 'admin@vybraa.com',
  },

  ipinfoUrl: process.env.IPINFO_URL || 'https://ipinfo.io',
  ipinfoToken: process.env.IPINFO_TOKEN || 'bc47a59f04d14c',
  baseUrl: process.env.BASE_URL || 'https://www.vybraa.com',
  baseCurrency: process.env.BASE_CURRENCY || 'USD',
  paymentChannel: process.env.PAYMENT_CHANNEL || 'paystack',
  flutterwave: {
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
    secretHash: process.env.FLUTTERWAVE_SECRET_HASH || '',
    flutterwaveUrl:
      process.env.FLUTTERWAVE_URL || 'https://api.flutterwave.cloud',
    flutterwaveApiKey: process.env.FLUTTERWAVE_API_KEY || '',
    fluuterwaveV3Url:
      process.env.FLUTTERWAVE_V3_URL || 'https://api.flutterwave.com/v3',
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    paystackUrl: process.env.PAYSTACK_URL || 'https://api.paystack.co',
  },
  notificationBackend: {
    apiUrl:
      process.env.NOTIFICATION_HOST || 'http://localhost:4000/channels/v1',
  },

  baseAmountSerializer:
    process.env.NODE_ENV === 'production'
      ? Number(process.env.BASE_AMOUNT_SERIALIZER || 100)
      : 1,
});
