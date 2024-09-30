import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Styling and assets
import "./KycTutorial.scss";
import KycTutorial1 from "../../assets/img/kyc-1.png"
import KycTutorial2 from "../../assets/img/kyc-2.png"
import KycTutorial3 from "../../assets/img/kyc-3.png"
import KycTutorial4 from "../../assets/img/kyc-4.png"
import KycTutorial5 from "../../assets/img/kyc-5.png"
import KycTutorial6 from "../../assets/img/kyc-6.png"
import KycTutorial7 from "../../assets/img/kyc-7.png"

import { apiUtils } from "../../utils/newRequest";
import { useAuth } from "../../contexts/auth/AuthContext";

export default function KycTutorial() {
    const { userInfo } = useAuth();
    const navigate = useNavigate();
    // Handle click on the overlay (outside the modal-form)
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("overlay")) {
            navigate("/missions");
        }
    };

    return (
        <div className="overlay" onClick={handleOverlayClick}>
            <div className="modal-form type-1 kyc-tutorial">
                <svg onClick={() => navigate("/missions/check-kyc")} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 form__back-ic sm">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>

                <h3 className="form__title">Hướng dẫn KYC</h3>
                <br />
                <p className="text-align-justify">B1: Truy cập app Nami Exchange</p>
                <p className="text-align-justify">B2: Chọn cập nhật phiên bản mới nhất nếu có thông báo. Vui lòng không thoát app để update lên 100% (không di chuyển đa nhiệm)</p>
                <img src={KycTutorial2} alt="" />

                <p>B3: Nhấn "Khởi Động Lại" App khi nhận dc thông báo Update thành công</p>
                <img src={KycTutorial3} alt="" />
                <img src={KycTutorial4} alt="" />

                <p>B4: Tiến hành xác minh tài khoản và liên kết thanh toán</p>
                <img src={KycTutorial5} alt="" />
                <img src={KycTutorial6} alt="" />

                <p className="text-align-justify">B5: Xác thực giấy tờ tùy thân và quay video nhận diện khuôn mặt để hoàn tất thủ tục KYC.
                    Lưu ý cầm giấy tờ rõ nét và nhìn trái phải trên dưới.
                </p>
                <img src={KycTutorial7} alt="" />

                <p>B6: Copy Nami ID của bạn và dán vào DragonTap</p>

                <button onClick={() => navigate("/missions/check-kyc")} className="btn btn-lg btn-4 w-100 mt-28">
                    Đi đến nhập mã
                </button>
            </div>
        </div>
    );
}