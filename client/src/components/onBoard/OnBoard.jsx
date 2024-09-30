import "./OnBoard.scss";
import DragonBackground from "../../assets/img/background.jpg"

export default function OnBoard() {
    return (
        <div className="on-board">
            <img src={DragonBackground} alt="" className="on-board__bg" />
            <div className="loading">
                <div className="loading-spinner"></div>
                <h3>Đang tải ...</h3>
            </div>

            <div className="on-board__content text-align-center">
                <h3>Chào mừng bạn đến với</h3>
                <h1>DRAGON TAP</h1>
                <h3>Chinh phục thử thách và nhận thưởng</h3>
            </div>
        </div>
    )
}