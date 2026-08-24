import { Outlet } from "react-router-dom";
import AuthNavbar from "../components/AuthNavbar";
import AuthFooter from "../components/AuthFooter";

function AppLayout() {
    return (
        <div className="wm-app-shell">
            {/* Top Workspace Navbar */}
            <AuthNavbar />

            {/* Full-Width Workspace Layout */}
            <div className="wm-workspace-main">
                <main className="wm-page-container">
                    <Outlet />
                </main>

                <AuthFooter />
            </div>
        </div>
    );
}

export default AppLayout;