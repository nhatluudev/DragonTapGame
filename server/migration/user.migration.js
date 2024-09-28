import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js'; // Adjust the path to your User model

dotenv.config();

// Connect to MongoDB
const updateUserDefaults = async () => {
  try {
    // Find all users (no conditions to filter based on missing fields)
    const usersToUpdate = await User.find({});

    for (const user of usersToUpdate) {
      // Set the default values if they are missing
      if (user.lastTenMinCheckIn === undefined || user.lastTenMinCheckIn === null) {
        user.lastTenMinCheckIn = null;
      }
      if (user.isInCommunity === undefined || user.isInCommunity === null) {
        user.isInCommunity = false;
      }
      if (user.isKyc === undefined || user.isKyc === null) {
        user.isKyc = false;
      }
      if (user.namiId === undefined || user.namiId === null) {
        user.namiId = "";
      }

      // Set tokens to 1000 for all users
      user.tokens = 1000;

      // Save the updated user
      await user.save();
      console.log(`Updated user: ${user._id}`);
    }

    console.log('User defaults migration completed.');
  } catch (error) {
    console.error('Error during user defaults migration:', error);
  }
};

// Migration entry point
const runMigration = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await updateUserDefaults();

  console.log('All migrations completed.');
  mongoose.disconnect();
};

runMigration();