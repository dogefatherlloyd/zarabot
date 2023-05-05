const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = new Alpaca();
const WebSocket = require ('ws');


const wss = new WebSocket("wss://stream.data.alpaca.markets/v1beta1/news");

wss.on('open', function() {
  console.log("Websocket connected!");

  const authMsg = {
    action: 'auth',
    key: process.env.APCA_API_KEY_ID,
    secret: process.env.APCA_API_SECRET_KEY
  };

  wss.send(JSON.stringify(authMsg));

  const subscribeMsg = {
    action: 'subscribe',
    news: ['*']
  };
  wss.send(JSON.stringify(subscribeMsg));
});

  wss.on('message', async function(message) {
    console.log("Message is " + message);

    const currentEvent = JSON.parse(message)[0];
    if (currentEvent.T === "n") {
      let companyImpact = 0;
      const apiRequestBody = {
        "model": "gpt-4",
        "messages": [
          { role: "system", content: "Only respond with a number from 1-100 detailing the impact of the headline."},
          { role: "user", content: "given the headline '" + currentEvent.headline + "', show me a number from 1-100 detailing the impact of this headline."}
        ]
      }

      await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      }).then((data) => {
        return data.json();
      }).then((data) => {
        console.log(data);
        console.log(data.choices[0].message);
        companyImpact = parseInt(data.choices[0].message.content);
      });

      const tickerSymbol = currentEvent.symbols[0];

      //from here logic adjust

      if(companyImpact >= 70) {

        let order = await alpaca.createOrder ({
          symbol: tickerSymbol,
          qty: 1,
          side: 'buy',
          type: 'market',
          time_in_force: 'day'
        });

      } else if (companyImpact <= 30) {
        let closePosition = alpaca.closePosition(tickerSymbol);
      }

    }  

  });