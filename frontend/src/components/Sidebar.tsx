import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import WalletMateLogo from "./auth/WalletMateLogo";
import {
    LayoutDashboard,
    ReceiptText,
    Activity,
    GraduationCap,
    Sparkles,
    TrendingUp,
    User,
    LogOut,
} from "lucide-react";

function Sidebar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside className="wm-sidebar">
            {/* Logo / Header */}
            <div className="wm-sidebar-header">
                <NavLink to="/dashboard" className="wm-sidebar-brand">
                    <WalletMateLogo size="sm" showText={false} />
                    <div className="wm-sidebar-brand-text">
                        <span className="wm-sidebar-title">Wallet-mate</span>
                        <span className="wm-sidebar-version">v2.0 PRO</span>
                    </div>
                </NavLink>
            </div>

            {/* Navigation Sections */}
            <div className="wm-sidebar-content">
                {/* SECTION 1: MAIN */}
                <div className="wm-nav-section">
                    <div className="wm-nav-section-title">MAIN</div>
                    <nav className="wm-nav-group">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => `wm-nav-item ${isActive ? "active" : ""}`}
                            id="nav-dashboard"
                        >
                            <span className="wm-nav-icon"><LayoutDashboard size={18} /></span>
                            <span className="wm-nav-text">Dashboard</span>
                        </NavLink>

                        <NavLink
                            to="/transactions"
                            className={({ isActive }) => `wm-nav-item ${isActive ? "active" : ""}`}
                            id="nav-transactions"
                        >
                            <span className="wm-nav-icon"><ReceiptText size={18} /></span>
                            <span className="wm-nav-text">Transactions</span>
                        </NavLink>

                        <NavLink
                            to="/financial-health"
                            className={({ isActive }) => `wm-nav-item ${isActive ? "active" : ""}`}
                            id="nav-financial-health"
                        >
                            <span className="wm-nav-icon"><Activity size={18} /></span>
                            <span className="wm-nav-text">Health Engine</span>
                        </NavLink>
                    </nav>
                </div>

                {/* SECTION 2: TOOLS & INTELLIGENCE */}
                <div className="wm-nav-section">
                    <div className="wm-nav-section-title">TOOLS & AI</div>
                    <nav className="wm-nav-group">
                        <NavLink
                            to="/learning"
                            className={({ isActive }) => `wm-nav-item ${isActive ? "active" : ""}`}
                            id="nav-learning"
                        >
                            <span className="wm-nav-icon"><GraduationCap size={18} /></span>
                            <span className="wm-nav-text">Learning</span>
                        </NavLink>

                        <NavLink
                            to="/mentor"
                            className={({ isActive }) => `wm-nav-item ${isActive ? "active" : ""}`}
                            id="nav-mentor"
                        >
                            <span className="wm-nav-icon"><Sparkles size={18} /></span>
                            <span className="wm-nav-text">AI Mentor</span>
                            <span className="wm-nav-pill-ai">AI</span>
                        </NavLink>

                        <NavLink
                            to="/trading"
                            className={({ isActive }) => `wm-nav-item ${isActive ? "active" : ""}`}
                            id="nav-trading"
                        >
                            <span className="wm-nav-icon"><TrendingUp size={18} /></span>
                            <span className="wm-nav-text">Paper Trading</span>
                        </NavLink>
                    </nav>
                </div>

                {/* SECTION 3: ACCOUNT */}
                <div className="wm-nav-section">
                    <div className="wm-nav-section-title">ACCOUNT</div>
                    <nav className="wm-nav-group">
                        <NavLink
                            to="/profile"
                            className={({ isActive }) => `wm-nav-item ${isActive ? "active" : ""}`}
                            id="nav-profile"
                        >
                            <span className="wm-nav-icon"><User size={18} /></span>
                            <span className="wm-nav-text">Profile & Goals</span>
                        </NavLink>
                    </nav>
                </div>
            </div>

            {/* User Profile Card & Sign Out */}
            <div className="wm-sidebar-footer">
                {user && (
                    <NavLink to="/profile" className="wm-sidebar-user-card" title="View profile">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name || "User"}
                                className="wm-sidebar-avatar"
                            />
                        ) : (
                            <div className="wm-sidebar-avatar-fallback">
                                <User size={16} />
                            </div>
                        )}
                        <div className="wm-sidebar-user-info">
                            <span className="wm-sidebar-user-name">{user.name || "User"}</span>
                            <span className="wm-sidebar-user-email">{user.email || user.phone || "Active User"}</span>
                        </div>
                    </NavLink>
                )}

                <button
                    type="button"
                    onClick={handleLogout}
                    className="wm-sidebar-signout-btn"
                    id="btn-sidebar-logout"
                >
                    <LogOut size={15} />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;