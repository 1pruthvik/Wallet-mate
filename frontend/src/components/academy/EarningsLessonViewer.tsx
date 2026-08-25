import React, { useState } from "react";
import {
    X,
    Lightbulb,
    Calculator,
    AlertTriangle,
    Sparkles
} from "lucide-react";
import {
    type EarningsCourse,
    type EarningsLesson
} from "../../data/earningsCertificationData";
import { type FinancialHealthEngineReport } from "../../utils/financialHealth";

interface EarningsLessonViewerProps {
    course: EarningsCourse;
    lesson: EarningsLesson;
    healthReport?: FinancialHealthEngineReport;
    isCompleted?: boolean;
    onClose: () => void;
    onCompleteLesson: () => void;
    onNextLesson?: () => void;
}

export const EarningsLessonViewer: React.FC<EarningsLessonViewerProps> = ({
    course,
    lesson,
    healthReport,
    isCompleted: _isCompleted,
    onClose,
    onCompleteLesson,
    onNextLesson
}) => {
    const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

    const hasBankData = !!healthReport && healthReport.activeTransactionCount > 0;

    const handleMiniQuizSubmit = () => {
        if (selectedQuizAnswer === null) return;
        setQuizSubmitted(true);
        if (selectedQuizAnswer === lesson.miniQuiz.correctAnswer) {
            onCompleteLesson();
        }
    };

    return (
        <div className="wm-modal-backdrop" onClick={onClose}>
            <div
                className="wm-modal-card"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "820px", maxHeight: "92vh", overflowY: "auto", padding: "28px" }}
            >
                {/* MODAL HEADER */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6366f1", background: "rgba(99, 102, 241, 0.1)", padding: "2px 8px", borderRadius: "6px" }}>
                                {course.code} • Lesson {lesson.lessonNumber}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{lesson.duration}</span>
                        </div>
                        <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 800, color: "#0f172a" }}>
                            {lesson.title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="wm-modal-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* 60-SECOND CONCEPT SUMMARY */}
                <div style={{
                    background: "rgba(99, 102, 241, 0.06)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    borderRadius: "14px",
                    padding: "16px 20px",
                    display: "flex",
                    gap: "14px",
                    alignItems: "flex-start",
                    marginBottom: "24px"
                }}>
                    <Lightbulb size={22} color="#6366f1" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#6366f1", textTransform: "uppercase" }}>
                            Core Principle
                        </div>
                        <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "#0f172a", fontWeight: 600, lineHeight: "1.45" }}>
                            {lesson.concept}
                        </p>
                    </div>
                </div>

                {/* DEEP-DIVE EXPLANATION */}
                <div style={{ marginBottom: "24px", fontSize: "0.92rem", color: "#334155", lineHeight: "1.65" }}>
                    {lesson.explanation.map((para, i) => (
                        <p key={i} style={{ marginBottom: "14px" }}>
                            {para}
                        </p>
                    ))}
                </div>

                {/* FORMULA CALLOUT IF PRESENT */}
                {lesson.formula && (
                    <div style={{
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderRadius: "14px",
                        padding: "18px",
                        marginBottom: "24px"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <Calculator size={16} color="#6366f1" />
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>{lesson.formula.name}</span>
                        </div>
                        <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#6366f1", margin: "6px 0" }}>
                            {lesson.formula.expression}
                        </div>
                        <span style={{ fontSize: "0.82rem", color: "#475569" }}>
                            {lesson.formula.explanation}
                        </span>
                    </div>
                )}

                {/* REAL-LIFE ₹ EXAMPLE */}
                <div style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "20px",
                    marginBottom: "24px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
                }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#10b981", textTransform: "uppercase" }}>
                        Real-Life ₹ Case Analysis — {lesson.rupeeExample.title}
                    </span>
                    <p style={{ margin: "8px 0 10px 0", fontSize: "0.85rem", color: "#334155", lineHeight: "1.5" }}>
                        {lesson.rupeeExample.scenario}
                    </p>
                    <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.82rem", color: "#6366f1", fontWeight: 700, marginBottom: "10px" }}>
                        Calculation: {lesson.rupeeExample.calculation}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#0f172a", fontWeight: 700, background: "rgba(16, 185, 129, 0.08)", padding: "10px 14px", borderRadius: "8px" }}>
                        Key Takeaway: {lesson.rupeeExample.takeaway}
                    </div>
                </div>

                {/* COMMON MISTAKES TO AVOID */}
                <div style={{ background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "14px", padding: "18px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <AlertTriangle size={16} color="#ef4444" />
                        <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "#991b1b" }}>
                            Common Traps to Avoid
                        </h4>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {lesson.commonMistakes.map((mistake, i) => (
                            <div key={i} style={{ fontSize: "0.82rem", color: "#7f1d1d", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                                <span style={{ color: "#ef4444", fontWeight: 800 }}>•</span>
                                <span>{mistake}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* YOUR NUMBERS / FINANCIAL HEALTH ENGINE INTEGRATION */}
                <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", borderRadius: "14px", border: "1px solid #cbd5e1", padding: "18px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Sparkles size={16} color="#6366f1" />
                        <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
                            YOUR FINANCIAL PATTERNS (HEALTH ENGINE SYNC)
                        </h4>
                    </div>

                    {!hasBankData ? (
                        <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
                            Import your bank statement in the Transactions tab to automatically compare this lesson's formulas against your actual monthly income and profit margin.
                        </p>
                    ) : (
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "0.85rem", color: "#1e293b", fontWeight: 600 }}>
                            <div>
                                Monthly Income: <strong style={{ color: "#10b981" }}>₹{healthReport?.monthlyIncome.toLocaleString("en-IN")}</strong>
                            </div>
                            <div>
                                Retained Surplus: <strong style={{ color: "#6366f1" }}>₹{healthReport?.monthlySurplus.toLocaleString("en-IN")}</strong>
                            </div>
                            <div>
                                Personal Profit Rate: <strong style={{ color: (healthReport?.savingsRate || 0) >= 20 ? "#10b981" : "#f59e0b" }}>{healthReport?.savingsRate}%</strong>
                            </div>
                        </div>
                    )}
                </div>

                {/* CHECKPOINT MINI QUIZ */}
                <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", marginBottom: "24px" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                        Checkpoint Verification
                    </h4>
                    <p style={{ margin: "0 0 12px 0", fontSize: "0.88rem", fontWeight: 700, color: "#1e293b" }}>
                        {lesson.miniQuiz.question}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                        {lesson.miniQuiz.options.map((opt, optIdx) => {
                            const isSelected = selectedQuizAnswer === optIdx;
                            const isCorrect = optIdx === lesson.miniQuiz.correctAnswer;
                            let bg = "#f8fafc";
                            let border = "#cbd5e1";

                            if (isSelected) { bg = "rgba(99, 102, 241, 0.1)"; border = "#6366f1"; }
                            if (quizSubmitted) {
                                if (isCorrect) { bg = "rgba(16, 185, 129, 0.12)"; border = "#10b981"; }
                                else if (isSelected && !isCorrect) { bg = "rgba(239, 68, 68, 0.12)"; border = "#ef4444"; }
                            }

                            return (
                                <button
                                    key={optIdx}
                                    type="button"
                                    disabled={quizSubmitted}
                                    onClick={() => setSelectedQuizAnswer(optIdx)}
                                    style={{
                                        padding: "10px 14px",
                                        borderRadius: "10px",
                                        border: `1px solid ${border}`,
                                        backgroundColor: bg,
                                        textAlign: "left",
                                        fontSize: "0.85rem",
                                        cursor: "pointer",
                                        fontWeight: isSelected ? 700 : 500,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px"
                                    }}
                                >
                                    <span style={{ fontWeight: 800, color: "#64748b" }}>{String.fromCharCode(65 + optIdx)}.</span>
                                    <span>{opt}</span>
                                </button>
                            );
                        })}
                    </div>

                    {!quizSubmitted ? (
                        <button
                            type="button"
                            onClick={handleMiniQuizSubmit}
                            disabled={selectedQuizAnswer === null}
                            className="wm-btn-primary"
                            style={{ width: "100%", justifyContent: "center" }}
                        >
                            Verify Understanding & Mark Complete
                        </button>
                    ) : (
                        <div style={{
                            background: selectedQuizAnswer === lesson.miniQuiz.correctAnswer ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            padding: "14px",
                            borderRadius: "10px",
                            border: `1px solid ${selectedQuizAnswer === lesson.miniQuiz.correctAnswer ? "#10b981" : "#ef4444"}`,
                            fontSize: "0.85rem"
                        }}>
                            <strong style={{ color: selectedQuizAnswer === lesson.miniQuiz.correctAnswer ? "#10b981" : "#ef4444" }}>
                                {selectedQuizAnswer === lesson.miniQuiz.correctAnswer ? "✓ Correct! +25 XP Earned" : "❌ Incorrect."}
                            </strong>
                            <p style={{ margin: "4px 0 0 0", color: "#334155" }}>{lesson.miniQuiz.explanation}</p>
                        </div>
                    )}
                </div>

                {/* MODAL FOOTER */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="wm-btn-secondary"
                        style={{ padding: "10px 20px" }}
                    >
                        Close
                    </button>
                    {onNextLesson && (
                        <button
                            type="button"
                            onClick={onNextLesson}
                            className="wm-btn-primary"
                            style={{ padding: "10px 20px" }}
                        >
                            Next Lesson →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
