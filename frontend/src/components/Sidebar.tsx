import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                FinMitra
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

        </aside>
    );
}

export default Sidebar;