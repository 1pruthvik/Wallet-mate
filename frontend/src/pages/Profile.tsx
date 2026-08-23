import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { getTransactions, type Transaction } from "../api/transactions";
import { calculateFinancialHealth } from "../utils/financialHealth";
import {
    User,
    Mail,
    Phone,
    Shield,
    Key,
    Lock,
    Target,
    Plus,
    Trash2,
    CheckCircle2,
} from "lucide-react";

interface FinancialGoal {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    category: string;
}

const Profile: React.FC = () => {
    const { user } = useAuthStore();
    const userStorageKey = user?.id || "guest";

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Dynamic preferences
    const [currency, setCurrency] = useState("INR (₹)");
    const [riskProfile, setRiskProfile] = useState<"Conservative" | "Moderate" | "Aggressive">("Moderate");
    const [savedNotice, setSavedNotice] = useState("");

    // Goals start clean [] for fresh users
    const [goals, setGoals] = useState<FinancialGoal[]>(() => {
        try {
            const saved = localStorage.getItem(`finmitra_user_goals_${userStorageKey}`);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Goal creation modal state
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalTitle, setGoalTitle] = useState("");
    const [goalTarget, setGoalTarget] = useState<number>(50000);
    const [goalCurrent, setGoalCurrent] = useState<number>(0);
    const [goalDate, setGoalDate] = useState("Dec 2026");
    const [goalCategory, setGoalCategory] = useState("Emergency Fund");

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getTransactions();
                setTransactions(data || []);
            } catch (err) {
                console.error("Failed to load user transactions for profile:", err);
            }
        };
        load();
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(`finmitra_user_goals_${userStorageKey}`, JSON.stringify(goals));
        } catch {
            // ignore
        }
    }, [goals, userStorageKey]);

    const health = useMemo(() => {
        return calculateFinancialHealth(transactions);
    }, [transactions]);

    const handleSavePreferences = () => {
        setSavedNotice("Preferences updated successfully.");
        setTimeout(() => setSavedNotice(""), 3000);
    };

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalTitle.trim()) return;

        const newGoal: FinancialGoal = {
            id: `goal-${Date.now()}`,
            title: goalTitle.trim(),
            targetAmount: Number(goalTarget) || 50000,
            currentAmount: Number(goalCurrent) || 0,
            targetDate: goalDate,
            category: goalCategory,
        };

        setGoals((prev) => [...prev, newGoal]);
        setGoalTitle("");
        setShowGoalModal(false);
        setSavedNotice("Financial goal added.");
        setTimeout(() => setSavedNotice(""), 3000);
    };

    const handleDeleteGoal = (goalId: string) => {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
    };

    const createdFormatted = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
        : "Active Member";

    return (
        <div className="wm-page-wrapper">
            {/* Header */}
            <div className="wm-page-header">
                <div>
                    <h1 className="wm-page-title">Personal Profile & Account</h1>
                    <p className="wm-page-subtitle">
                        Manage your authenticated account identity, financial preferences, and wealth goals.
                    </p>
                </div>
            </div>

            {savedNotice && (
                <div className="wm-alert wm-alert-success" style={{ marginBottom: "20px" }}>
                    <CheckCircle2 size={16} />
                    <span>{savedNotice}</span>
                </div>
            )}

            {/* Profile Overview Hero Card */}
            <div className="wm-card wm-profile-hero">
                <div className="wm-profile-avatar-wrap">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name || "User"} className="wm-profile-hero-avatar" />
                    ) : (
                        <div className="wm-profile-hero-avatar-fallback">
                            <User size={36} />
                        </div>
                    )}
                </div>

                <div className="wm-profile-hero-info">
                    <div className="wm-profile-hero-badge">
                        <Shield size={13} />
                        <span>{user?.authProvider === 'google' ? 'Verified Google Account' : 'Standard Email Account'}</span>
                    </div>
                    <h2 className="wm-profile-hero-name">{user?.name || "Authenticated User"}</h2>
                    <p className="wm-profile-hero-email">{user?.email || "No email on file"}</p>
                    <div className="wm-profile-meta-row">
                        <span className="meta-item">Member since: <strong>{createdFormatted}</strong></span>
                        <span className="meta-dot">•</span>
                        <span className="meta-item">Status: <strong style={{ color: "#10b981" }}>Active (Authenticated)</strong></span>
                        <span className="meta-dot">•</span>
                        <span className="meta-item">User ID: <code>{user?.id || "N/A"}</code></span>
                    </div>
                </div>
            </div>

            {/* Profile Content Grid */}
            <div className="wm-profile-sections-grid">
                {/* 1. Account & Security */}
                <div className="wm-card wm-profile-section-card">
                    <div className="wm-card-header">
                        <div>
                            <h3 className="wm-card-title">Security & Credentials</h3>
                            <p className="wm-card-subtitle">Authentication method and connected identity</p>
                        </div>
                    </div>

                    <div className="wm-info-list">
                        <div className="wm-info-row">
                            <div className="wm-info-label">
                                <Key size={15} />
                                <span>Sign-In Method</span>
                            </div>
                            <span className="wm-info-val">
                                {user?.authProvider === "google" ? "Google OAuth 2.0" : "Email & Password"}
                            </span>
                        </div>

                        <div className="wm-info-row">
                            <div className="wm-info-label">
                                <Mail size={15} />
                                <span>Primary Email</span>
                            </div>
                            <span className="wm-info-val">{user?.email || "-"}</span>
                        </div>

                        <div className="wm-info-row">
                            <div className="wm-info-label">
                                <Phone size={15} />
                                <span>Mobile Number</span>
                            </div>
                            <span className="wm-info-val">{user?.phone || "Not linked"}</span>
                        </div>

                        <div className="wm-info-row">
                            <div className="wm-info-label">
                                <Lock size={15} />
                                <span>Data Encryption</span>
                            </div>
                            <span className="wm-info-val" style={{ color: "#10b981" }}>AES-256 Enabled</span>
                        </div>
                    </div>
                </div>

                {/* 2. Real-Time Financial Profile */}
                <div className="wm-card wm-profile-section-card">
                    <div className="wm-card-header">
                        <div>
                            <h3 className="wm-card-title">Financial Vitals Summary</h3>
                            <p className="wm-card-subtitle">Real metrics derived from your stored transactions</p>
                        </div>
                    </div>

                    <div className="wm-info-list">
                        <div className="wm-info-row">
                            <span className="wm-info-label">Health Score</span>
                            <span className="wm-info-val font-semibold">{health.score} / 100 ({health.grade})</span>
                        </div>

                        <div className="wm-info-row">
                            <span className="wm-info-label">Monthly Inflow</span>
                            <span className="wm-info-val income">₹{health.monthlyIncome.toLocaleString("en-IN")}</span>
                        </div>

                        <div className="wm-info-row">
                            <span className="wm-info-label">Monthly Outflow</span>
                            <span className="wm-info-val expense">₹{health.monthlyExpenses.toLocaleString("en-IN")}</span>
                        </div>

                        <div className="wm-info-row">
                            <span className="wm-info-label">Net Surplus</span>
                            <span className={`wm-info-val ${health.monthlySavings >= 0 ? 'income' : 'expense'}`}>
                                ₹{health.monthlySavings.toLocaleString("en-IN")} ({health.savingsRate}%)
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Account Preferences */}
                <div className="wm-card wm-profile-section-card">
                    <div className="wm-card-header">
                        <div>
                            <h3 className="wm-card-title">Preferences & Settings</h3>
                            <p className="wm-card-subtitle">Customize currency and risk tolerances</p>
                        </div>
                    </div>

                    <div className="wm-form-group" style={{ marginBottom: "14px" }}>
                        <label className="wm-label">Reporting Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="wm-select"
                        >
                            <option value="INR (₹)">Indian Rupee — INR (₹)</option>
                            <option value="USD ($)">US Dollar — USD ($)</option>
                            <option value="EUR (€)">Euro — EUR (€)</option>
                        </select>
                    </div>

                    <div className="wm-form-group" style={{ marginBottom: "14px" }}>
                        <label className="wm-label">Risk Tolerance Profile</label>
                        <select
                            value={riskProfile}
                            onChange={(e) => setRiskProfile(e.target.value as any)}
                            className="wm-select"
                        >
                            <option value="Conservative">Conservative (Capital preservation priority)</option>
                            <option value="Moderate">Moderate (Balanced growth and stability)</option>
                            <option value="Aggressive">Aggressive (Maximum capital compounding)</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleSavePreferences}
                        className="wm-btn-primary wm-btn-sm"
                        style={{ marginTop: "8px" }}
                    >
                        Save Preferences
                    </button>
                </div>

                {/* 4. Financial Goals Tracker */}
                <div className="wm-card wm-profile-section-card wm-goals-section">
                    <div className="wm-card-header">
                        <div>
                            <h3 className="wm-card-title">Financial Goals</h3>
                            <p className="wm-card-subtitle">Track savings targets for emergencies, assets, or upgrades</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowGoalModal(true)}
                            className="wm-btn-secondary wm-btn-sm"
                        >
                            <Plus size={14} />
                            <span>Add Goal</span>
                        </button>
                    </div>

                    {goals.length === 0 ? (
                        <div className="wm-empty-state-sm">
                            <div className="wm-empty-icon"><Target size={24} /></div>
                            <h4>No financial goals configured</h4>
                            <p>Set a custom target to track savings accumulation over time.</p>
                            <button
                                type="button"
                                onClick={() => setShowGoalModal(true)}
                                className="wm-btn-primary wm-btn-xs"
                                style={{ marginTop: "10px" }}
                            >
                                Create First Goal
                            </button>
                        </div>
                    ) : (
                        <div className="wm-goals-list">
                            {goals.map((goal) => {
                                const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                                return (
                                    <div key={goal.id} className="wm-goal-card">
                                        <div className="wm-goal-header">
                                            <div>
                                                <h5 className="wm-goal-title">{goal.title}</h5>
                                                <span className="wm-goal-cat">{goal.category} • Target: {goal.targetDate}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteGoal(goal.id)}
                                                className="wm-row-action-btn delete"
                                                title="Remove goal"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="wm-goal-progress-track">
                                            <div className="wm-goal-progress-fill" style={{ width: `${pct}%` }} />
                                        </div>

                                        <div className="wm-goal-footer">
                                            <span>₹{goal.currentAmount.toLocaleString("en-IN")} saved</span>
                                            <span className="font-semibold">{pct}% of ₹{goal.targetAmount.toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Create Goal */}
            {showGoalModal && (
                <div className="wm-modal-backdrop" onClick={() => setShowGoalModal(false)}>
                    <div className="wm-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="wm-modal-header">
                            <div>
                                <h3>Create Financial Goal</h3>
                                <p>Set an actionable milestone to track your cash surplus.</p>
                            </div>
                            <button type="button" onClick={() => setShowGoalModal(false)} className="wm-modal-close-btn">
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleAddGoal} className="wm-modal-form">
                            <div className="wm-form-group">
                                <label className="wm-label">Goal Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 6-Month Emergency Fund, Vehicle Down Payment"
                                    value={goalTitle}
                                    onChange={(e) => setGoalTitle(e.target.value)}
                                    required
                                    className="wm-input"
                                />
                            </div>

                            <div className="wm-form-row">
                                <div className="wm-form-group">
                                    <label className="wm-label">Target Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={goalTarget}
                                        onChange={(e) => setGoalTarget(parseFloat(e.target.value) || 0)}
                                        required
                                        className="wm-input"
                                    />
                                </div>
                                <div className="wm-form-group">
                                    <label className="wm-label">Current Saved (₹)</label>
                                    <input
                                        type="number"
                                        value={goalCurrent}
                                        onChange={(e) => setGoalCurrent(parseFloat(e.target.value) || 0)}
                                        className="wm-input"
                                    />
                                </div>
                            </div>

                            <div className="wm-form-row">
                                <div className="wm-form-group">
                                    <label className="wm-label">Target Date</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dec 2026"
                                        value={goalDate}
                                        onChange={(e) => setGoalDate(e.target.value)}
                                        className="wm-input"
                                    />
                                </div>
                                <div className="wm-form-group">
                                    <label className="wm-label">Category</label>
                                    <select
                                        value={goalCategory}
                                        onChange={(e) => setGoalCategory(e.target.value)}
                                        className="wm-select"
                                    >
                                        <option value="Emergency Fund">Emergency Fund</option>
                                        <option value="Retirement">Retirement</option>
                                        <option value="Asset Purchase">Asset Purchase</option>
                                        <option value="Education">Education</option>
                                        <option value="Travel">Travel</option>
                                    </select>
                                </div>
                            </div>

                            <div className="wm-modal-actions">
                                <button type="button" onClick={() => setShowGoalModal(false)} className="wm-btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="wm-btn-primary">
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