import { nanoid } from 'nanoid';
import fetch from 'node-fetch';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
import User from "../models/user.model.js";
import { formatFloat, formatNamiId } from '../utils/formatter.js';
import moment from 'moment-timezone';

class UserController {
    getCurrentTimeInVietnam() {
        return moment().tz('Asia/Ho_Chi_Minh');
    }

    // Create or fetch user by telegramId
    createOrFetchUser = async (req, res) => {
        try {
            const { telegramId, firstName, lastName } = req.body;

            let user = await User.findOne({ telegramId });

            if (!user) {
                // Generate a unique referralCode
                const referralCode = nanoid(8); // Generate an 8-character unique code

                // Create a new user if it doesn't exist
                user = new User({
                    telegramId,
                    firstName,
                    lastName,
                    tokens: 0,
                    referralCode,
                });

                await user.save();
            }

            return res.json({ userInfo: user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    };

    // Retrieve User info and initialize streak-related fields if not present
    readUserInfo = async (req, res) => {
        try {
            const { telegramId } = req.params;

            // Find the user by telegramId
            let user = await User.findOne({ telegramId });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Initialize streak if it doesn't exist
            if (typeof user.loginStreak === 'undefined') {
                user.loginStreak = 0;
            }

            await user.save();
            user.streakRewards = UserController.getRewardForDay(user.loginStreak);

            return res.json({ userInfo: user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    };

    checkLoginStatus = async (req, res) => {
        try {
            const { telegramId } = req.params;
            const user = await User.findOne({ telegramId });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const currentDateHCM = this.getCurrentTimeInVietnam(); // Current date in HCM timezone

            if (!user.lastLoginDate) {
                // The user has never logged in before
                return res.json({
                    hasLoggedInToday: false,
                    user
                });
            }

            const lastLoginDateHCM = moment(user.lastLoginDate).tz('Asia/Ho_Chi_Minh'); // Last login in HCM timezone
            const currentStartOfDayHCM = currentDateHCM.clone().startOf('day'); // Start of today in HCM timezone
            const lastLoginStartOfDayHCM = lastLoginDateHCM.clone().startOf('day'); // Start of last login day

            const isNewDay = currentStartOfDayHCM.isAfter(lastLoginStartOfDayHCM); // Check if today is after the last login day

            // Calculate day difference to reset the streak if necessary
            const dayDiff = currentDateHCM.diff(lastLoginDateHCM, 'days'); // Number of days between last login and today

            if (isNewDay) {
                if (dayDiff === 1 && !user.maxLoginStreakReached) {
                    // It's a new day and user logged in consecutively, so no need to reset the streak
                    return res.json({
                        hasLoggedInToday: false,
                        user
                    });
                } else if (dayDiff > 1 && !user.maxLoginStreakReached) {
                    // The user missed one or more days, so we need to reset the streak
                    user.loginStreak = 0; // Reset streak
                    await user.save();

                    return res.json({
                        hasLoggedInToday: false,
                        user
                    });
                } else if (user.maxLoginStreakReached) {
                    // Max streak was reached, streak won't reset, just award 500 tokens
                    return res.json({
                        hasLoggedInToday: false,
                        user
                    });
                }
            } else {
                // User has already logged in today
                return res.json({
                    hasLoggedInToday: true,
                    user
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    };

    getLoginReward = async (req, res) => {
        try {
            const { telegramId } = req.body;
            const user = await User.findOne({ telegramId });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            let currentDateHCM = this.getCurrentTimeInVietnam();  // Current date in HCM timezone

            // If lastLoginDate is null, treat it as the first login
            if (!user.lastLoginDate) {
                user.loginStreak = 1;
                user.lastLoginDate = new Date();  // Store the login date in UTC
                const currentReward = UserController.getRewardForDay(user.loginStreak);
                user.tokens += currentReward;
                user.streakRewards = currentReward;
                await user.save();

                return res.json({
                    success: true,
                    loginStreak: user.loginStreak,
                    reward: currentReward || 0,
                    user
                });
            }

            const lastLoginDateHCM = moment(user.lastLoginDate).tz('Asia/Ho_Chi_Minh');
            const currentStartOfDayHCM = currentDateHCM.clone().startOf('day');
            const lastLoginStartOfDayHCM = lastLoginDateHCM.clone().startOf('day');
            const isNewDay = currentStartOfDayHCM.isAfter(lastLoginStartOfDayHCM);

            if (isNewDay) {
                const dayDiff = currentDateHCM.diff(lastLoginDateHCM, 'days');

                if (dayDiff === 1 && !user.maxLoginStreakReached) {
                    user.loginStreak += 1;
                } else if (dayDiff > 1 && !user.maxLoginStreakReached) {
                    user.loginStreak = 1; // Reset streak if missed more than 1 day
                }

                console.log(user.maxLoginStreakReached === true ? "111" : "222")
                // Award reward based on the streak or max streak reward (500 tokens)
                const currentReward = user.maxLoginStreakReached === true
                    ? 500 // Award fixed 500 tokens after max streak
                    : UserController.getRewardForDay(user.loginStreak);

                // Check if they reached the maximum streak
                if (user.loginStreak >= 9) {
                    user.maxLoginStreakReached = true;
                    user.loginStreak = 9; // Keep streak capped at 9
                }

                user.lastLoginDate = new Date();
                user.tokens += currentReward;
                user.streakRewards = currentReward;
                await user.save();

                return res.json({
                    success: true,
                    loginStreak: user.loginStreak,  // Updated or reset streak
                    reward: currentReward || 0,
                    user
                });
            } else {
                return res.json({
                    success: false,
                    message: 'Đã điểm danh cho hôm nay',
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    };

    // Function to get the reward for the current day
    static getRewardForDay(streak) {
        const rewards = [500, 1000, 2500, 5000, 15000, 25000, 50000, 80000, 200000]; // Example rewards
        // If streak is within the reward range, return the corresponding reward
        if (streak <= rewards.length) {
            return rewards[streak - 1]; // Rewards for days within the defined streak range
        } else {
            return 500; // After reaching the max reward, return 500 tokens daily
        }
    }

    startMission = async (req, res) => {
        try {
            const { telegramId, missionType } = req.body;
            const user = await User.findOne({ telegramId });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Set status to "started" and record the start time in UTC
            user.missions[missionType].status = 'started';

            await user.save();
            return res.json({ user });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    checkMission = async (req, res) => {
        try {
            const { telegramId, missionType } = req.body;
            const user = await User.findOne({ telegramId });
            if (!user) return res.status(404).json({ message: 'User not found' });

            const currentTime = new Date();

            user.missions[missionType].status = 'checked';
            user.missions[missionType].lastCheckTime = currentTime; // Convert moment object back to JS Date
            await user.save();

            return res.json({ user });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    rewardMission = async (req, res) => {
        try {
            const { telegramId, missionType } = req.body;

            const user = await User.findOne({ telegramId });
            if (!user) return res.status(404).json({ message: 'User not found' });
            user.missions[missionType].status = 'rewarded';

            if (missionType === "joinTelegramGroup") {
                user.tokens += 20000;
            } else {
                user.tokens += 2500;
            }

            await user.save();

            return res.json({ user });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    // Get last 10-minute check-in status
    getTenMinCheckInStatus = async (req, res) => {
        try {
            const { telegramId } = req.params;
            // Find the user by telegramId
            const user = await User.findOne({ telegramId });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const currentTime = new Date();
            const lastCheckInTime = user.lastTenMinCheckIn || new Date(0) // Fallback to an old date

            // Calculate the time difference in minutes
            const timeDifference = (currentTime - lastCheckInTime) / (1000 * 60); // Convert from milliseconds to minutes

            if (timeDifference >= 10) {
                // User can check-in again
                return res.json({ canCheckIn: true, remainingTime: 0 });
            } else {
                // User needs to wait
                const remainingTime = 10 - timeDifference;
                return res.json({ canCheckIn: false, remainingTime });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    };

    // Check-in for the "Ghi danh 10 phút 1 lần" mission
    tenMinCheckIn = async (req, res) => {
        try {
            const { telegramId } = req.body;

            console.log("DEF")
            console.log(telegramId)

            // Find the user by telegramId
            const user = await User.findOne({ telegramId });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const currentTime = new Date();
            const lastCheckInTime = user.lastTenMinCheckIn || new Date(0); // Fallback to an old date

            // Calculate the time difference in minutes
            const timeDifference = (currentTime - lastCheckInTime) / (1000 * 60); // Convert from milliseconds to minutes

            if (timeDifference >= 10) {
                // The user is eligible for the 10-minute check-in reward
                user.lastTenMinCheckIn = currentTime; // Update the last check-in time
                user.tokens += 1000; // Example reward, you can adjust this

                // Save the updated user
                await user.save();

                return res.json({
                    user
                });
            } else {
                // The user is not eligible yet
                const remainingTime = 10 - timeDifference;
                return res.status(400).json({
                    success: false,
                    message: `Vui lòng thử lại sau ${Math.ceil(remainingTime)} phút`,
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    };

    // Fetch leaderboard for users, sorted by tokens in descending order
    getLeaderboard = async (req, res) => {
        try {
            // Run both queries in parallel
            const [users, totalUsers] = await Promise.all([
                User.find().sort({ tokens: -1 }).limit(10),
                User.countDocuments()
            ]);

            console.log(users);
            console.log(`Total Users: ${totalUsers}`);

            return res.json({
                leaderboard: users,
                totalUsers: totalUsers // Return totalUsers in the response
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    };


    // Method to check if the user is part of the referral list and their KYC status
    checkMemberStatus = async (req, res) => {
        try {
            let { namiId, telegramId } = req.body; // Extract namiId from the request body
            namiId = formatNamiId(namiId);
            let user = await User.findOne({ telegramId });
            let tokensEarned = 0;

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            console.log('Checking KYC for Nami ID:', namiId);

            // Check if the namiId is already associated with another user
            const existingUserWithNamiId = await User.findOne({ namiId });
            if (existingUserWithNamiId && existingUserWithNamiId.telegramId !== telegramId) {
                // If another user already has this namiId, return an error
                return res.status(400).json({
                    message: 'Nami ID này đã được sử dụng bởi một người chơi khác',
                });
            }

            // Call the helper function to check KYC and community status
            const memberStatus = await this.checkMemberInNamiCommunity(namiId);

            // Check if users have not finished the Join T2Capital Mission
            // and now they do
            if (!user.isInCommunity && memberStatus.isInCommunity) {
                user.isInCommunity = true;
                tokensEarned += 20000;
                user.namiId = namiId;
            }

            // Check if users have not finished the Join T2Capital Mission
            // and now they do
            if (!user.isKyc && memberStatus.isKyc) {
                user.isKyc = true;
                tokensEarned += 100000;
            }
            console.log(user.tokens)
            user.tokens += tokensEarned;
            console.log(tokensEarned)
            console.log(user.tokens)
            await user.save();

            // Return the result in the response
            return res.json({
                user
            });
        } catch (error) {
            console.error('Error in checkKyc:', error);
            return res.status(500).json({ message });
        }
    };

    // Helper function to check Nami ID in the community and KYC status
    checkMemberInNamiCommunity = async (namiId) => {
        // API URL
        const formatCurrency = 22;
        const limit = 10;
        const skip = 0;
        const refType = 'NAMI';

        // Get the current timestamp
        const timestamp = Date.now();
        const queryString = `code=${namiId}&format_currency=${formatCurrency}&limit=${limit}&skip=${skip}&refType=${refType}&timestamp=${timestamp}`;

        // Create the API signature (assuming you have the secret key)
        const apiSecret = process.env.SECRET_KEY; // Replace with your secret key
        const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(queryString)
            .digest('hex');

        // API URL
        const url = `https://nami.exchange/api/v3/users/referral/friends-v2?${queryString}&signature=${signature}`;

        // Define the headers, mimicking what you provided
        const headers = {
            'accept': 'application/json',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/json',
            'cookie': 'AUTH=%7B%7D; _ga=GA1.1.1692520201.1726496541; client_id_nami_exchange=c3ecf2cbb8aed3f5a1f71d47ab72fb22oSOBkcad%2FGyVtZtoF7%2FRWJZobWo4uKEkgJh0A3IL57F%2BfuqzrPyZ6q8p3bV6GFs59AfoUJVEiEd3GtuuIHuhChc7KNz2W56l0uaROPW%2FZYpoHkASoKjnQiJGGNZq4s2C; NAMI_LOCALE=vi; _clck=d98cgq%7C2%7Cfpe%7C0%7C1720; _clsk=z3ikg0%7C1726983003873%7C10%7C1%7Cv.clarity.ms%2Fcollect; _ga_PK5ZL4W4G7=GS1.1.1726981381.4.1.1726983003.0.0.0; nami-game-session=c9c422e5d1641b910c768047b4cb9b2cfiDQo1gQdqu2uZ2jOJJMpxZXcpybnYlltlFeeTvntLINIOfEE%2FZIVHFsxSRWpK%2BlfXOwiFCs5Z0st%2B%2FcTC62qepiy0saMhfsNNRIYyu%2BDQ2m2fRWC60qijv96sqGQsH3; nami-game-session-values=62c92dfef44e4f67372d850e590f88bbm2o0yXrAY6IBNHEDKKNwhh59DdgpPRIpZbP2kGMtBT%2FovjeZ4xmwDLKSxWgR4bqdYZvWpr2Tss5M4A1DU7Xv68FtOxhxzU%2BcsIRIyCHFtp0WN47xiqKGkD53dXk1O2ELISvLx%2BxYDqFaRN0gwtDIJcQxyGz08Mv28co3WypkcFCbdw8dErNnOwEePp52u%2Fl5KrzBJ0LYawaSlCDKgJ%2ByOtpxAaigk%2FmiHj%2FnbSKZrnbJmRURP6cUFGayLqWzwOrmJ%2Ftr5Kp7qT0NbQtjNBz7Hg%3D%3D',
            'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        };


        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
                credentials: 'include'
            });

            if (response.ok) {
                const res = await response.json();
                const referrals = res.data.results;

                console.log(namiId)
                console.log(referrals)

                // Check if namiId is in the list of referrals
                const referral = referrals.find(ref => ref.code === namiId);
                console.log(referral)

                if (referral) {
                    return {
                        isInCommunity: true,
                        isKyc: referral.kyc_status === 2 // Check if KYC status is 2
                    };
                } else {
                    return {
                        isInCommunity: false,
                        isKyc: false
                    };
                }
            } else {
                console.error(`Có lỗi xảy ra: ${response.status}`, await response.json());
                return {
                    isInCommunity: false,
                    isKyc: false
                };
            }
        } catch (error) {
            console.error('Có lỗi xảy ra:', error);
            return {
                isInCommunity: false,
                isKyc: false
            };
        }
    };

    // Referral functionality
    recordReferral = async (req, res) => {
        const { referrerTelegramId, userTelegramId, firstName, lastName } = req.body;

        try {
            // Prevent the referrer and referred user from being the same person
            if (referrerTelegramId === userTelegramId) {
                return res.status(400).json({ message: 'Bạn không thể tự giới thiệu bản thân mình' });
            }

            // Find the referrer (User A) by their Telegram ID
            const referrer = await User.findOne({ telegramId: referrerTelegramId });
            if (!referrer) {
                return res.status(404).json({ message: 'Referrer not found' });
            }

            // Use the createOrFetchUser method to get or initialize the referred user (User B)
            let referredUser = await User.findOne({ telegramId: userTelegramId });

            // If User B does not exist, use the same logic from your createOrFetchUser method
            if (!referredUser) {
                const referralCode = nanoid(8); // Generate a unique referral code
                referredUser = new User({
                    telegramId: userTelegramId,
                    firstName,
                    lastName,
                    tokens: 0,
                    referralCode,
                });
                await referredUser.save();
            } else {
                // Check if User B is already referred by another user
                const isReferredByAnother = await User.findOne({ referrals: userTelegramId });
                if (isReferredByAnother) {
                    return res.status(400).json({ message: 'Người chơi này đã nhận lời giới thiệu từ người khác' });
                }
            }

            // Record the referral by adding User B's telegramId to referrer (User A)
            if (!referrer.referrals.includes(userTelegramId)) {
                referrer.referrals.push(userTelegramId);
                await referrer.save();
            }

            return res.status(200).json({ message: 'Lời mời giới thiệu đã được ghi nhận', referredUser });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    };

    getReferralRewardStatistics = async (req, res) => {
        try {
            const { telegramId } = req.body;  // Get the referrer's Telegram ID
            const referrer = await User.findOne({ telegramId });
            console.log(telegramId)
            console.log(referrer)

            if (!referrer) {
                return res.status(404).json({ message: 'Referrer not found' });
            }

            // Fetch total tokens earned by all referred users
            const referredUsers = await User.find({ telegramId: { $in: referrer.referrals } });
            const totalTokensFromReferrals = referredUsers.reduce((total, user) => total + user.tokens, 0);

            // Calculate collectable tokens (tokens earned since last collection)
            const tokensEarnedSinceLastCollection = totalTokensFromReferrals - referrer.lastReferralCollection;
            const collectableTokens = Math.ceil(tokensEarnedSinceLastCollection * 0.10); // 10% of new tokens

            // Prepare the statistics response
            const referralRewardStatistics = {
                collected: referrer.totalReferralTokensCollected, // "Đã nhận"
                collectable: Math.max(collectableTokens, 0), // "Khả dụng"
                referrals: referrer.referrals.length
            };

            return res.status(200).json(referralRewardStatistics);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    };


    collectReferralReward = async (req, res) => {
        try {
            const { telegramId } = req.body;  // Get the referrer's Telegram ID
            const referrer = await User.findOne({ telegramId });

            if (!referrer) {
                return res.status(404).json({ message: 'Referrer not found' });
            }

            // Fetch total tokens earned by all referred users
            const referredUsers = await User.find({ telegramId: { $in: referrer.referrals } });
            const totalTokensFromReferrals = referredUsers.reduce((total, user) => total + user.tokens, 0);

            // Calculate the new tokens earned by referred users since the last collection
            const tokensEarnedSinceLastCollection = totalTokensFromReferrals - referrer.lastReferralCollection;

            // If no new tokens are available to collect
            if (tokensEarnedSinceLastCollection <= 0) {
                return res.status(400).json({ message: 'Hiện chưa có hoa hồng khả dụng' });
            }

            // Calculate 10% of the new tokens and round up
            const referralBonus = Math.ceil(tokensEarnedSinceLastCollection * 0.10);

            // Add the referral bonus to the referrer's total tokens
            referrer.tokens += referralBonus;

            // Update the last referral collection to the current total tokens from referrals
            referrer.lastReferralCollection = totalTokensFromReferrals;

            // Update the total referral tokens collected field
            referrer.totalReferralTokensCollected += referralBonus;

            // Save the updated referrer
            await referrer.save();

            return res.status(200).json({ message: `Đã nhận ${formatFloat(referralBonus)} tokens hoa hồng giới thiệu`, referrer });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    };

    claimReferralReward = async (req, res) => {
        try {
            const { telegramId, milestone } = req.body;
            const user = await User.findOne({ telegramId });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Define milestone requirements
            const milestones = {
                invite1: { count: 1, reward: 10000 },
                invite5: { count: 5, reward: 30000 },
                invite10: { count: 10, reward: 50000 },
                invite20: { count: 20, reward: 100000 },
                invite50: { count: 50, reward: 150000 },
                invite1000: { count: 1000, reward: 500000 }
            };

            // Validate if the milestone exists
            const milestoneInfo = milestones[milestone];
            if (!milestoneInfo) {
                return res.status(400).json({ message: 'Có lỗi xảy ra' });
            }

            // Check if the user has already claimed this reward
            if (user.referralMissions[milestone]) {
                return res.status(400).json({ message: 'Bạn đã nhận thưởng nhiệm vụ này rồi' });
            }

            // Check if the user has enough referrals for this milestone
            if (user.referrals.length < milestoneInfo.count) {
                return res.status(400).json({ message: `Bạn cần mời ${milestoneInfo.count} người bạn để nhận thưởng ` });
            }

            // Add the reward tokens to the user's balance
            user.tokens += milestoneInfo.reward;

            // Mark this milestone as claimed
            user.referralMissions[milestone] = true;

            // Save the updated user
            await user.save();

            return res.status(200).json({
                message: `Đã nhận ${milestoneInfo.reward} tokens từ nhiệm vụ mời ${milestoneInfo.count} bạn bè`,
                user
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    };

}

export default new UserController();