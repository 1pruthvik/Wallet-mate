import React, { useState, useMemo } from "react";
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Brain,
    RotateCcw,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import {
    generateCourseExamQuestions,
    type EarningsCourse
} from "../../data/earningsCertificationData";

interface EarningsPracticeQuizProps {
    course: EarningsCourse;
    onBack: () => void;
    onRecordScore: (scorePct: number) => void;
}

export const EarningsPracticeQuiz: React.FC<EarningsPracticeQuizProps> = ({
    course,
    onBack,
    onRecordScore
}) => {
    // Generate 30 questions for practice mode
    const practiceQuestions = useMemo(() => {
        return generateCourseExamQuestions(course, 30);
    }, [course]);

    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});
    const [isFinished, setIsFinished] = useState<boolean>(false);

    const currentQ = practiceQuestions[currentIndex];
    const isRevealed = revealedQuestions[currentIndex];

    const handleSelectOption = (optIdx: number) => {
        if (isRevealed) return;
        setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optIdx }));
        setRevealedQuestions(prev => ({ ...prev, [currentIndex]: true }));
    };

    const handleFinish = () => {
        let correct = 0;
        practiceQuestions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correctAnswer) {
                correct += 1;
            }
        });
        const scorePct = Math.round((correct / practiceQuestions.length) * 100);
        setIsFinished(true);
        onRecordScore(scorePct);
    };

    const correctCount = practiceQuestions.filter((q, idx) => selectedAnswers[idx] === q.correctAnswer).length;
    const scorePct = Math.round((correctCount / practiceQuestions.length) * 100);

    return (
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            {/* TOP BAR */}
            <button
                type="button"
                onClick={onBack}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "none",
                    border: "none",
                    color: "#6366f1",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    marginBottom: "16px",
                    padding: 0
                }}
            >
                <ArrowLeft size={16} /> Back to Course Hub
            </button>

            {!isFinished ? (
                <div style={{ background: "#ffffff", borderRadius: "18px", border: "1px solid #e2e8f0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "14px" }}>
                        <div>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase" }}>
                                {course.code} • 30-Question Practice Arena
                            </span>
                            <h2 style={{ margin: "2px 0 0 0", fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
                                Question {currentIndex + 1} of {practiceQuestions.length}
                            </h2>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10b981" }}>
                                {correctCount} Correct
                            </span>
                            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                                ({Object.keys(selectedAnswers).length}/{practiceQuestions.length} answered)
                            </span>
                        </div>
                    </div>

                    {/* Progress Line */}
                    <div style={{ height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden", marginBottom: "24px" }}>
                        <div style={{ width: `${((currentIndex + 1) / practiceQuestions.length) * 100}%`, height: "100%", background: "#6366f1", transition: "width 0.2s ease" }} />
                    </div>

                    {/* Question Meta Badge */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "0.72rem", background: "#f8fafc", border: "1px solid #cbd5e1", padding: "2px 8px", borderRadius: "6px", fontWeight: 700, color: "#475569" }}>
                            {currentQ.questionType}
                        </span>
                        <span style={{ fontSize: "0.72rem", background: "rgba(99, 102, 241, 0.08)", color: "#4f46e5", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                            {currentQ.skillTag}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", padding: "2px 8px" }}>
                            Difficulty: {currentQ.difficulty}
                        </span>
                    </div>

                    {/* Question Body */}
                    <h3 style={{ margin: "0 0 20px 0", fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", lineHeight: "1.5" }}>
                        {currentQ.question}
                    </h3>

                    {/* Options List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                        {currentQ.options.map((opt, optIdx) => {
                            const isSelected = selectedAnswers[currentIndex] === optIdx;
                            const isCorrect = optIdx === currentQ.correctAnswer;
                            let bg = "#ffffff";
                            let border = "#cbd5e1";
                            let textColor = "#1e293b";

                            if (isSelected) { bg = "rgba(99, 102, 241, 0.08)"; border = "#6366f1"; }
                            if (isRevealed) {
                                if (isCorrect) { bg = "rgba(16, 185, 129, 0.12)"; border = "#10b981"; textColor = "#065f46"; }
                                else if (isSelected && !isCorrect) { bg = "rgba(239, 68, 68, 0.12)"; border = "#ef4444"; textColor = "#991b1b"; }
                            }

                            return (
                                <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleSelectOption(optIdx)}
                                    disabled={isRevealed}
                                    style={{
                                        padding: "14px 18px",
                                        borderRadius: "12px",
                                        border: `1px solid ${border}`,
                                        backgroundColor: bg,
                                        color: textColor,
                                        textAlign: "left",
                                        fontSize: "0.9rem",
                                        cursor: isRevealed ? "default" : "pointer",
                                        fontWeight: isSelected || (isRevealed && isCorrect) ? 700 : 500,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        transition: "all 0.15s ease"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <span style={{ fontWeight: 800, color: "#64748b" }}>{String.fromCharCode(65 + optIdx)}.</span>
                                        <span>{opt}</span>
                                    </div>
                                    {isRevealed && isCorrect && <CheckCircle2 size={18} color="#10b981" />}
                                    {isRevealed && isSelected && !isCorrect && <XCircle size={18} color="#ef4444" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Instant Explanation Box */}
                    {isRevealed && (
                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
                            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#6366f1", marginBottom: "4px", textTransform: "uppercase" }}>
                                Detailed Explanation
                            </div>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: "#334155", lineHeight: "1.5" }}>
                                {currentQ.explanation}
                            </p>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <button
                            type="button"
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="wm-btn-secondary"
                            style={{ padding: "8px 16px", fontSize: "0.85rem", opacity: currentIndex === 0 ? 0.5 : 1 }}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>

                        {currentIndex < practiceQuestions.length - 1 ? (
                            <button
                                type="button"
                                onClick={() => setCurrentIndex(prev => prev + 1)}
                                className="wm-btn-primary"
                                style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                            >
                                Next Question <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleFinish}
                                className="wm-btn-primary"
                                style={{ padding: "8px 24px", fontSize: "0.85rem", background: "#10b981" }}
                            >
                                Finish Practice Session ✓
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                /* PRACTICE SUMMARY SCREEN */
                <div style={{ background: "#ffffff", borderRadius: "18px", border: "1px solid #e2e8f0", padding: "36px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                    <div style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background: scorePct >= 80 ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                        color: scorePct >= 80 ? "#10b981" : "#f59e0b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px auto"
                    }}>
                        <Brain size={36} />
                    </div>

                    <h2 style={{ margin: "0 0 6px 0", fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>
                        Practice Session Complete
                    </h2>
                    <p style={{ margin: "0 0 20px 0", fontSize: "0.95rem", color: "#475569" }}>
                        You scored <strong>{scorePct}%</strong> ({correctCount} / {practiceQuestions.length} correct)
                    </p>

                    <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginTop: "24px" }}>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedAnswers({});
                                setRevealedQuestions({});
                                setCurrentIndex(0);
                                setIsFinished(false);
                            }}
                            className="wm-btn-secondary"
                            style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px" }}
                        >
                            <RotateCcw size={16} /> Practice Again
                        </button>
                        <button
                            type="button"
                            onClick={onBack}
                            className="wm-btn-primary"
                            style={{ padding: "10px 24px" }}
                        >
                            Return to Course Hub
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
