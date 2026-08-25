import React from "react";
import {
    Sparkles,
    Award,
    Zap,
    Flame,
    Brain,
    Play
} from "lucide-react";
import { type ProfessionalTier } from "../../data/earningsCertificationData";

interface EarningsHeroProps {
    totalCourses: number;
    certifiedCount: number;
    examsCompleted: number;
    questionsAnswered: number;
    averageScore: number | null;
    totalXP: number;
    currentTier: ProfessionalTier;
    streakDays: number;
    onContinueLearning: () => void;
    onViewCertifications: () => void;
    onViewProgress: () => void;
    onPracticeQuiz: () => void;
}

export const EarningsHero: React.FC<EarningsHeroProps> = ({
    totalCourses,
    certifiedCount,
    examsCompleted,
    questionsAnswered,
    averageScore,
    totalXP,
    currentTier,
    streakDays,
    onContinueLearning,
    onViewCertifications,
    onViewProgress,
    onPracticeQuiz
}) => {
    const certProgressPct = Math.round((certifiedCount / totalCourses) * 100);

    return (
        <div className="wm-academy-header-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <h1 style={{ margin: 0, fontSize: "1.85rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                            Financial Education Academy
                        </h1>
                        <div className="wm-tier-badge" style={{ borderColor: currentTier.color, color: currentTier.color }}>
                            <Award size={16} />
                            <span>{currentTier.name}</span>
                        </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.95rem", color: "#cbd5e1", maxWidth: "720px", lineHeight: "1.5" }}>
                        Master cashflow, budgeting, income systems, profit, investing fundamentals, and long-term wealth creation.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        onClick={onContinueLearning}
                        className="wm-btn-primary"
                        style={{ padding: "10px 18px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "8px", background: "#6366f1" }}
                    >
                        <Play size={16} /> Continue Learning
                    </button>
                    <button
                        type="button"
                        onClick={onPracticeQuiz}
                        style={{
                            padding: "10px 16px",
                            fontSize: "0.88rem",
                            borderRadius: "10px",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            background: "rgba(255, 255, 255, 0.08)",
                            color: "#ffffff",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <Brain size={16} /> Practice Quiz
                    </button>
                    <button
                        type="button"
                        onClick={onViewCertifications}
                        style={{
                            padding: "10px 16px",
                            fontSize: "0.88rem",
                            borderRadius: "10px",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            background: "rgba(255, 255, 255, 0.08)",
                            color: "#ffffff",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <Award size={16} /> View Certifications
                    </button>
                    <button
                        type="button"
                        onClick={onViewProgress}
                        style={{
                            padding: "10px 16px",
                            fontSize: "0.88rem",
                            borderRadius: "10px",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            background: "rgba(255, 255, 255, 0.08)",
                            color: "#ffffff",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <Sparkles size={16} /> View Progress
                    </button>
                </div>
            </div>

            {/* 8 REAL METRICS ROW */}
            <div className="wm-academy-metrics-grid">
                <div className="wm-metric-mini-card">
                    <span className="wm-metric-label">Courses</span>
                    <div className="wm-metric-val">{certifiedCount} / {totalCourses}</div>
                    <span className="wm-metric-sub">{certProgressPct}% Certified</span>
                </div>

                <div className="wm-metric-mini-card">
                    <span className="wm-metric-label">Certificates</span>
                    <div className="wm-metric-val">{certifiedCount} / {totalCourses}</div>
                    <span className="wm-metric-sub">Issued Credentials</span>
                </div>

                <div className="wm-metric-mini-card">
                    <span className="wm-metric-label">Mastery Exams</span>
                    <div className="wm-metric-val">{examsCompleted} / {totalCourses}</div>
                    <span className="wm-metric-sub">100-Q Official Tests</span>
                </div>

                <div className="wm-metric-mini-card">
                    <span className="wm-metric-label">Questions Completed</span>
                    <div className="wm-metric-val">{questionsAnswered.toLocaleString("en-IN")}</div>
                    <span className="wm-metric-sub">Of 5,000 Bank</span>
                </div>

                <div className="wm-metric-mini-card">
                    <span className="wm-metric-label">Average Score</span>
                    <div className="wm-metric-val" style={{ color: (averageScore || 0) >= 80 ? "#10b981" : "#f59e0b" }}>
                        {averageScore !== null ? `${averageScore}%` : "—"}
                    </div>
                    <span className="wm-metric-sub">{averageScore !== null ? (averageScore >= 90 ? "Honors Track" : "Pass Mark 80%") : "No Exams Yet"}</span>
                </div>

                <div className="wm-metric-mini-card">
                    <span className="wm-metric-label">XP</span>
                    <div className="wm-metric-val" style={{ color: "#818cf8", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Zap size={18} /> {totalXP.toLocaleString("en-IN")}
                    </div>
                    <span className="wm-metric-sub">Earned Experience</span>
                </div>

                <div className="wm-metric-mini-card">
                    <span className="wm-metric-label">Learning Level</span>
                    <div className="wm-metric-val" style={{ fontSize: "1.1rem", color: currentTier.color }}>
                        {currentTier.name.split(" ")[0]}
                    </div>
                    <span className="wm-metric-sub">{currentTier.tier} Tier</span>
                </div>

                <div className="wm-metric-mini-card">
                    <span className="wm-metric-label">Study Streak</span>
                    <div className="wm-metric-val" style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Flame size={18} /> {streakDays} Days
                    </div>
                    <span className="wm-metric-sub">Active Routine</span>
                </div>
            </div>
        </div>
    );
};
