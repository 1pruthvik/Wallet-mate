import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AuthNavbar from "../components/AuthNavbar";
import AuthFooter from "../components/AuthFooter";

function AppLayout() {
    return (
        <div className="wm-app-shell">
            {/* Top Workspace Navbar */}
            <AuthNavbar />

            {/* Main Workspace Layout */}
            <div className="wm-app-body">
                <Sidebar />

                <div className="wm-workspace-main">
                    <main className="wm-page-container">
                        <Outlet />
                    </main>

                    <AuthFooter />
                </div>
            </div>
        </div>
    );
}

export default AppLayout;