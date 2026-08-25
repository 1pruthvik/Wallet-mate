import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Clock,
    Flag,
    CheckCircle2,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import {
    generateCourseExamQuestions,
    type EarningsCourse
} from "../../data/earningsCertificationData";

interface EarningsExamInterfaceProps {
    course: EarningsCourse;
    onCancel?: () => void;
    onSubmitExam: (
        score: number,
        timeSpentSeconds: number,
        skillBreakdown: Record<string, { correct: number; total: number; pct: number }>
    ) => void;
}

export const EarningsExamInterface: React.FC<EarningsExamInterfaceProps> = ({
    course,
    onCancel,
    onSubmitExam
}) => {
    // Generate 100 questions specifically for this course attempt
    const questions = useMemo(() => {
        return generateCourseExamQuestions(course, 100);
    }, [course]);

    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [flagged, setFlagged] = useState<Record<number, boolean>>({});
    const [secondsRemaining, setSecondsRemaining] = useState<number>(90 * 60); // 90 minutes
    const [showPalette, setShowPalette] = useState<boolean>(false);
    const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

    // Live countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const answeredCount = Object.keys(answers).length;
    const flaggedCount = Object.values(flagged).filter(Boolean).length;
    const currentQ = questions[currentIndex];

    // Compute skill breakdown and final score
    const computeResults = useCallback(() => {
        let correctCount = 0;
        const skillsMap: Record<string, { correct: number; total: number; pct: number }> = {};

        questions.forEach((q, idx) => {
            const isCorrect = answers[idx] === q.correctAnswer;
            if (isCorrect) correctCount += 1;

            if (!skillsMap[q.skillTag]) {
                skillsMap[q.skillTag] = { correct: 0, total: 0, pct: 0 };
            }
            skillsMap[q.skillTag].total += 1;
            if (isCorrect) {
                skillsMap[q.skillTag].correct += 1;
            }
        });

        // Compute percentages
        Object.keys(skillsMap).forEach(k => {
            skillsMap[k].pct = Math.round((skillsMap[k].correct / skillsMap[k].total) * 100);
        });

        const score = Math.round((correctCount / questions.length) * 100);
        const timeSpent = (90 * 60) - secondsRemaining;
        return { score, timeSpent, skillsMap };
    }, [questions, answers, secondsRemaining]);

    const handleAutoSubmit = useCallback(() => {
        const { score, timeSpent, skillsMap } = computeResults();
        onSubmitExam(score, timeSpent, skillsMap);
    }, [computeResults, onSubmitExam]);

    const handleManualSubmit = () => {
        const { score, timeSpent, skillsMap } = computeResults();
        onSubmitExam(score, timeSpent, skillsMap);
    };

    const toggleFlag = () => {
        setFlagged(prev => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
    };

    return (
        <div className="wm-exam-screen">
            {/* STICKY EXAM TOP HUD */}
            <div className="wm-exam-header-hud">
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "0.82rem", background: "rgba(99, 102, 241, 0.3)", padding: "4px 10px", borderRadius: "6px", fontWeight: 800 }}>
                        {course.code}
                    </span>
                    <div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 800 }}>{course.title}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Official 100-Question Certification Exam</div>
                    </div>
                </div>

                {/* TIMER & STATS */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div className="wm-exam-timer-pill">
                        <Clock size={16} />
                        <span>{formatTime(secondsRemaining)}</span>
                    </div>

                    <div style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "none" /* or flex on desktop */ }} className="wm-desktop-only">
                        <span>Answered: <strong style={{ color: "#10b981" }}>{answeredCount}/100</strong></span>
                        <span style={{ margin: "0 8px" }}>•</span>
                        <span>Flagged: <strong style={{ color: "#f59e0b" }}>{flaggedCount}</strong></span>
                    </div>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                background: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "#fca5a5",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                cursor: "pointer"
                            }}
                        >
                            Exit Exam
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowPalette(!showPalette)}
                        style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "#ffffff",
                            padding: "6px 14px",
                            borderRadius: "8px",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: "pointer"
                        }}
                    >
                        Question Palette ({answeredCount}/100)
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowSubmitModal(true)}
                        className="wm-btn-primary"
                        style={{ padding: "8px 18px", fontSize: "0.85rem", background: "#10b981" }}
                    >
                        Submit Exam
                    </button>
                </div>
            </div>

            {/* MAIN EXAM BODY */}
            <div style={{ maxWidth: "1200px", width: "100%", margin: "24px auto", padding: "0 20px", display: "flex", gap: "24px", flex: 1 }}>
                {/* QUESTION AREA */}
                <div style={{ flex: 1, background: "#ffffff", borderRadius: "18px", border: "1px solid #e2e8f0", padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                    <div>
                        {/* Question Meta Bar */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                                    Question {currentIndex + 1} of 100
                                </span>
                                <span style={{ fontSize: "0.72rem", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "6px", fontWeight: 600 }}>
                                    {currentQ.questionType}
                                </span>
                                <span style={{ fontSize: "0.72rem", background: "rgba(99, 102, 241, 0.08)", color: "#4f46e5", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                                    {currentQ.skillTag}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={toggleFlag}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    background: flagged[currentIndex] ? "rgba(245, 158, 11, 0.12)" : "transparent",
                                    border: `1px solid ${flagged[currentIndex] ? "#f59e0b" : "#cbd5e1"}`,
                                    color: flagged[currentIndex] ? "#d97706" : "#64748b",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    cursor: "pointer"
                                }}
                            >
                                <Flag size={14} fill={flagged[currentIndex] ? "#f59e0b" : "none"} />
                                <span>{flagged[currentIndex] ? "Flagged for Review" : "Flag Question"}</span>
                            </button>
                        </div>

                        {/* Question Text */}
                        <h2 style={{ margin: "0 0 24px 0", fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", lineHeight: "1.55" }}>
                            {currentQ.question}
                        </h2>

                        {/* Options List */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                            {currentQ.options.map((opt, optIdx) => {
                                const isSelected = answers[currentIndex] === optIdx;

                                return (
                                    <button
                                        key={optIdx}
                                        type="button"
                                        onClick={() => setAnswers(prev => ({ ...prev, [currentIndex]: optIdx }))}
                                        style={{
                                            padding: "16px 20px",
                                            borderRadius: "12px",
                                            border: `1px solid ${isSelected ? "#6366f1" : "#cbd5e1"}`,
                                            backgroundColor: isSelected ? "rgba(99, 102, 241, 0.08)" : "#ffffff",
                                            color: "#1e293b",
                                            textAlign: "left",
                                            fontSize: "0.92rem",
                                            cursor: "pointer",
                                            fontWeight: isSelected ? 700 : 500,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "14px",
                                            transition: "all 0.15s ease"
                                        }}
                                    >
                                        <div style={{
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "50%",
                                            border: `2px solid ${isSelected ? "#6366f1" : "#94a3b8"}`,
                                            background: isSelected ? "#6366f1" : "transparent",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#ffffff",
                                            fontSize: "0.75rem",
                                            fontWeight: 800,
                                            flexShrink: 0
                                        }}>
                                            {String.fromCharCode(65 + optIdx)}
                                        </div>
                                        <span>{opt}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Navigation Buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "18px" }}>
                        <button
                            type="button"
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="wm-btn-secondary"
                            style={{ padding: "10px 20px", fontSize: "0.88rem", opacity: currentIndex === 0 ? 0.5 : 1 }}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>

                        <div style={{ display: "flex", gap: "10px" }}>
                            {currentIndex < 99 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex(prev => prev + 1)}
                                    className="wm-btn-primary"
                                    style={{ padding: "10px 24px", fontSize: "0.88rem" }}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowSubmitModal(true)}
                                    className="wm-btn-primary"
                                    style={{ padding: "10px 28px", fontSize: "0.88rem", background: "#10b981" }}
                                >
                                    Review & Submit Exam ✓
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* SIDE QUESTION PALETTE (DESKTOP) */}
                <div style={{
                    width: "320px",
                    background: "#ffffff",
                    borderRadius: "18px",
                    border: "1px solid #e2e8f0",
                    padding: "20px",
                    display: showPalette ? "block" : "block", // responsive
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                }}>
                    <h3 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                        Question Palette (100)
                    </h3>

                    {/* Legend */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "0.72rem", color: "#64748b", marginBottom: "14px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#6366f1" }} /> Current
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#10b981" }} /> Answered ({answeredCount})
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#f59e0b" }} /> Flagged ({flaggedCount})
                        </span>
                    </div>

                    {/* Palette 10x10 Grid */}
                    <div className="wm-question-palette-grid">
                        {questions.map((_, idx) => {
                            const isCur = idx === currentIndex;
                            const isAns = answers[idx] !== undefined;
                            const isFlg = !!flagged[idx];

                            let cls = "wm-palette-btn";
                            if (isCur) cls += " current";
                            else if (isFlg) cls += " flagged";
                            else if (isAns) cls += " answered";

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cls}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* SUBMIT CONFIRMATION MODAL */}
            {showSubmitModal && (
                <div className="wm-modal-backdrop">
                    <div className="wm-modal-card" style={{ maxWidth: "480px", padding: "28px", textAlign: "center" }}>
                        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                            <CheckCircle2 size={32} />
                        </div>

                        <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
                            Submit Official Exam?
                        </h3>
                        <p style={{ margin: "0 0 20px 0", fontSize: "0.88rem", color: "#475569" }}>
                            You have answered <strong>{answeredCount} of 100</strong> questions.
                            {100 - answeredCount > 0 && (
                                <span style={{ color: "#ef4444", display: "block", marginTop: "4px", fontWeight: 700 }}>
                                    Warning: {100 - answeredCount} questions remain unanswered and will be marked as incorrect.
                                </span>
                            )}
                        </p>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button
                                type="button"
                                onClick={() => setShowSubmitModal(false)}
                                className="wm-btn-secondary"
                                style={{ padding: "10px 20px" }}
                            >
                                Return to Exam
                            </button>
                            <button
                                type="button"
                                onClick={handleManualSubmit}
                                className="wm-btn-primary"
                                style={{ padding: "10px 24px", background: "#10b981" }}
                            >
                                Confirm & Submit Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
