import ccxt from "ccxt";
import * as dotenv from "dotenv";

dotenv.config();

// ccxt = require('ccxt')

//>>>>>>>>>>>>>>>>>>>>>>>>>>>live exchange<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
//..............................................................................
//

export const exchangeBinance = new ccxt.binanceusdm({
  apiKey: process.env.APP_BINANCE_API_KEY,
  secret: process.env.APP_BINANCE_SECRET,
  enableRateLimit: true,
});

//>>>>>>>>>>>>>>>>>>>>>>>>>>>testnet<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
//..............................................................................

// export const exchangeBinance = new ccxt.binanceusdm({
//   apiKey: config.apikey,
//   secret: config.secret,
//   enableRateLimit: true,
//   //type: 'future',
//   //testnet:true
// });

// (exchangeBinance as any).setSandboxMode(true);

// export const publicBinance = new ccxt.binanceusdm();

// (publicBinance as any).setSandboxMode(true);  // this probably not required
