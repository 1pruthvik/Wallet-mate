import React, { useState, useEffect, useMemo } from "react";
import "../styles/academy.css";

// 1. Core Financial Education Imports
import {
    LAUNCH_LESSONS,
    type LessonContent
} from "../data/academyContent";
import { useAcademyProgress } from "../hooks/useAcademyProgress";
import { getAcademyRecommendations } from "../utils/academyEngine";
import { calculateFinancialHealthEngine } from "../utils/financialHealth";
import { getTransactions, type Transaction } from "../api/transactions";
import BankStatementModal from "../components/BankStatementModal";

// 2. Earnings & Profit Certification Imports
import {
    EARNINGS_COURSES,
    type EarningsCourse,
    type EarningsLesson
} from "../data/earningsCertificationData";
import { useEarningsAcademy } from "../hooks/useEarningsAcademy";
import { EarningsHero } from "../components/academy/EarningsHero";
import { EarningsCourseGrid } from "../components/academy/EarningsCourseGrid";
import { EarningsCourseHub } from "../components/academy/EarningsCourseHub";
import { EarningsLessonViewer } from "../components/academy/EarningsLessonViewer";
import { EarningsPracticeQuiz } from "../components/academy/EarningsPracticeQuiz";
import { EarningsExamInterface } from "../components/academy/EarningsExamInterface";
import { EarningsExamResult } from "../components/academy/EarningsExamResult";
import { EarningsCertificateVault } from "../components/academy/EarningsCertificateVault";
import { EarningsTranscript } from "../components/academy/EarningsTranscript";
import { EarningsToolsSuite as EarningsCalculators } from "../components/academy/EarningsToolsSuite";
import { GrandCapstoneHub } from "../components/academy/GrandCapstoneHub";

import {
    Sparkles,
    Flame,
    Zap,
    X,
    Lightbulb,
    Check,
    Brain,
    Award,
    BookOpen,
    FileText,
    Calculator
} from "lucide-react";

