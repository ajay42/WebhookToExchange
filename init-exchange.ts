import ccxt from "ccxt";
import * as dotenv from "dotenv";

dotenv.config();

//..............................................................................
// using environment variables

export const exchangeBinance = new ccxt.binanceusdm({
  apiKey: process.env.APP_EXCHANGE_API_KEY,
  secret: process.env.APP_EXCHANGE_SECRET,
  enableRateLimit: true,
});

//..............................................................................
// simpler way

// export const exchangeBinance = new ccxt.binanceusdm({
//   apiKey: your-api-key-here,
//   secret: your-api-secret-here,
//   enableRateLimit: true,
// });
