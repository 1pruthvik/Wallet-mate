import React, { useState } from "react";
import {
    ArrowLeft,
    CheckCircle2,
    BookOpen,
    Clock,
    Award,
    Zap,
    Brain,
    Sparkles,
    ChevronRight,
    Lock
} from "lucide-react";
import {
    type EarningsCourse,
    type EarningsLesson
} from "../../data/earningsCertificationData";
import { type CourseProgressRecord, type UserCertificate } from "../../hooks/useEarningsAcademy";

interface EarningsCourseHubProps {
    course: EarningsCourse;
    progress?: CourseProgressRecord;
    certificate?: UserCertificate;
    onBack: () => void;
    onStartLesson: (lesson: EarningsLesson) => void;
    onStartPracticeQuiz: () => void;
    onStartOfficialExam: () => void;
    onViewCertificate: () => void;
}

export const EarningsCourseHub: React.FC<EarningsCourseHubProps> = ({
    course,
    progress,
    certificate,
    onBack,
    onStartLesson,
    onStartPracticeQuiz,
    onStartOfficialExam,
    onViewCertificate
}) => {
    const [activeTab, setActiveTab] = useState<"overview" | "lessons" | "formulas" | "practice" | "exam">("overview");

    const progressPct = progress?.progressPct || 0;
    const completedLessonIds = progress?.lessonsCompleted || [];
    const isCertified = !!certificate || progress?.status === "Certified" || progress?.status === "Honors" || progress?.status === "Distinction";
    const isExamReady = progressPct >= 80 || isCertified;

    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            {/* BACK BUTTON */}
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
                <ArrowLeft size={16} /> Back to Course Library
            </button>

            {/* COURSE HUB HEADER CARD */}
            <div style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "#ffffff",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                marginBottom: "24px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                            <span style={{
                                background: "rgba(99, 102, 241, 0.2)",
                                border: "1px solid rgba(99, 102, 241, 0.4)",
                                color: "#a5b4fc",
                                fontWeight: 800,
                                fontSize: "0.8rem",
                                padding: "4px 10px",
                                borderRadius: "8px"
                            }}>
                                {course.code}
                            </span>
                            <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600 }}>{course.pathTitle}</span>
                            <span style={{ fontSize: "0.8rem", color: "#cbd5e1", background: "rgba(255, 255, 255, 0.1)", padding: "3px 8px", borderRadius: "6px" }}>
                                {course.level}
                            </span>
                        </div>

                        <h1 style={{ margin: "4px 0 8px 0", fontSize: "1.75rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                            {course.title}
                        </h1>

                        <p style={{ margin: 0, fontSize: "0.95rem", color: "#cbd5e1", maxWidth: "680px", lineHeight: "1.5" }}>
                            {course.description}
                        </p>
                    </div>

                    {/* Progress Circle & Status Badge */}
                    <div style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "16px",
                        padding: "16px 20px",
                        textAlign: "center",
                        minWidth: "160px"
                    }}>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                            Certification Status
                        </div>
                        <div style={{
                            fontSize: "1.1rem",
                            fontWeight: 800,
                            margin: "4px 0",
                            color: isCertified ? "#10b981" : isExamReady ? "#f59e0b" : "#ffffff"
                        }}>
                            {isCertified ? (certificate?.grade || "Certified") : isExamReady ? "Exam Ready" : `${progressPct}% Done`}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#cbd5e1" }}>
                            {completedLessonIds.length} of {course.lessonsCount} Lessons
                        </div>
                    </div>
                </div>

                {/* Meta details row */}
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "16px", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={16} color="#94a3b8" />
                        <span>{course.duration}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <BookOpen size={16} color="#94a3b8" />
                        <span>{course.lessonsCount} Structured Lessons</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Zap size={16} color="#818cf8" />
                        <span>+{course.xpReward} XP Upon Certification</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Award size={16} color="#34d399" />
                        <span>100-Question Exam (Pass: 80%)</span>
                    </div>
                </div>
            </div>

            {/* HUB TAB NAVIGATION */}
            <div className="wm-tab-pills" style={{ marginBottom: "20px" }}>
                {[
                    { id: "overview", label: "Course Overview" },
                    { id: "lessons", label: `Lessons (${course.lessons.length})` },
                    { id: "formulas", label: `Formula Sheet (${course.formulaSheet.length})` },
                    { id: "practice", label: "Practice Quiz (30-Q)" },
                    { id: "exam", label: "Official Certification Exam (100-Q)" }
                ].map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`wm-tab-pill ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id as any)}
                    >
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* TAB 1: OVERVIEW */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "32px" }}>
                    {/* Left: Objectives & Skills */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
                            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                                Measurable Learning Objectives
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {course.objectives.map((obj, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.88rem", color: "#334155", lineHeight: "1.4" }}>
                                        <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: "2px" }} />
                                        <span>{obj}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
                            <h3 style={{ margin: "0 0 14px 0", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                                Professional Skills You'll Master
                            </h3>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {course.skills.map((skill, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            fontSize: "0.8rem",
                                            background: "rgba(99, 102, 241, 0.08)",
                                            color: "#4f46e5",
                                            border: "1px solid rgba(99, 102, 241, 0.2)",
                                            padding: "6px 12px",
                                            borderRadius: "8px",
                                            fontWeight: 700
                                        }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Certification Requirements Card */}
                    <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                <Award size={20} color="#6366f1" />
                                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                                    Certification Pathway
                                </h3>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "50%",
                                        background: completedLessonIds.length > 0 ? "rgba(16, 185, 129, 0.15)" : "#f1f5f9",
                                        color: completedLessonIds.length > 0 ? "#10b981" : "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 800,
                                        fontSize: "0.85rem"
                                    }}>
                                        {completedLessonIds.length > 0 ? "✓" : "1"}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>Study Lessons</div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{completedLessonIds.length} / {course.lessonsCount} Complete</div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "50%",
                                        background: isExamReady ? "rgba(16, 185, 129, 0.15)" : "#f1f5f9",
                                        color: isExamReady ? "#10b981" : "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 800,
                                        fontSize: "0.85rem"
                                    }}>
                                        {isExamReady ? "✓" : "2"}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>Unlock 100-Q Official Exam</div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Requires ≥80% lesson completion</div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "50%",
                                        background: isCertified ? "rgba(16, 185, 129, 0.15)" : "#f1f5f9",
                                        color: isCertified ? "#10b981" : "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 800,
                                        fontSize: "0.85rem"
                                    }}>
                                        {isCertified ? "✓" : "3"}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>Score ≥80% on Exam</div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>90-99% Honors, 100% Distinction</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isCertified ? (
                            <button
                                type="button"
                                onClick={onViewCertificate}
                                className="wm-btn-primary"
                                style={{ width: "100%", justifyContent: "center", background: "#10b981" }}
                            >
                                <Award size={18} /> View Earned Certificate
                            </button>
                        ) : isExamReady ? (
                            <button
                                type="button"
                                onClick={onStartOfficialExam}
                                className="wm-btn-primary"
                                style={{ width: "100%", justifyContent: "center", background: "#d97706" }}
                            >
                                <Sparkles size={18} /> Launch 100-Question Exam
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setActiveTab("lessons")}
                                className="wm-btn-primary"
                                style={{ width: "100%", justifyContent: "center" }}
                            >
                                Start First Lesson →
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: LESSONS */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "lessons" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                    {course.lessons.map((lesson, idx) => {
                        const isDone = completedLessonIds.includes(lesson.id);

                        return (
                            <div
                                key={lesson.id}
                                onClick={() => onStartLesson(lesson)}
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "14px",
                                    border: isDone ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                                    padding: "18px 20px",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "10px",
                                        background: isDone ? "rgba(16, 185, 129, 0.12)" : "#f1f5f9",
                                        color: isDone ? "#10b981" : "#475569",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 800,
                                        fontSize: "0.9rem"
                                    }}>
                                        {isDone ? <CheckCircle2 size={20} color="#10b981" /> : (idx + 1)}
                                    </div>

                                    <div>
                                        <h4 style={{ margin: "0 0 4px 0", fontSize: "0.98rem", fontWeight: 800, color: "#0f172a" }}>
                                            {lesson.title}
                                        </h4>
                                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                                            {lesson.concept}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{lesson.duration}</span>
                                    <ChevronRight size={18} color="#94a3b8" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: FORMULA SHEET */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "formulas" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                    {course.formulaSheet.map((f, i) => (
                        <div key={i} style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Formula #{i + 1}</span>
                            <h4 style={{ margin: "4px 0 8px 0", fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>{f.name}</h4>
                            <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 800, color: "#6366f1", marginBottom: "10px" }}>
                                {f.expression}
                            </div>
                            <p style={{ margin: 0, fontSize: "0.82rem", color: "#475569" }}>
                                <strong>Use Case:</strong> {f.useCase}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 4: PRACTICE QUIZ LAUNCHER */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "practice" && (
                <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "32px", textAlign: "center", maxWidth: "600px", margin: "0 auto 32px auto" }}>
                    <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "rgba(99, 102, 241, 0.1)",
                        color: "#6366f1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px auto"
                    }}>
                        <Brain size={32} />
                    </div>

                    <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
                        30-Question Practice Arena
                    </h3>
                    <p style={{ margin: "0 0 20px 0", fontSize: "0.88rem", color: "#475569", lineHeight: "1.5" }}>
                        Test your conceptual and numerical mastery with instant step-by-step explanations. Unlimited attempts with no cooldown.
                    </p>

                    <div style={{ display: "flex", justifyContent: "center", gap: "20px", fontSize: "0.85rem", color: "#64748b", marginBottom: "24px" }}>
                        <span><strong>30</strong> Questions</span>
                        <span>•</span>
                        <span><strong>20 Mins</strong> Est. Time</span>
                        <span>•</span>
                        <span>Best Score: <strong style={{ color: "#10b981" }}>{progress?.bestQuizScore || 0}%</strong></span>
                    </div>

                    <button
                        type="button"
                        onClick={onStartPracticeQuiz}
                        className="wm-btn-primary"
                        style={{ padding: "12px 28px", fontSize: "0.95rem" }}
                    >
                        Launch Practice Quiz →
                    </button>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 5: OFFICIAL EXAM LAUNCHER */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "exam" && (
                <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "32px", maxWidth: "700px", margin: "0 auto 32px auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                        <div style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            background: "rgba(217, 119, 6, 0.1)",
                            color: "#d97706",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px auto"
                        }}>
                            <Award size={32} />
                        </div>
                        <h3 style={{ margin: "0 0 6px 0", fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
                            Official 100-Question Certification Exam
                        </h3>
                        <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                            Course: {course.code} — {course.title}
                        </span>
                    </div>

                    {/* Official Rules Box */}
                    <div style={{ background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "18px", marginBottom: "24px", fontSize: "0.85rem", color: "#334155" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9rem", fontWeight: 800, color: "#0f172a" }}>
                            Official Examination Rules & Grading
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <li><strong>100 Questions</strong> covering all curriculum topics and calculation scenarios.</li>
                            <li><strong>90 Minutes</strong> time limit with live countdown timer.</li>
                            <li><strong>80% (80/100)</strong> required to earn Official Certificate.</li>
                            <li><strong>90% - 99%</strong> awards Certificate with <strong>HONORS</strong>.</li>
                            <li><strong>100%</strong> awards Certificate with <strong>DISTINCTION</strong>.</li>
                        </ul>
                    </div>

                    {!isExamReady ? (
                        <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "10px", padding: "14px", textAlign: "center", color: "#b45309", fontSize: "0.85rem", fontWeight: 600 }}>
                            <Lock size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                            Exam is locked. Complete at least 80% of the lessons to unlock the official certification exam.
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={onStartOfficialExam}
                            className="wm-btn-primary"
                            style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "1rem", background: "#d97706" }}
                        >
                            <Sparkles size={18} /> I Am Ready — Begin Official 100-Question Exam
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
