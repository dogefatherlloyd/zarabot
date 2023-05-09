import Alpaca from '@alpacahq/alpaca-trade-api';
const alpaca = new Alpaca();

let wss;
let botStatus = false;

const startTradeBot = () => {
  console.log("Starting trade bot");
  wss = new WebSocket('wss://stream.data.alpaca.markets/v1beta1/news');

  wss.on('open', function () {
    console.log('Websocket connected!');

    const authMsg = {
      action: 'auth',
      key: process.env.APCA_API_KEY_ID,
      secret: process.env.APCA_API_SECRET_KEY,
    };

    wss.send(JSON.stringify(authMsg));

    const subscribeMsg = {
      action: 'subscribe',
      news: ['*'],
    };
    wss.send(JSON.stringify(subscribeMsg));
  });

  wss.on('message', async function (message) {
    console.log('Message is ' + message);

    const currentEvent = JSON.parse(message)[0];
    if (currentEvent.T === 'n') {
      let companyImpact = 0;
      const apiRequestBody = {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Only respond with a number from 1-100 detailing the impact of the headline.',
          },
          {
            role: 'user',
            content: `given the headline '${currentEvent.headline}', show me a number from 1-100 detailing the impact of this headline.`,
          },
        ],
      };

      await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody),
      })
        .then((data) => {
          return data.json();
        })
        .then((data) => {
          console.log(data);
          console.log(data.choices[0].message);
          companyImpact = parseInt(data.choices[0].message.content);
        });

      const tickerSymbol = currentEvent.symbols[0];

      if (companyImpact >= 70) {
        await alpaca.createOrder({
          symbol: tickerSymbol,
          qty: 1,
          side: 'buy',
          type: 'market',
          time_in_force: 'day',
        });
      } else if (companyImpact <= 30) {
        await alpaca.closePosition(tickerSymbol);
      }
    }
  });

  wss.on('close', function() {
    console.log('WebSocket closed');
  });

  return wss;
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const requestedStatus = req.body.status;
    console.log("Requested status:", requestedStatus);
    console.log("Current bot status:", botStatus);

    if (requestedStatus && !botStatus && !wss) {
      wss = startTradeBot();
      botStatus = true;
    } else if (!requestedStatus && botStatus && wss) {
      wss.close(1000, 'Trade bot stopped by user');
      wss = null;
      botStatus = false;
    }

    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ success: false, message: 'Method not supported' });
  }
};

export default handler;