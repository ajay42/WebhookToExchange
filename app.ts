import bodyParser from "body-parser";
import express from "express";
import { exchangeBinance } from "./init-exchange";
import { config } from "./config";
const app = express();

const server = app.listen(config.serverPort, "0.0.0.0", function () {
  const host = (server.address() as any).address;
  const port = (server.address() as any).port;

  console.log("Listening at http://%s:%s", host, port);
});

// app.use((req, res, next) => {
//   const ip = String(
//     req.headers["x-forwarded-for"] || req.socket.remoteAddress || ""
//   )
//     .split(",")[0]
//     .trim();
//   // console.log("Incoming from:", ip);
//   console.log(
//     ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>new request<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
//   );

//   // check for whitelisted IP
//   if (!config.whitelist.includes(ip)) {
//     // Invalid ip
//     console.log("Bad IP: ", ip, "Throw 403");
//     res.status(403).send();
//   } else {
//     console.log("webhook recieved from IP: ", ip);
//     next();
//   }
// });

// Use json body parser
// app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req, res, next) => {
  res.send("Hello, world! All works!");
});

// Webhook should be received as POST
app.post("/tradingview-listener/:webhook_key", async function (req, res) {
  //:webhook_key is any random string, set as enviornment variable, same as
  const webhookKey = process.env.APP_TRADINGVIEW_WEBHOOK_KEY;
  if (!webhookKey) {
    res.send("Webhook key is blank!");
    return;
  }

  if (req.params.webhook_key != webhookKey) {
    res.status(401);
    res.send("Webhook Source Not Authorised!");
    return;
  }

  // get request body
  const webhook_data = req.body;
  // console.log("Webhook received", webhook_data, Date());

  const order_symbol = String(webhook_data.order_symbol).replace("PERP", "");
  const order_side = webhook_data.order_side;
  const order_qty = webhook_data.order_qty;
  const order_price = webhook_data.order_price;
  let position_direction = webhook_data.order_direction;

  let responses: any;

  //'flat position_side is essentially closing last open position
  //manually close any dust position on the exchange

  if (position_direction === "flat") {
    switch (order_side) {
      case "buy":
        position_direction = "SHORT";
        break;
      case "sell":
        position_direction = "LONG";
        break;
    }
    responses = await clearPosition(
      order_symbol,
      order_side,
      order_price,
      position_direction
    );
  } else {
    responses = await executeStrategy(
      order_symbol,
      order_side,
      order_qty,
      order_price,
      position_direction
    );
  }
  return res.json(responses);
});

const executeStrategy = async (
  order_symbol: string,
  order_side: "buy" | "sell",
  order_qty: number,
  order_price: number,
  position_direction: string
) => {
  // to convert the incoming strings" symbol, direction, side from the TV format to Binance format
  // const [asset, quote] = order_symbol.split("/");

  try {
    console.log(">>new request<<");
    console.log(
      `placed :${order_symbol}${position_direction}${order_qty}${order_side}`,
      Date().toLocaleString()
    );
    const order = await exchangeBinance.createMarketOrder(
      order_symbol,
      order_side,
      order_qty,
      order_price,
      {
        positionSide: position_direction,
      }
    );
    // if (!order) {
    //   throw new Error(exchangeBinance.id + " error passing order");
    // }

    console.log("exchnage response: ", order);
    return order.status;
    // return {
    //   position_direction,
    //   order_qty,
    //   order_side,
    //   order_symbol,
    // };
  } catch (error) {
    console.log("the caught error at executeStretegy method :\n", error);
    // console.error(
    //   //"useUnknownInCatchVariables": false to avoid error: Unknown type
    //   exchangeBinance.id,
    //   error.constructor.name,
    //   error.message //.split("\n")[0].slice(0, 100)
    // );
  }
};

//need to clear dust positions before starting a new cycle

const clearPosition = async (
  order_symbol: string,
  order_side: "buy" | "sell",
  order_price: number,
  position_side: string
) => {
  // const positions_detail = await exchangeBinance.fetchBalance();
  // console.log(
  //   "fetchBalance returems: ",
  //   JSON.stringify(positions_detail, undefined, 2)
  // );

  try {
    let arr_symbol: string[] = [order_symbol];
    const symbol_pos = await exchangeBinance.fetchPositionsRisk(arr_symbol, {
      position_side,
    });

    let i: number = 0;
    for (i = 0; i < 4; i++) {
      if (symbol_pos[i].info.positionSide === position_side) break;
    }
    let _qty = Math.abs(symbol_pos[i].info.positionAmt);
    if (_qty != 0) {
      console.log(
        "closing whole/dust position, amount is: ",
        symbol_pos[i].info.positionAmt,
        order_symbol,
        position_side
      );

      // let o_side: "buy" | "sell" = "sell";
      // if (position_side === "SHORT") o_side = "buy";

      await exchangeBinance.createMarketOrder(
        order_symbol,
        order_side,
        _qty,
        order_price,
        { positionSide: position_side }
      );
    }
  } catch (error) {
    console.log("caught error @ closePosition method :\n", error);
  }
};
