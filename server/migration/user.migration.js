import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js'; // Adjust the path to your User model
import { nanoid } from 'nanoid'; // Ensure to install nanoid for generating unique codes

dotenv.config();

// Connect to MongoDB
const generateUniqueReferralCode = async () => {
  let unique = false;
  let referralCode = '';

  // Loop until we generate a truly unique referral code
  while (!unique) {
    referralCode = nanoid(8); // Generate an 8-character code
    const existingUser = await User.findOne({ referralCode });
    if (!existingUser) {
      unique = true;
    }
  }

  return referralCode;
};

const migrateReferralCodes = async () => {
  try {
    // Find all users with a null or missing referralCode
    const usersWithoutReferralCode = await User.find({ referralCode: null });

    for (const user of usersWithoutReferralCode) {
      user.referralCode = await generateUniqueReferralCode();
      await user.save();
      console.log(`Updated referralCode for user: ${user.telegramId}`);
    }

    console.log('Migration for users with null referralCode completed.');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

const fixDuplicateReferralCodes = async () => {
  try {
    // Find all users and group by referralCode
    const usersWithReferralCodes = await User.aggregate([
      { $group: { _id: "$referralCode", count: { $sum: 1 }, users: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } } // Only find duplicates
    ]);

    for (const duplicate of usersWithReferralCodes) {
      const { users } = duplicate;
      // Skip the first user (keep its referralCode intact) and regenerate referralCode for others
      for (let i = 1; i < users.length; i++) {
        const userId = users[i];
        const user = await User.findById(userId);
        user.referralCode = await generateUniqueReferralCode();
        await user.save();
        console.log(`Updated duplicate referralCode for user: ${user.telegramId}`);
      }
    }

    console.log('Migration for duplicate referralCode completed.');
  } catch (error) {
    console.error('Error during duplicate referralCode migration:', error);
  }
};

// Migration entry point
const runMigration = async () => {
  await mongoose.connect('mongodb://localhost:27017/your-db-name', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await migrateReferralCodes();
  await fixDuplicateReferralCodes();

  console.log('All migrations completed.');
  mongoose.disconnect();
};

runMigration();
