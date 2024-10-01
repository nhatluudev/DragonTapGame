import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Styling and assets
import TokenIcon from "../../assets/img/token.png";
import { useAuth } from "../../contexts/auth/AuthContext";
import "./DailyLoginMission.scss";
import { apiUtils } from "../../utils/newRequest";
import { useModal } from "../../contexts/modal/ModalContext";
import { formatFloat } from "../../utils/formatter";

export default function DailyLoginMission() {
    const { userInfo, setUserInfo } = useAuth();
    const { setModalInfo } = useModal();
    const loginStreakRewards = [500, 1000, 2500, 5000, 15000, 25000, 50000, 80000, 200000];
    const [hasLoggedInToday, setHasLoggedInToday] = useState(false); // Tracks if the user already logged in
    const [loading, setLoading] = useState(true); // Tracks the loading state
    const navigate = useNavigate();

    // Update loginStreak and streakRewards when userInfo becomes available
    useEffect(() => {
        if (userInfo) {
            checkLoginStatus();
        }
    }, []);

    // Function to check if the user has already logged in today and get the correct login streak
    const checkLoginStatus = async () => {
        setLoading(true);
        try {
            const response = await apiUtils.get(`/users/checkLoginStatus/${userInfo?.telegramId}`);
            setHasLoggedInToday(response.data.hasLoggedInToday);
            // Update login streak with correct data from the server
            setUserInfo(response.data.user)
        } catch (error) {
            console.error("Error checking login status:", error);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle claiming the daily login reward
    const handleLoginReward = async () => {
        try {
            const response = await apiUtils.post(`/users/getLoginReward`, { telegramId: userInfo?.telegramId });
            if (response.data.success) {
                setModalInfo({
                    status: "success",
                    message: `Đã nhận ${formatFloat(response.data.reward)} tokens`
                });

                setUserInfo(response.data.user);

                setHasLoggedInToday(true);
            } else {
                setModalInfo({
                    status: "error",
                    message: response.data.message
                });
            }
        } catch (error) {
            console.error("Error claiming login reward:", error);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("overlay")) {
            navigate("/missions");
        }
    };

    // Show loading spinner if still fetching the login status
    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <h3>Đang tải ...</h3>
            </div>
        )
    }

    return (
        <div className="overlay" onClick={handleOverlayClick}>
            <div className="modal-form type-1 daily-login-mission">
                <h3 className="form__title">Điểm danh hằng ngày</h3>
                <div onClick={() => navigate("/missions")}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 form__close-ic">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </div>

                <p className="annotation">
                    Duy trì chuỗi điểm danh để nhận các phần thưởng giá trị hơn
                </p>

                <div className="daily-login-mission-container">
                    {Array.from({ length: 9 }, (_, index) => (
                        <div key={index} className={`daily-login-mission-item btn ${index < userInfo?.loginStreak ? 'btn-4' : ''}`}>
                            <span className="daily-login-mission-item__title">Ngày {index + 1}</span>
                            <img src={TokenIcon} alt="" className="token-ic sm" />
                            <span className="daily-login-mission-item__token">{formatFloat(loginStreakRewards[index]) || 0}</span>
                        </div>
                    ))}
                </div>

                <p className="annotation">{
                    userInfo?.maxLoginStreakReached && "Phần thưởng là 500 tokens sau chuỗi 9 ngày đăng nhập"
                }</p>

                <button
                    className={`btn ${hasLoggedInToday ? "btn-5" : "btn-4"} btn-lg w-100 mt-12 mb-20`}
                    onClick={handleLoginReward}
                    disabled={hasLoggedInToday} // Disable if the user already claimed the reward
                >
                    {hasLoggedInToday ? "Đã điểm danh cho hôm nay" : "Điểm danh"}
                </button>
            </div>
        </div>
    );
}