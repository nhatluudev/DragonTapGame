import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Styling and assets
import "./InCommunityMission.scss";
import { apiUtils } from "../../utils/newRequest";
import { useAuth } from "../../contexts/auth/AuthContext";
import { useModal } from "../../contexts/modal/ModalContext";
import { isFilled } from "../../utils/validator";


export default function InCommunityMission() {
    const { userInfo, setUserInfo } = useAuth();
    const { setModalInfo } = useModal();
    const [isCheckInCommunityLoading, setIsCheckInCommunityLoading] = useState();
    const [inputs, setInputs] = useState({});
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((prevState) => ({
            ...prevState,
            [name]: value
        }));
        setErrors((values) => ({ ...values, [name]: '' }));
    }

    const validateInputs = () => {
        let errors = {};

        if (!isFilled(inputs.namiId)) {
            errors.namiId = "Vui lòng nhập Nami ID";
        } else if (!inputs.namiId.toLowerCase().includes("nami") || inputs.namiId.length !== 14) {
            errors.namiId = "Nami ID không hợp lệ";
        }

        return errors;
    }


    // Function to handle claiming the daily login reward
    const handleSubmit = async () => {
        setIsCheckInCommunityLoading(true);
        const validationErrors = validateInputs();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsCheckInCommunityLoading(false);
            return;
        }

        try {
            const response = await apiUtils.post(`/users/checkMemberStatus`, { namiId: inputs.namiId, telegramId: userInfo.telegramId });
            console.log(response)
            if (response.data.isInCommunity) {
                setModalInfo({
                    status: "success",
                    message: "Nhiệm vụ gia nhập T2Capital đã hoàn tất"
                })
                navigate("/missions")
                setUserInfo({ ...userInfo, isInCommunity: true });
            } else {
                setModalInfo({
                    status: "error",
                    message: "Tài khoản Nami của bạn không nằm trong cộng đồng T2Capital"
                })
            }
        } catch (error) {
            setModalInfo({
                status: "error",
                message: error.response.data.message || "Có lỗi xảy ra"
            })
            // console.error("Error claiming login reward:", error);
        } finally {
            setIsCheckInCommunityLoading(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("overlay")) {
            navigate("/missions");
        }
    };

    return (
        <div className="overlay" onClick={handleOverlayClick}>
            <div className="modal-form type-1 kyc-mission">
                <h3 className="form__title">Gia nhập T2Capital</h3>
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
                    <Link to="/missions/check-in-community/check-in-community-tutorial" className="highlight-text green underlined">Xem hướng dẫn</Link>
                </div>

                <div className="form-field">
                    <input type="text" name="namiId" onChange={handleChange} placeholder="Nhập Nami ID của bạn" className="form-field__input" />
                    {errors?.namiId && <div className="form-field__error">{errors?.namiId}</div>}
                </div>

                <button
                    type="submit"
                    className="btn btn-lg btn-4 w-100"
                    onClick={handleSubmit}
                    disabled={isCheckInCommunityLoading}
                >
                    {isCheckInCommunityLoading ? (
                        <span className="btn-spinner"></span>
                    ) : (
                        "Xác nhận"
                    )}
                </button>
            </div>
        </div>
    );
}