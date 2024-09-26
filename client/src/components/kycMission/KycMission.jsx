import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Styling and assets
import "./KycMission.scss";
import { apiUtils } from "../../utils/newRequest";
import { useAuth } from "../../contexts/auth/AuthContext";
import { useModal } from "../../contexts/modal/ModalContext";


export default function KycMission() {
    const { userInfo, setUserInfo } = useAuth();
    const { setModalInfo } = useModal();
    const navigate = useNavigate();

    const [namiId, setNamiId] = useState();

    const handleChange = (e) => {
        setNamiId(e.target.value);
    }

    // Function to handle claiming the daily login reward
    const handleSubmit = async () => {
        try {
            const response = await apiUtils.post(`/users/checkMemberStatus`, { namiId, telegramId: userInfo.telegramId });
            console.log(response)
            if (response.data.isInCommunity && response.data.isKyc) {
                setModalInfo({
                    status: "success",
                    message: "Xác thực KYC thành công"
                })
                navigate("/missions")
                setUserInfo({ ...userInfo, isKyc: true });
            } else {
                setModalInfo({
                    status: "error",
                    message: "Tài khoản Nami của bạn không nằm trong cộng đồng T2Capital hoặc chưa kích hoạt KYC"
                })
            }
        } catch (error) {
            setModalInfo({
                status: "error",
                message: error.response.data.message || "Có lỗi xảy ra"
            })
            // console.error("Error claiming login reward:", error);
        }
    };

    return (
        <div className="overlay">
            <div className="modal-form type-1 kyc-mission">
                <h3 className="form__title">Hoàn thành KYC</h3>
                <div onClick={() => navigate("/missions")}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 form__close-ic">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </div>
                <br />
                <div className="annotation">
                    Nhập Nami ID của bạn để hệ thống kiểm tra.
                </div>
                <div className="annotation">
                    <Link to="/missions/check-kyc/kyc-tutorial" className="highlight-text green underlined">Xem hướng dẫn</Link>
                </div>

                <div className="form-field">
                    <input type="text" onChange={handleChange} placeholder="Nhập Nami ID của bạn" className="form-field__input" />
                </div>

                <button className="btn btn-lg btn-4 w-100" onClick={handleSubmit}>
                    Xác nhận
                </button>
            </div>
        </div>
    );
}