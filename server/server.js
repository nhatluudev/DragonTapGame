// import express from 'express';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
// import dotenv from 'dotenv';
// import cors from 'cors';

// import './bot/telegram.js'; // Import and initialize your Telegram bot
// import router from './routes/index.js';

// dotenv.config();

// const app = express();
// app.use(bodyParser.json());
// app.use(cors({
//   origin: [process.env.NODE_ENV == 'production' ? process.env.NODE_CLIENT_ORIGIN : process.env.NODE_CLIENT_LOCAL_ORIGIN],
//   methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
//   credentials: true,
// }))

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

// // Init routes
// app.use('', router)

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api'; // Import TelegramBot

import router from './routes/index.js';

dotenv.config();

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(cors({
  origin: [process.env.NODE_ENV === 'production' ? process.env.NODE_CLIENT_ORIGIN : process.env.NODE_CLIENT_LOCAL_ORIGIN],
  methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
  credentials: true,
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecteddd'))
  .catch(err => console.log(err));

// Initialize the Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  console.log("TELEGRAM USER DATA");
  const chatId = msg.chat.id;
  const username = msg.from.username || 'Guest';
  console.log(chatId);
  console.log(username);
  console.log(process.env.NODE_CLIENT_ORIGIN)

  bot.sendMessage(chatId, `Hello, ${username}! Click the button below to launch the tapping game.`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Launch App',
            web_app: {
              url: process.env.NODE_ENV === 'production' ? process.env.NODE_CLIENT_ORIGIN : process.env.NODE_CLIENT_LOCAL_ORIGIN,
            },
          },
        ],
      ],
    },
  });
});

console.log('Telegram bot is runninggg...');

// Init routes
app.use('', router);

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on porttt ${PORT}`);
});