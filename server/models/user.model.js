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
    referredBy: { type: String, default: "" }, // Store telegram id of the referral user
    lastTenMinCheckIn: { type: Date, default: null }, // For the 10-minute mission
    isInCommunity: { type: Boolean, default: false },
    isKyc: { type: Boolean, default: false },
    namiId: { type: String, default: "" },
    missions: {
        telegramReaction: {
            status: { type: String, default: 'pending' }, // Values: 'pending', 'checking', 'rewarded'
            lastCheckTime: { type: Date, default: null },
        },
        telegramNamiReaction: {
            status: { type: String, default: 'pending' },
            lastCheckTime: { type: Date, default: null },
        },
        facebookReaction: {
            status: { type: String, default: 'pending' },
            lastCheckTime: { type: Date, default: null },
        },
        facebookFanpageReaction: {
            status: { type: String, default: 'pending' },
            lastCheckTime: { type: Date, default: null },
        },
        facebookNamiFanpageReaction: {
            status: { type: String, default: 'pending' },
            lastCheckTime: { type: Date, default: null },
        },
        joinTelegramGroup: {
            status: { type: String, default: 'pending' },
            lastCheckTime: { type: Date, default: null },
        },
    },
});

const User = mongoose.model('User', userSchema);

export default User;
