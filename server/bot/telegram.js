import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    console.log("TELEGRAM USER DATA")
    const chatId = msg.chat.id;
    const username = msg.from.username || 'Guest';
    console.log(chatId)
    console.log(username)

    bot.sendMessage(chatId, `Hello, ${username}! Click the button below to launch the tapping game.`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Launch App',
                        web_app: {
                            url: process.env.NODE_ENV == 'production' ? process.env.NODE_CLIENT_ORIGIN : process.env.NODE_CLIENT_LOCAL_ORIGIN
                        }
                    }
                ]
            ]
        }
    });
});

console.log('Telegram bot is running...');
