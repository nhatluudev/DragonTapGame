import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Styling and assets
import "./KycTutorial.scss";
import KycTutorial1 from "../../assets/img/kyc-tutorial-1.png"
import KycTutorial2 from "../../assets/img/kyc-tutorial-2.png"
import KycTutorial3 from "../../assets/img/kyc-tutorial-3.png"
import { apiUtils } from "../../utils/newRequest";
import { useAuth } from "../../contexts/auth/AuthContext";

export default function KycTutorial() {
    const { userInfo } = useAuth();
    const [loginStreak, setLoginStreak] = useState(0); // Default to 0 if userInfo isn't ready
    const loginStreakRewards = [500, 1000, 2500, 5000, 15000, 25000, 50000, 80000, 200000];
    const [hasLoggedInToday, setHasLoggedInToday] = useState(false); // Tracks if the user already logged in
    const [rewardMessage, setRewardMessage] = useState(""); // To show reward message after claiming
    const navigate = useNavigate();

    // Update loginStreak and streakRewards when userInfo becomes available
    useEffect(() => {
        if (userInfo) {
            setLoginStreak(userInfo.loginStreak || 0);
            checkLoginStatus();
        }
    }, [userInfo]);

    // Function to check if the user has already logged in today
    const checkLoginStatus = async () => {
        try {
            const response = await apiUtils.get(`/users/checkLoginStatus/${userInfo?.telegramId}`);
            console.log(response.data)
            setHasLoggedInToday(response.data.hasLoggedInToday);
        } catch (error) {
            console.error("Error checking login status:", error);
        }
    };

    // Function to handle claiming the daily login reward
    const handleLoginReward = async () => {
        try {
            const response = await apiUtils.post(`/users/getLoginReward`, { telegramId: userInfo?.telegramId });

            if (response.data.success) {
                setLoginStreak(response.data.loginStreak); // Update login streak
                setRewardMessage(`Đã nhận ${response.data.reward} tokens!`);
                setHasLoggedInToday(true); // Set to true so the user can't claim twice
            }
        } catch (error) {
            console.error("Error claiming login reward:", error);
        }
    };

    return (
        <div className="overlay">
            <div className="modal-form type-1 kyc-tutorial">
                <svg onClick={() => navigate("/missions/kyc")} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 form__back-ic sm">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>

                <h3 className="form__title">Hướng dẫn KYC</h3>
                <br />
                <p>B1: Vào app Nami Exchange, chọn avatar</p>
                <img src={KycTutorial1} alt="" />
                <br />

                <p>B2: Ở mục tài khoản, chọn "Cá nhân"</p>
                <img src={KycTutorial2} alt="" />

                <p>B3: Copy mã giới thiệu và dán vào DragonTap</p>
                <img src={KycTutorial3} alt="" />

                <button onClick={() => navigate("/missions/kyc")} className="btn btn-lg btn-4 w-100 mt-28">
                    Đi đến nhập mã
                </button>
            </div>
        </div>
    );
}