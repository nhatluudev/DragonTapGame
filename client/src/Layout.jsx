import { Outlet } from 'react-router-dom';
import Navbar from "./components/navbar/Navbar";
import DragonBackground from "./assets/img/background.jpg"

// Styling
import "./layout.scss"

export default function Layout() {

    return (
        <div className="layout">
            <img src={DragonBackground} alt="" className='layout-bg' />
            <div className="outlet-content">
                <Outlet />
            </div>
            <Navbar />
        </div>
    )
}