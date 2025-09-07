import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  // Legacy Mongo config kept for reference; not used after MySQL migration
  database: {
    url: process.env.DATABASE_URL,
    dbName: process.env.DB_NAME,
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'insuppent',
    logging: process.env.MYSQL_LOGGING === 'true',
  },
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 12,
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expires_in: process.env.JWT_EXPIRES_IN || '7d',
    refresh_secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  frontendUrl: process.env.FRONTEND_URL,
  // WordPress SSO
  wpOauthAuthorize: process.env.WP_OAUTH_AUTHORIZE,
  wpOauthToken: process.env.WP_OAUTH_TOKEN,
  wpOauthMe: process.env.WP_OAUTH_ME,
  wpClientId: process.env.WP_CLIENT_ID,
  wpClientSecret: process.env.WP_CLIENT_SECRET,
  wpRedirectUri: process.env.WP_REDIRECT_URI,
  woocommerce: {
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  },

  wpBaseUrl: process.env.WP_BASE_URL || 'https://staging2.insuppent.com',
  wpLoginUrl: process.env.WP_LOGIN_URL || 'https://staging2.insuppent.com/wp-login.php',
};
