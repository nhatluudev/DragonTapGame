import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Styling and assets
import "./KycMission.scss";
import { apiUtils } from "../../utils/newRequest";
import { useAuth } from "../../contexts/auth/AuthContext";
import { useModal } from "../../contexts/modal/ModalContext";
import { isFilled } from "../../utils/validator";


export default function KycMission() {
    const { userInfo, setUserInfo } = useAuth();
    const { setModalInfo } = useModal();
    const navigate = useNavigate();

    const [isCheckKycLoading, setIsCheckKycLoading] = useState();
    const [inputs, setInputs] = useState({});
    const [errors, setErrors] = useState({});

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

        setIsCheckKycLoading(true);
        const validationErrors = validateInputs();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsCheckKycLoading(false);
            return;
        }

        try {
            const response = await apiUtils.post(`/users/checkMemberStatus`, { namiId: inputs.namiId, telegramId: userInfo.telegramId });
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
            console.log(error.response)
            setModalInfo({
                status: "error",
                message: error.response.data.message || "Có lỗi xảy ra"
            })
            // console.error("Error claiming login reward:", error);
        } finally {
            setIsCheckKycLoading(false);
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
                <h3 className="form__title">Hoàn thành KYC</h3>
                <div onClick={() => navigate("/missions")}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 form__close-ic">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </div>
                <div className="annotation mt-12">
                    Nhập Nami ID của bạn để hệ thống kiểm tra.
                </div>
                <div className="annotation">
                    <Link to="/missions/check-kyc/kyc-tutorial" className="highlight-text green underlined">Xem hướng dẫn</Link>
                </div>

                <div className="form-field">
                    <input type="text" name="namiId" onChange={handleChange} placeholder="Nhập Nami ID của bạn" className="form-field__input" />
                    {errors?.namiId && <div className="form-field__error">{errors?.namiId}</div>}
                </div>

                <button
                    type="submit"
                    className="btn btn-lg btn-4 w-100"
                    onClick={handleSubmit}
                    disabled={isCheckKycLoading}
                >
                    {isCheckKycLoading ? (
                        <span className="btn-spinner"></span>
                    ) : (
                        "Xác nhận"
                    )}
                </button>
            </div>
        </div>
    );
}