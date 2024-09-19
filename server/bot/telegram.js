import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    console.log(msg)
  const chatId = msg.chat.id;
  const username = msg.from.username || 'Guest'; // Fallback if username is undefined
  const telegramId = msg.from.id;

  // Send a message with a Web App button to launch the mini app inside Telegram
  bot.sendMessage(chatId, `Hello, ${username}! Click the button below to launch the tapping game.`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Launch App Hereee',
            web_app: {
              url: `https://dragontapgame-fe.onrender.com/tapgame`, // Point to your deployed app
            }
          }
        ]
      ]
    }
  });
});

console.log('Telegram bot is running...');