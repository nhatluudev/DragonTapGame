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
// https://1500-2001-ee0-4cad-a1e0-c10f-cddd-605-fec1.ngrok-free.app
console.log(process.env.NODE_CLIENT_ORIGIN)
console.log(process.env.NODE_CLIENT_LOCAL_ORIGIN)
app.use(cors({
  origin: [process.env.NODE_ENV == 'production' ? process.env.NODE_CLIENT_ORIGIN : process.env.NODE_CLIENT_LOCAL_ORIGIN],
  credentials: true,
  methods: 'GET, POST, PUT, PATCH, DELETE',
}))

// Handle preflight (OPTIONS) requests
// app.options('*', cors());
// console.log(process.env.NODE_CLIENT_ORIGIN)
// console.log(process.env.NODE_CLIENT_LOCAL_ORIGIN)

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests from certain origins dynamically
//     const allowedOrigins = [
//       process.env.NODE_CLIENT_ORIGIN,        // Production URL
//       process.env.NODE_CLIENT_LOCAL_ORIGIN,  // Localhost or Dev URL
//     ];

//     // If origin is in the allowed origins list or is undefined (for non-browser clients like Postman), allow it
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
//   credentials: true,  // Enable credentials (cookies, authorization headers, etc.)
// }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecteddd'))
  .catch(err => console.log(err));

// Initialize the Telegram bot
// const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
// bot.on("polling_error", (error) => {
//   console.error(`Polling error: ${error.message}`);
// });
// bot.onText(/\/start/, (msg) => {
//   console.log("TELEGRAM USER DATA");
//   const chatId = msg.chat.id;
//   const username = msg.from.first_name || 'Guest';
//   console.log(chatId);
//   console.log(username);
//   console.log(process.env.NODE_CLIENT_ORIGIN);

//   // Send the image first
//   const imageUrl = 'https://cdn.coin68.com/images/20240318103532-8be611af-cdb0-4313-84b6-8e4f015f3707-160.jpg'; // Replace with a valid public image URL
//   bot.sendPhoto(chatId, imageUrl, {
//     caption: "",
//   }).then(() => {
//     // After sending the image, send the message content
//     const message = `Hi ${username}, chào mừng bạn đến với DragonTap!

// Tham gia tapping game để thu thập DRAS và nhận thưởng 
// 💰 1,000,000 DRAS hoàn toàn miễn phí
// 🏆 Hơn 1 tỷ tiền mặt
// 🌟 Kiếm lời khi niêm yết DRAS`;

//     bot.sendMessage(chatId, message, {
//       parse_mode: "Markdown", // To enable links and rich text formatting
//       reply_markup: {
//         inline_keyboard: [
//           [
//             {
//               text: '🚀 Chơi ngay',
//               web_app: {
//                 url: process.env.NODE_ENV === 'production' ? process.env.NODE_CLIENT_ORIGIN : process.env.NODE_CLIENT_LOCAL_ORIGIN,
//               },
//             },
//           ],
//         ],
//       },
//     });
//   }).catch((err) => {
//     console.error("Error sending photo:", err);
//   });
// });
// console.log('Telegram bot is runninggg...');



// Init routes
app.use('', router);

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on porttt ${PORT}`);
});