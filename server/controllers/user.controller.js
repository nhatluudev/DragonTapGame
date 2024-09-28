import { nanoid } from 'nanoid';
import fetch from 'node-fetch';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
import User from "../models/user.model.js";
import { formatNamiId } from '../utils/formatter.js';

class UserController {
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
            res.status(500).json({ message: 'Server error' });
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
            if (!user.lastLoginDate) {
                user.lastLoginDate = new Date(0); // default to an old date
            }

            await user.save();
            user.streakRewards = UserController.getRewardForDay(user.loginStreak);

            return res.json({ userInfo: user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // Check if the user has already logged in today
    checkLoginStatus = async (req, res) => {
        try {
            const { telegramId } = req.params;
            console.log(telegramId)
            const user = await User.findOne({ telegramId });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const currentDate = new Date();
            const lastLoginDate = new Date(user.lastLoginDate);
            const hasLoggedInToday = lastLoginDate.toDateString() === currentDate.toDateString();

            return res.json({ hasLoggedInToday });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    };

    // Function to get daily login reward
    getLoginReward = async (req, res) => {
        try {
            const { telegramId } = req.body;
            const user = await User.findOne({ telegramId });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const currentDate = new Date();
            const lastLoginDate = new Date(user.lastLoginDate);
            const dayDiff = (currentDate - lastLoginDate) / (1000 * 3600 * 24); // Difference in days

            // Check if the user is logging in consecutively or breaking the streak
            if (dayDiff >= 1 && dayDiff < 2) {
                user.loginStreak += 1; // Continue the streak
            } else if (dayDiff >= 2) {
                user.loginStreak = 1; // Reset streak if more than 1 day passed
            }

            // Update last login date and save the user
            user.lastLoginDate = currentDate;
            const currentReward = UserController.getRewardForDay(user.loginStreak); // Get reward for the current streak day
            user.tokens += currentReward; // Add reward to user tokens
            user.streakRewards = currentReward;
            await user.save();

            return res.json({
                success: true,
                loginStreak: user.loginStreak,
                reward: currentReward || 0, // Get reward for the current day
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    };

    // Function to get the reward for the current day
    static getRewardForDay(streak) {
        const rewards = [500, 1000, 2500, 5000, 15000, 25000, 50000, 80000, 200000]; // Example rewards
        return rewards[streak - 1] || rewards[rewards.length - 1]; // Return reward for the current streak day or cap at the max reward
    }


    // Get last 10-minute check-in status
    getTenMinCheckInStatus = async (req, res) => {
        try {
            const { telegramId } = req.params;
            console.log("KKK")
            console.log(telegramId);
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
                // User can check-in again
                return res.json({ canCheckIn: true, remainingTime: 0 });
            } else {
                // User needs to wait
                const remainingTime = 10 - timeDifference;
                return res.json({ canCheckIn: false, remainingTime });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
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
            return res.status(500).json({ message: 'Server error' });
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
            return res.status(500).json({ message: 'Server error' });
        }
    };


    // Method to check if the user is part of the referral list and their KYC status
    checkMemberStatus = async (req, res) => {
        try {
            let { namiId, telegramId } = req.body; // Extract namiId from the request body
            namiId = formatNamiId(namiId);
            console.log(namiId)
            let user = await User.findOne({ telegramId });
            let tokensEarned = 0;
            console.log("ABC")

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
                tokensEarned += 10000;
                user.namiId = namiId;
            }

            // Check if users have not finished the Join T2Capital Mission
            // and now they do
            if (!user.isKyc && memberStatus.isKyc) {
                user.isKyc = true;
                tokensEarned += 20000;
            }

            user.tokens += tokensEarned;

            await user.save();

            // Return the result in the response
            return res.json({
                isInCommunity: memberStatus.isInCommunity,
                isKyc: memberStatus.isKyc
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
                console.error(`Error: ${response.status}`, await response.json());
                return {
                    isInCommunity: false,
                    isKyc: false
                };
            }
        } catch (error) {
            console.error('Error fetching referral data:', error);
            return {
                isInCommunity: false,
                isKyc: false
            };
        }
    };
}

export default new UserController();