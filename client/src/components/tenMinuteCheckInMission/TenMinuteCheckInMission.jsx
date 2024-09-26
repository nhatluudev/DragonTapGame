
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext.jsx';
import { apiUtils } from '../../utils/newRequest.js';

// Styling and assets...
import TokenIcon from "../../assets/img/token.png";
import "./DailyLoginMission.scss";

const DailyLoginMission = () => {
    const { userInfo } = useAuth();
    const [checkInMessage, setCheckInMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Function to handle the 10-minute check-in mission
    const handleTenMinCheckIn = async () => {
        setIsLoading(true);
        try {
            const response = await apiUtils.post('/users/tenMinCheckIn', { telegramId: userInfo?.telegramId });
            setCheckInMessage(response.data.message);
            // Update user tokens or other rewards in the UI if necessary
        } catch (error) {
            setCheckInMessage(error.response.data.message || 'Error occurred during check-in.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="overlay">
            <div className="modal-form type-1 daily-login-mission">

                <h3 className="form__title">Nhiệm vụ hằng ngày</h3>

                <p className="flex-align-center text-align-center annotation">
                    Duy trì chuỗi điểm danh để nhận các phần thưởng giá trị hơn
                </p>

                <div className="daily-login-mission-container">
                    {Array.from({ length: 9 }, (_, index) => (
                        <div key={index} className={`daily-login-mission-item btn ${index + 1 <= loginStreak ? 'btn-4' : ''}`}>
                            <span className="daily-login-mission-item__title">Ngày  {index + 1}</span>
                            <img src={TokenIcon} alt="" className="token-ic sm" />
                            <span className="daily-login-mission-item__token">{streakRewards[index] || 0}</span>
                        </div>
                    ))}
                </div>

                {/* Button for the 10-minute check-in */}
                <div className="ten-min-check-in">
                    <button className="btn btn-4 btn-lg w-100 mt-12 mb-20" onClick={handleTenMinCheckIn} disabled={isLoading}>
                        Ghi danh 10 phút 1 lần
                    </button>
                    {checkInMessage && <p className="check-in-message">{checkInMessage}</p>}
                </div>
            </div>
        </div>
    );
};

export default DailyLoginMission;
