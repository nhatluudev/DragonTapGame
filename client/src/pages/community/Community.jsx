import "./Community.scss";
import UserAvatar1 from "../../assets/img/user-avatar-1.png";
import UserAvatar2 from "../../assets/img/user-avatar-2.png";
import UserAvatar3 from "../../assets/img/user-avatar-3.png";
import UserAvatar4 from "../../assets/img/user-avatar-4.png";
import UserAvatar5 from "../../assets/img/user-avatar-5.png";
import T2CapitalIcon from "../../assets/img/t2-capital.png";

export default function Community() {
    return (
        <div className="community">
            <section className="header flex-justify-center mb-20">
                <h2>Cộng đồng T2Capital</h2>
            </section>

            <section className="text-align-center community__main">
                <div className="community__main__ic">
                    <img src={T2CapitalIcon} alt="" className="token-ic lg" />
                </div>

                <h3>
                    T2 Capital đồng hành cùng bạn, kiến tạo con đường đầu tư thông minh và bền vững.
                </h3>
                <hr />
                <p className="annotation">Hơn <span className="highlight-green-text fw-bold">1,000+</span> thành viên mới đã gia nhập cộng đồng T2Capital</p>
                <div className="flex-justify-center">
                    <div className="community__main__member-container">
                        <img src={UserAvatar1} className="community__main__member-item" alt="" />
                        <img src={UserAvatar2} className="community__main__member-item" alt="" />
                        <img src={UserAvatar3} className="community__main__member-item" alt="" />
                        <img src={UserAvatar4} className="community__main__member-item" alt="" />
                        <img src={UserAvatar5} className="community__main__member-item" alt="" />
                    </div>
                </div>

                <div className="flex-justify-center">
                    {/* Also use <a> tag for external Zalo link */}
                    <a href="https://zalo.me/g/amvele677" target="_blank" className="btn btn-lg btn-4 w-50">
                        Tham gia ngay
                    </a>
                </div>
            </section>
        </div>
    );
}