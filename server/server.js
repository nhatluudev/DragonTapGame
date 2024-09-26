import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

import './bot/telegram.js'; // Import and initialize your Telegram bot
import router from './routes/index.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: [process.env.NODE_ENV == 'production' ? process.env.NODE_CLIENT_ORIGIN : process.env.NODE_CLIENT_LOCAL_ORIGIN],
  methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
  credentials: true,
}))

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Init routes
app.use('', router)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});