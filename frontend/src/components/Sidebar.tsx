import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, User } from "lucide-react";

function Sidebar() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: "linear-gradient(135deg, #635bff 0%, #7b73ff 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: "bold"
                    }}>
                        W
                    </div>
                    <span>Wallet-mate</span>
                </div>
            </div>

            <nav className="sidebar-nav">

                <NavLink
                    to="/dashboard"
                    className="nav-link"
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/transactions"
                    className="nav-link"
                >
                    Transactions
                </NavLink>

                <NavLink
                    to="/financial-health"
                    className="nav-link"
                >
                    Financial Health
                </NavLink>

                <NavLink
                    to="/learning"
                    className="nav-link"
                >
                    Learning
                </NavLink>

                <NavLink
                    to="/mentor"
                    className="nav-link"
                >
                    AI Mentor
                </NavLink>

                <NavLink
                    to="/trading"
                    className="nav-link"
                >
                    Paper Trading
                </NavLink>

                <NavLink
                    to="/profile"
                    className="nav-link"
                >
                    Profile
                </NavLink>

            </nav>

            <div style={{
                marginTop: "auto",
                padding: "16px 20px",
                borderTop: "1px solid var(--border, #e2e8e5)",
                display: "flex",
                flexDirection: "column",
                gap: 12
            }}>
                {user ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
                            />
                        ) : (
                            <div style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                backgroundColor: "#635bff",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <User size={16} />
                            </div>
                        )}
                        <div style={{ overflow: "hidden" }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-strong, #0d1712)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                                {user.name}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--muted, #69756f)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                                {user.email || user.phone}
                            </div>
                        </div>
                    </div>
                ) : null}

                <button
                    onClick={handleLogout}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "none",
                        border: "none",
                        color: "#c84b4b",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                        padding: "6px 0",
                        fontFamily: "inherit"
                    }}
                    id="btn-sidebar-logout"
                >
                    <LogOut size={15} />
                    <span>{isAuthenticated ? "Sign out" : "Sign in / Switch"}</span>
                </button>
            </div>

        </aside>
    );
}

export default Sidebar;