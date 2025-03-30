const TelegramBot = require('node-telegram-bot-api');
const axios = require("axios");
const token = '7932955419:AAGotXY-CrZo1Nod9V5C0B80KcjDaZSdNTg';
const bot = new TelegramBot(token,{polling:true});

let symbolMessage = "";

async function getSymbolListMessage() {
  let symbolMessage = "";
  const response = await axios.get("https://api.nobitex.net/v2/orderbook/all");
  for (symbol in response.data) {
    symbolMessage += ` ${symbol}
    `;
  }
  console.log("symbols fetched");
  return symbolMessage;
}
getSymbolListMessage();

async function getPrice(symbol) {
    const to = Math.floor(Date.now() / 1000);
    const from = to - 86400;
    const response = await axios.get(`https://api.nobitex.ir/market/udf/history?symbol=${symbol}&resolution=D&from=${from}&to=${to}`);
    console.log(response.data);
    if(response.data['s'] == 'ok') {
        return response.data['c'];
    }
};

let checkingSymbolRegex = /irt$/i;
bot.on("text", async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;
  let notControllerMwssage = true;

  if (userMessage == "/start") {
    notControllerMwssage = false;
    bot.sendMessage(chatId, "به ربات قیمت لحظه ای نوبیتکس خوش آمدید.", {
        reply_markup: {
            keyboard: [
                [{text: 'لیست نماد ها'}]
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
        }
    });
  }

  if (userMessage == 'لیست نماد ها') {
    notControllerMwssage = false;
    bot.sendMessage(chatId, symbolMessage);
  }

  if (checkingSymbolRegex.test(userMessage)) {
    notControllerMwssage = false;
    getPrice(userMessage);
    bot.sendMessage(chatId, `قیمت نماد مورد نظر ${price} است.`);
  }

  if (notControllerMwssage) {
    bot.sendMessage(chatId, "لطفا از دستورات موجود استفاده کنید.");
  }

});