const Learning: React.FC = () => {
    // Transactions & Health Engine sync for personalization
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showStatementModal, setShowStatementModal] = useState<boolean>(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getTransactions();
                setTransactions(data || []);
            } catch {
                setTransactions([]);
            }
        };
        load();
    }, []);

    // Calculate dynamic health report for personalization
    const healthReport = useMemo(() => {
        return calculateFinancialHealthEngine(transactions, "THIS_MONTH");
    }, [transactions]);

    // -----------------------------------------------------------------------
    // Core Academy Hook State
    // -----------------------------------------------------------------------
    const {
        progress: coreProgress,
        level: coreLevel,
        masteredCount: coreMasteredCount,
        appliedCount: coreAppliedCount,
        startLesson: startCoreLesson,
        completeLesson: completeCoreLesson,
        submitQuizMastery: submitCoreQuizMastery,
        applyActionToMoney: applyCoreActionToMoney
    } = useAcademyProgress();

    const [selectedCoreLesson, setSelectedCoreLesson] = useState<LessonContent | null>(null);
    const [coreQuizAnswers, setCoreQuizAnswers] = useState<Record<string, number>>({});
    const [coreQuizSubmitted, setCoreQuizSubmitted] = useState<boolean>(false);
    const [coreQuizScorePct, setCoreQuizScorePct] = useState<number>(0);

    const coreRecommendations = useMemo(() => {
        return getAcademyRecommendations(healthReport);
    }, [healthReport]);

    const corePrimaryRec = coreRecommendations[0];

    const continueCoreLesson = useMemo(() => {
        const inProgressEntry = Object.entries(coreProgress.lessons).find(
            ([, state]) => state.status === "In Progress" || state.status === "Completed"
        );
        if (inProgressEntry) {
            return LAUNCH_LESSONS.find(l => l.id === inProgressEntry[0]) || LAUNCH_LESSONS[0];
        }
        return LAUNCH_LESSONS[0];
    }, [coreProgress.lessons]);

    const openCoreLessonPlayer = (lesson: LessonContent) => {
        setSelectedCoreLesson(lesson);
        setCoreQuizAnswers({});
        setCoreQuizSubmitted(false);
        setCoreQuizScorePct(0);
        startCoreLesson(lesson.id);
    };

    const handleCoreQuizSubmit = () => {
        if (!selectedCoreLesson) return;
        let correctCount = 0;
        selectedCoreLesson.quizzes.forEach(q => {
            if (coreQuizAnswers[q.id] === q.correctAnswer) {
                correctCount += 1;
            }
        });

        const scorePct = Math.round((correctCount / selectedCoreLesson.quizzes.length) * 100);
        setCoreQuizScorePct(scorePct);
        setCoreQuizSubmitted(true);

        submitCoreQuizMastery(selectedCoreLesson.id, scorePct, 10);
        completeCoreLesson(selectedCoreLesson.id, selectedCoreLesson.xpReward);
    };

    // -----------------------------------------------------------------------
    // Earnings & Profit Certification Hook State
    // -----------------------------------------------------------------------
    const {
        state: earningsState,
        candidateName,
        currentTierObj,
        certifiedCount,
        examsCompletedCount,
        totalQuestionsAnswered,
        averageScore,
        totalCoursesCount,
        completeLesson: completeEarningsLesson,
        recordQuizScore: recordEarningsQuizScore,
        submitOfficialExam
    } = useEarningsAcademy();

    // Navigation sub-view inside Earnings track
    const [earningsSubView, setEarningsSubView] = useState<"library" | "hub" | "practice" | "exam" | "result" | "vault" | "transcript" | "tools" | "capstone">("library");
    const [selectedCourse, setSelectedCourse] = useState<EarningsCourse | null>(EARNINGS_COURSES[0]);
    const [activeEarningsLesson, setActiveEarningsLesson] = useState<EarningsLesson | null>(null);

    // Exam result state
    const [lastExamResult, setLastExamResult] = useState<{
        course: EarningsCourse;
        score: number;
        grade: "PASS" | "HONORS" | "DISTINCTION" | "FAILED";
        passed: boolean;
        timeSpentSeconds: number;
        skillBreakdown: Record<string, { correct: number; total: number; pct: number }>;
        certId?: string;
    } | null>(null);

    // Handlers for Earnings Certification Track
    const handleSelectCourse = (course: EarningsCourse) => {
        setSelectedCourse(course);
        setEarningsSubView("hub");
    };

    const handleStartPractice = (course: EarningsCourse) => {
        setSelectedCourse(course);
        setEarningsSubView("practice");
    };

    const handleStartExam = (course: EarningsCourse) => {
        setSelectedCourse(course);
        setEarningsSubView("exam");
    };

    const handleExamSubmission = (
        score: number,
        timeSpentSeconds: number,
        skillBreakdown: Record<string, { correct: number; total: number; pct: number }>
    ) => {
        if (!selectedCourse) return;
        const res = submitOfficialExam(selectedCourse, score, timeSpentSeconds, skillBreakdown);
        setLastExamResult({
            course: selectedCourse,
            score,
            grade: res.grade,
            passed: res.passed,
            timeSpentSeconds,
            skillBreakdown,
            certId: res.certId
        });
        setEarningsSubView("result");
    };

    return (
        <div className="wm-page-wrapper">
            {/* ============================================================= */}
            {/* PART 1: CORE FINANCIAL EDUCATION (TOP SECTION) */}
            {/* ============================================================= */}
            <div style={{ marginBottom: "36px" }}>
                {/* Header & Academy Identity */}
                <div className="wm-page-header" style={{ marginBottom: "20px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                            <h1 className="wm-page-title" style={{ margin: 0, fontSize: "1.85rem", fontWeight: 900, color: "#0f172a" }}>
                                Core Financial Education
                            </h1>
                            <span style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "4px 12px",
                                borderRadius: "16px",
                                backgroundColor: "rgba(99, 102, 241, 0.1)",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                color: "#6366f1",
                                fontSize: "0.75rem",
                                fontWeight: 700
                            }}>
                                <Brain size={14} />
                                Personalized Learning Platform
                            </span>
                        </div>
                        <p className="wm-page-subtitle" style={{ margin: 0, fontSize: "0.95rem", color: "#475569" }}>
                            Master cashflow, budgeting, credit, investing & long-term wealth — applied to your real money.
                        </p>
                    </div>
                </div>

                {/* HERO STATISTICS ROW (8 REAL METRICS) */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: "14px",
                    marginBottom: "24px"
                }}>
                    <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Mastered</span>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                            {coreMasteredCount} / {LAUNCH_LESSONS.length}
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 700 }}>
                            {Math.round((coreMasteredCount / LAUNCH_LESSONS.length) * 100)}% Complete
                        </span>
                    </div>

                    <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Applied Actions</span>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#10b981", margin: "4px 0" }}>
                            {coreAppliedCount}
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Applied to Real Money</span>
                    </div>

                    <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Learning Streak</span>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f59e0b", margin: "4px 0", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Flame size={18} /> {coreProgress.streakDays} Days
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Active Practice</span>
                    </div>

                    <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Total XP</span>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#6366f1", margin: "4px 0", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Zap size={18} /> {coreProgress.xp} XP
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "#6366f1", fontWeight: 700 }}>+25 XP Available</span>
                    </div>

                    <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Current Level</span>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                            {coreLevel.name}
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{coreLevel.next}</span>
                    </div>

                    <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Learning Time</span>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                            {Math.floor(coreProgress.learningTimeMinutes / 60)}h {coreProgress.learningTimeMinutes % 60}m
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Invested Time</span>
                    </div>

                    <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Certificates</span>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                            {coreProgress.earnedCertificates.length} Earned
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Path Mastery</span>
                    </div>

                    <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Quizzes Completed</span>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                            {Object.values(coreProgress.lessons).filter(l => l.quizScorePct !== undefined).length}
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 700 }}>80%+ Pass Mark</span>
                    </div>
                </div>

                {/* DUAL HERO CARDS: CONTINUE LEARNING & RECOMMENDED FOR YOU */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "20px"
                }}>
                    {/* Continue Learning Card */}
                    <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1", backgroundColor: "rgba(99, 102, 241, 0.1)", padding: "3px 10px", borderRadius: "10px" }}>
                            Continue Learning
                        </span>
                        <h3 style={{ margin: "10px 0 6px 0", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                            {continueCoreLesson.title}
                        </h3>
                        <p style={{ margin: "0 0 14px 0", fontSize: "0.82rem", color: "#475569", lineHeight: "1.4" }}>
                            {continueCoreLesson.summary}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
                                {continueCoreLesson.duration} • {continueCoreLesson.level} • +{continueCoreLesson.xpReward} XP
                            </span>
                            <button
                                type="button"
                                onClick={() => openCoreLessonPlayer(continueCoreLesson)}
                                className="wm-btn-primary"
                                style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                            >
                                Continue →
                            </button>
                        </div>
                    </div>

                    {/* Recommended For You Card */}
                    <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <Sparkles size={16} color="#6366f1" />
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1" }}>Recommended For You</span>
                        </div>

                        <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                            {corePrimaryRec.reasonTitle}
                        </h4>

                        <p style={{ margin: "0 0 12px 0", fontSize: "0.82rem", color: "#475569", lineHeight: "1.4" }}>
                            {corePrimaryRec.reasonDetail}
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                            <div>
                                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{corePrimaryRec.lesson.title}</span>
                                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{corePrimaryRec.lesson.duration} • +{corePrimaryRec.lesson.xpReward} XP</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => openCoreLessonPlayer(corePrimaryRec.lesson)}
                                className="wm-btn-secondary"
                                style={{ padding: "6px 14px", fontSize: "0.8rem", color: "#6366f1", borderColor: "#6366f1" }}
                            >
                                Learn & Improve
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================= */}
            {/* SEAMLESS SECTION DIVIDER */}
            {/* ============================================================= */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                margin: "40px 0 28px 0",
                padding: "0 4px"
            }}>
                <div style={{ height: "2px", flex: 1, background: "linear-gradient(90deg, transparent, #e2e8f0, #cbd5e1)" }} />
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 16px",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.12) 100%)",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                    borderRadius: "20px",
                    color: "#4f46e5",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase"
                }}>
                    <Award size={16} />
                    <span>Professional Certification Program</span>
                </div>
                <div style={{ height: "2px", flex: 1, background: "linear-gradient(90deg, #cbd5e1, #e2e8f0, transparent)" }} />
            </div>

            {/* ============================================================= */}
            {/* PART 2: EARNINGS & PROFIT CERTIFICATION TRACK (50 COURSES) */}
            {/* ============================================================= */}
            <div>
                {/* Header Dashboard (8 Real Metrics) */}
                <EarningsHero
                    totalCourses={totalCoursesCount}
                    certifiedCount={certifiedCount}
                    examsCompleted={examsCompletedCount}
                    questionsAnswered={totalQuestionsAnswered}
                    averageScore={averageScore}
                    totalXP={earningsState.totalXP}
                    currentTier={currentTierObj}
                    streakDays={earningsState.studyStreakDays}
                    onContinueLearning={() => {
                        setSelectedCourse(EARNINGS_COURSES[0]);
                        setEarningsSubView("hub");
                    }}
                    onViewCertifications={() => setEarningsSubView("vault")}
                    onViewProgress={() => setEarningsSubView("transcript")}
                    onPracticeQuiz={() => {
                        setSelectedCourse(EARNINGS_COURSES[0]);
                        setEarningsSubView("practice");
                    }}
                />

                {/* Earnings Navigation Sub-tabs */}
                {earningsSubView !== "exam" && (
                    <div className="wm-tab-pills" style={{ marginBottom: "24px" }}>
                        <button
                            type="button"
                            className={`wm-tab-pill ${earningsSubView === 'library' || earningsSubView === 'hub' ? 'active' : ''}`}
                            onClick={() => setEarningsSubView("library")}
                        >
                            <BookOpen size={15} />
                            <span>Course Library (50)</span>
                        </button>

                        <button
                            type="button"
                            className={`wm-tab-pill ${earningsSubView === 'vault' ? 'active' : ''}`}
                            onClick={() => setEarningsSubView("vault")}
                        >
                            <Award size={15} />
                            <span>Certificate Vault ({certifiedCount})</span>
                        </button>

                        <button
                            type="button"
                            className={`wm-tab-pill ${earningsSubView === 'transcript' ? 'active' : ''}`}
                            onClick={() => setEarningsSubView("transcript")}
                        >
                            <FileText size={15} />
                            <span>Academic Transcript</span>
                        </button>

                        <button
                            type="button"
                            className={`wm-tab-pill ${earningsSubView === 'tools' ? 'active' : ''}`}
                            onClick={() => setEarningsSubView("tools")}
                        >
                            <Calculator size={15} />
                            <span>Earnings & Profit Calculators</span>
                        </button>

                        <button
                            type="button"
                            className={`wm-tab-pill ${earningsSubView === 'capstone' ? 'active' : ''}`}
                            onClick={() => setEarningsSubView("capstone")}
                        >
                            <Sparkles size={15} />
                            <span>MFE Grand Capstone</span>
                        </button>
                    </div>
                )}

                {/* View 1: 50-Course Library */}
                {earningsSubView === "library" && (
                    <EarningsCourseGrid
                        courseProgress={earningsState.courses}
                        onSelectCourse={handleSelectCourse}
                        onOpenExam={handleStartExam}
                        onOpenPractice={handleStartPractice}
                        onViewCert={() => setEarningsSubView("vault")}
                    />
                )}

                {/* View 2: Single Course Hub */}
                {earningsSubView === "hub" && selectedCourse && (
                    <EarningsCourseHub
                        course={selectedCourse}
                        progress={earningsState.courses[selectedCourse.id]}
                        certificate={earningsState.certificates.find(c => c.courseId === selectedCourse.id)}
                        onBack={() => setEarningsSubView("library")}
                        onStartLesson={(lesson) => setActiveEarningsLesson(lesson)}
                        onStartPracticeQuiz={() => setEarningsSubView("practice")}
                        onStartOfficialExam={() => setEarningsSubView("exam")}
                        onViewCertificate={() => setEarningsSubView("vault")}
                    />
                )}

                {/* View 3: 30-Question Practice Quiz Arena */}
                {earningsSubView === "practice" && selectedCourse && (
                    <EarningsPracticeQuiz
                        course={selectedCourse}
                        onBack={() => setEarningsSubView("hub")}
                        onRecordScore={(scorePct) => recordEarningsQuizScore(selectedCourse.id, scorePct)}
                    />
                )}

                {/* View 4: 100-Question Official Certification Exam */}
                {earningsSubView === "exam" && selectedCourse && (
                    <EarningsExamInterface
                        course={selectedCourse}
                        onCancel={() => setEarningsSubView("hub")}
                        onSubmitExam={handleExamSubmission}
                    />
                )}

                {/* View 5: Exam Result Screen */}
                {earningsSubView === "result" && lastExamResult && (
                    <EarningsExamResult
                        course={lastExamResult.course}
                        score={lastExamResult.score}
                        grade={lastExamResult.grade}
                        passed={lastExamResult.passed}
                        timeSpentSeconds={lastExamResult.timeSpentSeconds}
                        skillBreakdown={lastExamResult.skillBreakdown}
                        certId={lastExamResult.certId}
                        onViewCertificate={() => setEarningsSubView("vault")}
                        onRetakeExam={() => setEarningsSubView("exam")}
                        onReturnToHub={() => setEarningsSubView("hub")}
                    />
                )}

                {/* View 6: Certificate Vault */}
                {earningsSubView === "vault" && (
                    <EarningsCertificateVault
                        certificates={earningsState.certificates}
                        diplomas={earningsState.diplomas}
                        currentTier={currentTierObj}
                        candidateName={candidateName}
                        onSelectCourseById={(cid) => {
                            const found = EARNINGS_COURSES.find(c => c.id === cid);
                            if (found) {
                                setSelectedCourse(found);
                                setEarningsSubView("hub");
                            }
                        }}
                    />
                )}

                {/* View 7: Academic Transcript */}
                {earningsSubView === "transcript" && (
                    <EarningsTranscript
                        candidateName={candidateName}
                        certificates={earningsState.certificates}
                        tierName={currentTierObj.name}
                    />
                )}

                {/* View 8: Interactive Earnings & Profit Calculators */}
                {earningsSubView === "tools" && (
                    <EarningsCalculators
                        userMonthlyIncome={healthReport?.monthlyIncome || 80000}
                        userMonthlyExpenses={healthReport?.monthlyExpenses || 52000}
                        userSurplus={healthReport?.monthlySurplus || 28000}
                    />
                )}

                {/* View 9: Grand Capstone MFE Hub */}
                {earningsSubView === "capstone" && (
                    <GrandCapstoneHub
                        totalCertified={certifiedCount}
                        capstoneState={earningsState.grandCapstone}
                        onStartCapstoneExam={() => {
                            setSelectedCourse(EARNINGS_COURSES[49]); // C50 Grand Capstone
                            setEarningsSubView("exam");
                        }}
                    />
                )}

                {/* Dedicated Lesson Player Modal for 50-Course Track */}
                {activeEarningsLesson && selectedCourse && (
                    <EarningsLessonViewer
                        course={selectedCourse}
                        lesson={activeEarningsLesson}
                        healthReport={healthReport}
                        onClose={() => setActiveEarningsLesson(null)}
                        onCompleteLesson={() => {
                            completeEarningsLesson(selectedCourse.id, activeEarningsLesson.id);
                        }}
                        onNextLesson={() => {
                            const currIdx = selectedCourse.lessons.findIndex(l => l.id === activeEarningsLesson.id);
                            if (currIdx < selectedCourse.lessons.length - 1) {
                                setActiveEarningsLesson(selectedCourse.lessons[currIdx + 1]);
                            } else {
                                setActiveEarningsLesson(null);
                            }
                        }}
                    />
                )}
            </div>

            {/* ============================================================= */}
            {/* CORE LESSON PLAYER MODAL (FROM CONTINUE / RECOMMENDED) */}
            {/* ============================================================= */}
            {selectedCoreLesson && (
                <div className="wm-modal-backdrop" onClick={() => setSelectedCoreLesson(null)}>
                    <div className="wm-modal-card wm-lesson-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "780px", maxHeight: "90vh", overflowY: "auto" }}>
                        <div className="wm-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                            <div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1", backgroundColor: "rgba(99, 102, 241, 0.1)", padding: "3px 10px", borderRadius: "8px" }}>
                                    {selectedCoreLesson.level} • {selectedCoreLesson.duration} • +{selectedCoreLesson.xpReward} XP
                                </span>
                                <h2 style={{ margin: "6px 0 0 0", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>{selectedCoreLesson.title}</h2>
                            </div>
                            <button type="button" onClick={() => setSelectedCoreLesson(null)} className="wm-modal-close-btn">
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ background: "rgba(99, 102, 241, 0.06)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "12px", padding: "14px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                            <Lightbulb size={20} color="#6366f1" style={{ marginTop: "2px", flexShrink: 0 }} />
                            <div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6366f1" }}>60-Second Summary</span>
                                <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#0f172a", fontWeight: 600 }}>{selectedCoreLesson.summary}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>Learning Objectives</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {selectedCoreLesson.objectives.map((obj, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#475569" }}>
                                        <Check size={14} color="#10b981" />
                                        <span>{obj}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: "20px", fontSize: "0.88rem", color: "#334155", lineHeight: "1.6" }}>
                            {selectedCoreLesson.coreText.map((paragraph, i) => (
                                <p key={i} style={{ marginBottom: "12px" }}>{paragraph}</p>
                            ))}
                        </div>

                        {selectedCoreLesson.formula && (
                            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "14px", marginBottom: "20px" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>{selectedCoreLesson.formula.name}</span>
                                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6366f1", margin: "4px 0" }}>{selectedCoreLesson.formula.expression}</div>
                                <span style={{ fontSize: "0.78rem", color: "#475569" }}>{selectedCoreLesson.formula.explanation}</span>
                            </div>
                        )}

                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#10b981" }}>Real-Life ₹ Example — {selectedCoreLesson.rupeeExample.title}</span>
                            <p style={{ margin: "6px 0 8px 0", fontSize: "0.82rem", color: "#475569" }}>{selectedCoreLesson.rupeeExample.scenario}</p>
                            <div style={{ fontSize: "0.78rem", color: "#0f172a", fontWeight: 700, background: "rgba(16, 185, 129, 0.08)", padding: "8px 12px", borderRadius: "8px" }}>
                                Takeaway: {selectedCoreLesson.rupeeExample.takeaway}
                            </div>
                        </div>

                        {/* Checkpoint Quiz */}
                        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                <Sparkles size={18} color="#6366f1" />
                                <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>Checkpoint Quiz</h4>
                            </div>

                            {selectedCoreLesson.quizzes.map((quiz, qIdx) => (
                                <div key={quiz.id} style={{ marginBottom: "16px" }}>
                                    <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", margin: "0 0 8px 0" }}>
                                        Q{qIdx + 1}: {quiz.question}
                                    </p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {quiz.options.map((opt, optIdx) => {
                                            const isSelected = coreQuizAnswers[quiz.id] === optIdx;
                                            const isCorrect = optIdx === quiz.correctAnswer;
                                            let bg = "#f8fafc";
                                            let border = "#cbd5e1";
                                            if (isSelected) { bg = "rgba(99, 102, 241, 0.1)"; border = "#6366f1"; }
                                            if (coreQuizSubmitted) {
                                                if (isCorrect) { bg = "rgba(16, 185, 129, 0.1)"; border = "#10b981"; }
                                                else if (isSelected && !isCorrect) { bg = "rgba(239, 68, 68, 0.1)"; border = "#ef4444"; }
                                            }

                                            return (
                                                <button
                                                    key={optIdx}
                                                    type="button"
                                                    disabled={coreQuizSubmitted}
                                                    onClick={() => setCoreQuizAnswers(prev => ({ ...prev, [quiz.id]: optIdx }))}
                                                    style={{
                                                        padding: "8px 12px",
                                                        borderRadius: "8px",
                                                        border: `1px solid ${border}`,
                                                        backgroundColor: bg,
                                                        textAlign: "left",
                                                        fontSize: "0.8rem",
                                                        cursor: "pointer",
                                                        fontWeight: isSelected ? 700 : 500
                                                    }}
                                                >
                                                    {String.fromCharCode(65 + optIdx)}. {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {!coreQuizSubmitted ? (
                                <button
                                    type="button"
                                    onClick={handleCoreQuizSubmit}
                                    disabled={Object.keys(coreQuizAnswers).length < selectedCoreLesson.quizzes.length}
                                    className="wm-btn-primary"
                                    style={{ width: "100%", justifyContent: "center" }}
                                >
                                    Submit Quiz & Claim Mastery
                                </button>
                            ) : (
                                <div style={{ background: coreQuizScorePct >= 80 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", padding: "12px", borderRadius: "8px", border: `1px solid ${coreQuizScorePct >= 80 ? "#10b981" : "#ef4444"}`, textAlign: "center" }}>
                                    <strong style={{ color: coreQuizScorePct >= 80 ? "#10b981" : "#ef4444" }}>
                                        {coreQuizScorePct >= 80 ? `🎉 Quiz Mastered! Score: ${coreQuizScorePct}% (+10 XP)` : `❌ Score: ${coreQuizScorePct}%. Review the core concepts and try again.`}
                                    </strong>
                                </div>
                            )}
                        </div>

                        <div style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#ffffff", borderRadius: "14px", padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <span style={{ fontSize: "0.75rem", opacity: 0.9, fontWeight: 700 }}>APPLY TO MY MONEY (+25 XP)</span>
                                <h4 style={{ margin: "2px 0 0 0", fontSize: "1rem", fontWeight: 800 }}>{selectedCoreLesson.appliedAction.title}</h4>
                                <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", opacity: 0.9 }}>{selectedCoreLesson.appliedAction.actionText}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => applyCoreActionToMoney(selectedCoreLesson.id, selectedCoreLesson.appliedAction.xpReward)}
                                style={{ padding: "8px 16px", borderRadius: "10px", backgroundColor: "#ffffff", color: "#6366f1", fontWeight: 800, border: "none", cursor: "pointer" }}
                            >
                                Mark Applied ✓
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Statement Modal Trigger */}
            <BankStatementModal
                isOpen={showStatementModal}
                onClose={() => setShowStatementModal(false)}
                onImportSuccess={(newTxs) => {
                    setTransactions(prev => [...newTxs, ...prev]);
                }}
            />
        </div>
    );
};

export default Learning;