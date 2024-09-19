import express from 'express';
import Tap from '../models/tap.model.js';
const router = express.Router();

// Start tap game for the user
router.post('/start', async (req, res) => {
  const { telegramId, username } = req.body;

  let user = await Tap.findOne({ telegramId });
  if (!user) {
    user = new Tap({ telegramId, username });
    await user.save();
  }

  res.json({ message: `Hello, ${username}! Your current tap count is ${user.tapCount}` });
});

// Increment tap count
router.post('/tap', async (req, res) => {
  const { telegramId } = req.body;

  const user = await Tap.findOneAndUpdate(
    { telegramId },
    { $inc: { tapCount: 1 } },
    { new: true }
  );

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: `You tapped! Current tap count: ${user.tapCount}` });
});

// Retrieve tap count
router.get('/:telegramId', async (req, res) => {
  const { telegramId } = req.params;

  const user = await Tap.findOne({ telegramId });
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ tapCount: user.tapCount });
});

export default router;
