import "./Community.scss";
import UserAvatar1 from "../../assets/img/user-avatar-1.png";
import UserAvatar2 from "../../assets/img/user-avatar-2.png";
import UserAvatar3 from "../../assets/img/user-avatar-3.png";
import UserAvatar4 from "../../assets/img/user-avatar-4.png";
import UserAvatar5 from "../../assets/img/user-avatar-5.png";

export default function Community() {
    return (
        <div className="community">
            <section className="header flex-justify-center mb-20">
                <h2>Cộng đồng T2Capital</h2>
            </section>
            <section className="text-align-center community__main">
                <h3>
                    Nơi chia sẻ kinh nghiệm đầu tư và Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </h3>
                <hr />
                <p className="annotation">Hơn 1.800+ thành viên mới đã gia nhập cộng đồng T2Capital</p>
                <div className="flex-justify-center">
                    <div className="community__main__member-container">
                        <img src={UserAvatar1} className="community__main__member-item" alt="" />
                        <img src={UserAvatar2} className="community__main__member-item" alt="" />
                        <img src={UserAvatar3} className="community__main__member-item" alt="" />
                        <img src={UserAvatar4} className="community__main__member-item" alt="" />
                        <img src={UserAvatar5} className="community__main__member-item" alt="" />
                    </div>
                </div>

                <div className="community__main__social-container">
                    {/* Use <a> tag for external links */}
                    <a href="https://www.facebook.com/qtcrypto" target="_blank" rel="noopener noreferrer">
                        <svg
                            className="community__main__social-item"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"></path>
                        </svg>
                    </a>

                    {/* Example of another social icon (can be another <a> tag for external link) */}
                    <svg
                        className="community__main__social-item"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                    >
                        <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"></path>
                    </svg>
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