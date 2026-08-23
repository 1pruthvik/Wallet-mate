import React, { useState, useEffect } from "react";

interface FinancialGoal {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    category: string;
}

interface UserProfileData {
    name: string;
    email: string;
    monthlyIncome: number;
    riskProfile: "Conservative" | "Moderate" | "Aggressive";
    currency: string;
    emergencyReserveMonths: number;
    notificationsEnabled: boolean;
}

const DEFAULT_PROFILE: UserProfileData = {
    name: "Nivish",
    email: "nivish@finmitra.ai",
    monthlyIncome: 75000,
    riskProfile: "Moderate",
    currency: "INR (₹)",
    emergencyReserveMonths: 6,
    notificationsEnabled: true,
};

const DEFAULT_GOALS: FinancialGoal[] = [
    {
        id: "goal-1",
        title: "6-Month Emergency Safety Fund",
        targetAmount: 180000,
        currentAmount: 110000,
        targetDate: "Dec 2026",
        category: "Safety",
    },
    {
        id: "goal-2",
        title: "Tech Upgrade & Workstation",
        targetAmount: 85000,
        currentAmount: 55000,
        targetDate: "Oct 2026",
        category: "Gadgets",
    },
    {
        id: "goal-3",
        title: "Long-Term Index Wealth Portfolio",
        targetAmount: 1000000,
        currentAmount: 320000,
        targetDate: "2030",
        category: "Wealth",
    },
];

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfileData>(() => {
        try {
            const saved = localStorage.getItem("finmitra_user_profile");
            return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
        } catch {
            return DEFAULT_PROFILE;
        }
    });

    const [goals, setGoals] = useState<FinancialGoal[]>(() => {
        try {
            const saved = localStorage.getItem("finmitra_user_goals");
            return saved ? JSON.parse(saved) : DEFAULT_GOALS;
        } catch {
            return DEFAULT_GOALS;
        }
    });

    const [savedAlert, setSavedAlert] = useState<string>("");
    const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
    const [newGoalTitle, setNewGoalTitle] = useState<string>("");
    const [newGoalTarget, setNewGoalTarget] = useState<number>(50000);
    const [newGoalCurrent, setNewGoalCurrent] = useState<number>(0);
    const [newGoalDate, setNewGoalDate] = useState<string>("2027");
    const [newGoalCategory, setNewGoalCategory] = useState<string>("Safety");

    useEffect(() => {
        try {
            localStorage.setItem("finmitra_user_profile", JSON.stringify(profile));
            localStorage.setItem("finmitra_user_goals", JSON.stringify(goals));
        } catch (e) {
            console.error(e);
        }
    }, [profile, goals]);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setSavedAlert("Profile and financial preferences saved successfully!");
        setTimeout(() => setSavedAlert(""), 4000);
    };

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoalTitle.trim() || newGoalTarget <= 0) return;

        const created: FinancialGoal = {
            id: `goal-${Date.now()}`,
            title: newGoalTitle.trim(),
            targetAmount: newGoalTarget,
            currentAmount: newGoalCurrent,
            targetDate: newGoalDate,
            category: newGoalCategory,
        };

        setGoals((prev) => [...prev, created]);
        setShowGoalModal(false);
        setNewGoalTitle("");
        setNewGoalTarget(50000);
        setNewGoalCurrent(0);
        setSavedAlert(`Goal "${created.title}" added successfully!`);
        setTimeout(() => setSavedAlert(""), 4000);
    };

    const handleDeleteGoal = (id: string) => {
        setGoals((prev) => prev.filter((g) => g.id !== id));
    };

    return (
        <div className="profile-page">
            {/* PAGE HEADER */}
            <div className="page-header">
                <div>
                    <h1>Profile & Financial Preferences</h1>
                    <p>Customize your investment risk profile, monthly income baseline, and financial milestones.</p>
                </div>
            </div>

            {savedAlert && <div className="form-success-banner" style={{ marginBottom: "20px" }}>{savedAlert}</div>}

            <div className="profile-layout-grid">
                {/* COLUMN 1: USER PROFILE & PREFERENCES */}
                <div className="profile-card">
                    <div className="card-inner-header">
                        <h3>Personal Financial Settings</h3>
                        <span>Base Parameters</span>
                    </div>

                    <form onSubmit={handleSaveProfile} className="profile-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Baseline Monthly Income (₹)</label>
                            <input
                                type="number"
                                min="0"
                                step="1000"
                                value={profile.monthlyIncome}
                                onChange={(e) => setProfile({ ...profile, monthlyIncome: parseInt(e.target.value) || 0 })}
                            />
                            <span className="field-hint">Used to calibrate budget benchmarks and affordability models.</span>
                        </div>

                        <div className="form-group">
                            <label>Investment Risk Tolerance</label>
                            <div className="risk-selector-group">
                                {(["Conservative", "Moderate", "Aggressive"] as const).map((risk) => (
                                    <button
                                        key={risk}
                                        type="button"
                                        className={`risk-btn ${profile.riskProfile === risk ? "risk-btn-active" : ""}`}
                                        onClick={() => setProfile({ ...profile, riskProfile: risk })}
                                    >
                                        <span className="risk-title">{risk}</span>
                                        <span className="risk-sub">
                                            {risk === "Conservative" ? "Low volatility (70% Debt, 30% Equity)" : risk === "Moderate" ? "Balanced (50% Equity, 50% Debt/Gold)" : "High Growth (80% Equity, 20% Debt)"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Emergency Fund Target (Months of Expenses)</label>
                            <select
                                value={profile.emergencyReserveMonths}
                                onChange={(e) => setProfile({ ...profile, emergencyReserveMonths: parseInt(e.target.value) || 6 })}
                            >
                                <option value={3}>3 Months (Aggressive Growth)</option>
                                <option value={6}>6 Months (Recommended Standard)</option>
                                <option value={12}>12 Months (Conservative Safety)</option>
                            </select>
                        </div>

                        <button type="submit" className="btn-primary" style={{ marginTop: "12px" }}>
                            Save Profile Preferences
                        </button>
                    </form>
                </div>

                {/* COLUMN 2: FINANCIAL GOALS & SECURITY */}
                <div className="profile-card">
                    <div className="card-inner-header">
                        <div>
                            <h3>Financial Goals & Milestones</h3>
                            <span>{goals.length} active goals tracked</span>
                        </div>
                        <button type="button" className="btn-secondary" onClick={() => setShowGoalModal(true)}>
                            + Add Goal
                        </button>
                    </div>

                    <div className="goals-list">
                        {goals.map((goal) => {
                            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

                            return (
                                <div key={goal.id} className="goal-item-card">
                                    <div className="goal-top-row">
                                        <div>
                                            <span className="goal-cat-tag">{goal.category}</span>
                                            <h4>{goal.title}</h4>
                                        </div>
                                        <button
                                            type="button"
                                            className="row-delete-btn"
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            title="Delete Goal"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="goal-progress-track">
                                        <div className="goal-progress-fill" style={{ width: `${pct}%` }} />
                                    </div>

                                    <div className="goal-bottom-row">
                                        <span className="goal-numbers">
                                            ₹{goal.currentAmount.toLocaleString("en-IN")} of ₹{goal.targetAmount.toLocaleString("en-IN")}
                                        </span>
                                        <span className="goal-pct">{pct}% • Target: {goal.targetDate}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* SECURITY & PRIVACY SECTION */}
                    <div className="security-privacy-box" style={{ marginTop: "24px" }}>
                        <h4>🛡️ Security & Privacy Assurance</h4>
                        <p>FinMitra processes financial statements in-memory without persistent disk storage of unparsed files. Sensitive financial credentials are encrypted locally.</p>
                        <div className="security-badges-row">
                            <span className="sec-pill">✓ In-Memory Statement Parsing</span>
                            <span className="sec-pill">✓ Zero External Credential Sharing</span>
                            <span className="sec-pill">✓ SEBI Compliant Analytical Guidance</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ADD GOAL MODAL */}
            {showGoalModal && (
                <div className="lesson-modal-overlay" onClick={() => setShowGoalModal(false)}>
                    <div className="lesson-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
                        <div className="lesson-modal-header">
                            <div>
                                <h2>Add Financial Goal</h2>
                                <p>Set a target milestone to track your wealth progress</p>
                            </div>
                            <button type="button" className="modal-close-btn" onClick={() => setShowGoalModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleAddGoal} className="profile-form" style={{ padding: "20px" }}>
                            <div className="form-group">
                                <label>Goal Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Home Down Payment, Emergency Reserve"
                                    value={newGoalTitle}
                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select value={newGoalCategory} onChange={(e) => setNewGoalCategory(e.target.value)}>
                                    <option value="Safety">Safety / Emergency</option>
                                    <option value="Wealth">Wealth & Investing</option>
                                    <option value="Home">Home / Property</option>
                                    <option value="Gadgets">Gadgets & Lifestyle</option>
                                    <option value="Travel">Travel & Vacation</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Target Amount (₹)</label>
                                <input
                                    type="number"
                                    min="1000"
                                    step="1000"
                                    value={newGoalTarget}
                                    onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Current Saved Amount (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={newGoalCurrent}
                                    onChange={(e) => setNewGoalCurrent(parseInt(e.target.value) || 0)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Target Date / Year</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dec 2026 or 2028"
                                    value={newGoalDate}
                                    onChange={(e) => setNewGoalDate(e.target.value)}
                                />
                            </div>

                            <div className="form-actions" style={{ marginTop: "16px" }}>
                                <button type="button" className="btn-outline" onClick={() => setShowGoalModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Goal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;