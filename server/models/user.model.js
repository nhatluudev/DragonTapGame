import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    tokens: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, required: true },
    loginStreak: {
        type: Number,
        default: 0,
    },
    lastLoginDate: {
        type: Date,
        default: null,
    },
    lastTenMinCheckIn: { type: Date, default: null }, // For the 10-minute mission
    isInCommunity: { type: Boolean, default: false },
    isKyc: { type: Boolean, default: false },
    namiId: { type: String, default: "" },
});

const User = mongoose.model('User', userSchema);

export default User;
