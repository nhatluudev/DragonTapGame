import mongoose from 'mongoose';

const tapSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  tapCount: { type: Number, default: 0 },
});

const Tap = mongoose.model('Tap', tapSchema);

export default Tap;
