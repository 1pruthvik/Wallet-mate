import React from "react";
import {
    Award,
    XCircle,
    RotateCcw,
    Sparkles,
    Zap
} from "lucide-react";
import { type EarningsCourse } from "../../data/earningsCertificationData";

interface EarningsExamResultProps {
    course: EarningsCourse;
    score: number;
    grade: "PASS" | "HONORS" | "DISTINCTION" | "FAILED";
    passed: boolean;
    timeSpentSeconds: number;
    skillBreakdown: Record<string, { correct: number; total: number; pct: number }>;
    certId?: string;
    onViewCertificate: () => void;
    onRetakeExam: () => void;
    onReturnToHub: () => void;
}

export const EarningsExamResult: React.FC<EarningsExamResultProps> = ({
    course,
    score,
    grade,
    passed,
    timeSpentSeconds,
    skillBreakdown,
    certId,
    onViewCertificate,
    onRetakeExam,
    onReturnToHub
}) => {
    const minutes = Math.floor(timeSpentSeconds / 60);
    const seconds = timeSpentSeconds % 60;

    return (
        <div style={{ maxWidth: "780px", margin: "0 auto", padding: "20px 0" }}>
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "36px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)" }}>
                {/* Result Header Badge */}
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: passed ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                        color: passed ? "#10b981" : "#ef4444",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px auto"
                    }}>
                        {passed ? <Award size={42} /> : <XCircle size={42} />}
                    </div>

                    <span style={{
                        fontSize: "0.82rem",
                        fontWeight: 800,
                        padding: "4px 14px",
                        borderRadius: "20px",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        background: grade === "DISTINCTION" ? "rgba(217, 119, 6, 0.15)" : grade === "HONORS" ? "rgba(99, 102, 241, 0.15)" : passed ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: grade === "DISTINCTION" ? "#b45309" : grade === "HONORS" ? "#4338ca" : passed ? "#047857" : "#b91c1c"
                    }}>
                        {passed ? `Certified • ${grade}` : "Not Passed (Min: 80%)"}
                    </span>

                    <h1 style={{ margin: "10px 0 4px 0", fontSize: "2.2rem", fontWeight: 900, color: "#0f172a" }}>
                        {score} / 100
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.95rem", color: "#475569" }}>
                        {course.code} — {course.title}
                    </p>
                </div>

                {/* Quick Meta Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "28px", textAlign: "center" }}>
                    <div>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Time Expended</span>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                            {minutes}m {seconds}s
                        </div>
                    </div>
                    <div>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Pass Threshold</span>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                            80%
                        </div>
                    </div>
                    <div>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>XP Awarded</span>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6366f1", marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                            <Zap size={16} /> +{passed ? (grade === "DISTINCTION" ? 1000 : grade === "HONORS" ? 750 : 500) : 50} XP
                        </div>
                    </div>
                </div>

                {/* SKILL CATEGORY BREAKDOWN */}
                <div style={{ marginBottom: "28px" }}>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                        Competency & Skill Breakdown
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {Object.entries(skillBreakdown).map(([skill, data], idx) => {
                            const isSkillPassed = data.pct >= 80;

                            return (
                                <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: "10px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>{skill}</span>
                                        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: isSkillPassed ? "#10b981" : "#f59e0b" }}>
                                            {data.correct} / {data.total} ({data.pct}%)
                                        </span>
                                    </div>
                                    <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                                        <div style={{ width: `${data.pct}%`, height: "100%", background: isSkillPassed ? "#10b981" : "#f59e0b" }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CERTIFICATE UNLOCK OR RETAKE ACTION */}
                {passed ? (
                    <div style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#ffffff", borderRadius: "16px", padding: "24px", textAlign: "center", marginBottom: "24px", boxShadow: "0 6px 20px rgba(16, 185, 129, 0.2)" }}>
                        <Sparkles size={28} style={{ margin: "0 auto 8px auto" }} />
                        <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", fontWeight: 800 }}>
                            Official Certificate Issued!
                        </h3>
                        <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", opacity: 0.9 }}>
                            Certificate ID: <strong>{certId || "FEA-EARN-2026-XXXX"}</strong>
                        </p>
                        <button
                            type="button"
                            onClick={onViewCertificate}
                            style={{
                                padding: "12px 28px",
                                borderRadius: "10px",
                                background: "#ffffff",
                                color: "#059669",
                                fontWeight: 800,
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.95rem"
                            }}
                        >
                            View & Download Official Certificate →
                        </button>
                    </div>
                ) : (
                    <div style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "14px", padding: "20px", marginBottom: "24px", textAlign: "center" }}>
                        <p style={{ margin: "0 0 14px 0", fontSize: "0.88rem", color: "#991b1b", lineHeight: "1.4" }}>
                            You scored <strong>{score}%</strong>. A minimum score of 80% is required for official certification. Review the curriculum lessons and try again.
                        </p>
                        <button
                            type="button"
                            onClick={onRetakeExam}
                            className="wm-btn-primary"
                            style={{ padding: "10px 20px", background: "#ef4444" }}
                        >
                            <RotateCcw size={16} /> Retake 100-Question Exam
                        </button>
                    </div>
                )}

                {/* RETURN BUTTON */}
                <div style={{ textAlign: "center" }}>
                    <button
                        type="button"
                        onClick={onReturnToHub}
                        className="wm-btn-secondary"
                        style={{ padding: "10px 24px" }}
                    >
                        Return to Course Hub
                    </button>
                </div>
            </div>
        </div>
    );
};
