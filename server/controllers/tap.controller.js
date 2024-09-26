import User from "../models/user.model.js";

class TapController {
    // Tap logic remains the same as before...
    tap = async (req, res, next) => {
        try {
            const { telegramId, firstName, lastName } = req.body;
            let user = await User.findOne({ telegramId });

            if (!user) {
                user = new User({ telegramId, firstName, lastName, tokens: 1 });
                await user.save();
            } else {
                user.tokens += 1;
                await user.save();
            }

            return res.json({ userTokens: user.tokens });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // Fetch user tokens logic...
    readUserTokens = async (req, res, next) => {
        try {
            const { telegramId } = req.params;
            const user = await User.findOne({ telegramId });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.json({ userTokens: user.tokens });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };
}

export default new TapController();