# WebhookToExchange

forwards webhook to crypto exchange using express and ccxt

```
How to run:

1. set environment variables on the plateform
    set values of:
    APP_EXCHANGE_API_KEY = "your-api-key"
    APP_EXCHANGE_SECRET = "your-api-secret"
    APP_TV_WEBHOOK_KEY = ":webhook_key"
    (webhook_key can be a random string, eg: gRVlsdYdTASdjhMv)

2. use command to run: npx ts-node app.ts

3. set preferred port (or use standard 8000)

4. deploy app server and get a link to forward webhook to
   send webhook to: your-link/tv-to-exchange/:webhook_key

5. in TradingView, use webhook format:

{
"order_symbol": "{{ticker}}",
"order_side": "{{strategy.order.action}}",
"order_qty": {{strategy.order.contracts}},
"order_price": {{strategy.order.price}},
"order_direction": "{{strategy.market_position}}"
}

```
```
Points to note:

1. code is currently set up for Binance USDM exchange
2. uses market order only for simplicity and reliability
3. ticker name is formatted as required by the exchange
4. whole position is closed when order_direction is 'flat' in webhook signal
5. init-exchange.ts and ticker formatting in app.ts can be modified to work with any other exchange

```
```
Options of basic security:

1. whitelist IP addresses (include local IP for manual signals) (code commented out currently)
2. use a webhook key (current)
3. none (relying on link and webhook format compatibility)

```
