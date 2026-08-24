import React, { useState, useEffect, useMemo } from "react";
import {
    LEARNING_PATHS,
    LAUNCH_LESSONS,
    GLOSSARY_TERMS,
    FINANCIAL_FORMULAS,
    WEEKLY_CHALLENGES,
    type LessonContent
} from "../data/academyContent";
import { useAcademyProgress } from "../hooks/useAcademyProgress";
import { getAcademyRecommendations } from "../utils/academyEngine";
import { calculateFinancialHealthEngine } from "../utils/financialHealth";
import { getTransactions, type Transaction } from "../api/transactions";
import { AcademyToolsSuite } from "../components/academy/AcademyTools";
import BankStatementModal from "../components/BankStatementModal";
import {
    CheckCircle2,
    Search,
    Sparkles,
    Flame,
    Zap,
    ChevronRight,
    X,
    Lightbulb,
    Check,
    Brain
} from "lucide-react";

const Learning: React.FC = () => {
    // Learning progress hook
    const {
        progress,
        level,
        masteredCount,
        appliedCount,
        startLesson,
        completeLesson,
        submitQuizMastery,
        applyActionToMoney,
        completeWeeklyChallenge
    } = useAcademyProgress();

    // Transactions & Health Engine sync for personalization
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showStatementModal, setShowStatementModal] = useState<boolean>(false);

    // Active view tabs & filter state
    const [activeTab, setActiveTab] = useState<"catalog" | "paths" | "tools" | "glossary" | "formulas" | "challenges">("catalog");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedLesson, setSelectedLesson] = useState<LessonContent | null>(null);

    // Quiz state for lesson player
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
    const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
    const [quizScorePct, setQuizScorePct] = useState<number>(0);

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

    // Dynamic personalized recommendation
    const recommendations = useMemo(() => {
        return getAcademyRecommendations(healthReport);
    }, [healthReport]);

    const primaryRec = recommendations[0];

    // Continue Learning lesson selection
    const continueLesson = useMemo(() => {
        const inProgressEntry = Object.entries(progress.lessons).find(
            ([, state]) => state.status === "In Progress" || state.status === "Completed"
        );
        if (inProgressEntry) {
            return LAUNCH_LESSONS.find(l => l.id === inProgressEntry[0]) || LAUNCH_LESSONS[0];
        }
        return LAUNCH_LESSONS[0];
    }, [progress.lessons]);

    const isFreshUser = transactions.length === 0;

    // Filter catalog lessons
    const categories = [
        "All", "Basics", "Budgeting", "Cashflow", "Transactions",
        "Emergency Fund", "Debt", "Saving", "Investing", "Tax", "Behavioral", "Wealth"
    ];

    const filteredLessons = useMemo(() => {
        return LAUNCH_LESSONS.filter((lesson) => {
            const matchesSearch =
                searchQuery === "" ||
                lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lesson.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lesson.objectives.some(o => o.toLowerCase().includes(searchQuery.toLowerCase()));

            if (!matchesSearch) return false;
            if (selectedCategory === "All") return true;

            const path = LEARNING_PATHS.find(p => p.id === lesson.pathId);
            if (!path) return false;

            if (selectedCategory === "Basics" && path.id === "path-1") return true;
            if (selectedCategory === "Cashflow" && path.id === "path-2") return true;
            if (selectedCategory === "Budgeting" && path.id === "path-3") return true;
            if (selectedCategory === "Transactions" && path.id === "path-4") return true;
            if (selectedCategory === "Emergency Fund" && path.id === "path-5") return true;
            if (selectedCategory === "Debt" && path.id === "path-6") return true;
            if (selectedCategory === "Saving" && path.id === "path-7") return true;
            if (selectedCategory === "Investing" && path.id === "path-8") return true;
            if (selectedCategory === "Tax" && path.id === "path-9") return true;
            if (selectedCategory === "Behavioral" && path.id === "path-10") return true;
            if (selectedCategory === "Wealth" && path.id === "path-11") return true;

            return false;
        });
    }, [selectedCategory, searchQuery]);

    // Filter Glossary terms
    const filteredGlossary = useMemo(() => {
        if (!searchQuery) return GLOSSARY_TERMS;
        const q = searchQuery.toLowerCase();
        return GLOSSARY_TERMS.filter(
            t => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    // Open lesson player modal
    const openLessonPlayer = (lesson: LessonContent) => {
        setSelectedLesson(lesson);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScorePct(0);
        startLesson(lesson.id);
    };

    // Quiz submit handler
    const handleQuizSubmit = () => {
        if (!selectedLesson) return;
        let correctCount = 0;
        selectedLesson.quizzes.forEach(q => {
            if (quizAnswers[q.id] === q.correctAnswer) {
                correctCount += 1;
            }
        });

        const scorePct = Math.round((correctCount / selectedLesson.quizzes.length) * 100);
        setQuizScorePct(scorePct);
        setQuizSubmitted(true);

        submitQuizMastery(selectedLesson.id, scorePct, 10);
        completeLesson(selectedLesson.id, selectedLesson.xpReward);
    };

    return (
        <div className="wm-page-wrapper">
            {/* Header & Academy Identity */}
            <div className="wm-page-header" style={{ marginBottom: "24px" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <h1 className="wm-page-title" style={{ margin: 0 }}>Financial Education Academy</h1>
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
                marginBottom: "28px"
            }}>
                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Mastered</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                        {masteredCount} / {LAUNCH_LESSONS.length}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 700 }}>
                        {Math.round((masteredCount / LAUNCH_LESSONS.length) * 100)}% Complete
                    </span>
                </div>

                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Applied Actions</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#10b981", margin: "4px 0" }}>
                        {appliedCount}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Applied to Real Money</span>
                </div>

                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Learning Streak</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f59e0b", margin: "4px 0", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Flame size={18} /> {progress.streakDays} Days
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Active Practice</span>
                </div>

                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Total XP</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#6366f1", margin: "4px 0", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Zap size={18} /> {progress.xp} XP
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#6366f1", fontWeight: 700 }}>+25 XP Available</span>
                </div>

                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Current Level</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                        {level.name}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{level.next}</span>
                </div>

                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Learning Time</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                        {Math.floor(progress.learningTimeMinutes / 60)}h {progress.learningTimeMinutes % 60}m
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Invested Time</span>
                </div>

                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Certificates</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                        {progress.earnedCertificates.length} Earned
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Path Mastery</span>
                </div>

                <div className="wm-card" style={{ padding: "16px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Quizzes Completed</span>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                        {Object.values(progress.lessons).filter(l => l.quizScorePct !== undefined).length}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 700 }}>80%+ Pass Mark</span>
                </div>
            </div>

            {/* CONTINUE LEARNING & RECOMMENDED FOR YOU (DUAL HERO CARDS) */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px",
                marginBottom: "28px"
            }}>
                {/* Continue Learning Card */}
                <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1", backgroundColor: "rgba(99, 102, 241, 0.1)", padding: "3px 10px", borderRadius: "10px" }}>
                        Continue Learning
                    </span>
                    <h3 style={{ margin: "10px 0 6px 0", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                        {continueLesson.title}
                    </h3>
                    <p style={{ margin: "0 0 14px 0", fontSize: "0.82rem", color: "#475569", lineHeight: "1.4" }}>
                        {continueLesson.summary}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
                            {continueLesson.duration} • {continueLesson.level} • +{continueLesson.xpReward} XP
                        </span>
                        <button
                            type="button"
                            onClick={() => openLessonPlayer(continueLesson)}
                            className="wm-btn-primary"
                            style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                        >
                            Continue →
                        </button>
                    </div>
                </div>

                {/* Recommended For You Card (Tied to Financial Health Engine) */}
                <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Sparkles size={16} color="#6366f1" />
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1" }}>Recommended For You</span>
                    </div>

                    <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                        {primaryRec.reasonTitle}
                    </h4>

                    <p style={{ margin: "0 0 12px 0", fontSize: "0.82rem", color: "#475569", lineHeight: "1.4" }}>
                        {primaryRec.reasonDetail}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        <div>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{primaryRec.lesson.title}</span>
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{primaryRec.lesson.duration} • +{primaryRec.lesson.xpReward} XP</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => openLessonPlayer(primaryRec.lesson)}
                            className="wm-btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.8rem", color: "#6366f1", borderColor: "#6366f1" }}
                        >
                            Learn & Improve
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB NAVIGATION: Catalog, Paths, Tools, Glossary, Formulas, Challenges */}
            <div className="wm-tab-pills" style={{ marginBottom: "20px" }}>
                {[
                    { id: "catalog", label: `Lesson Library (${LAUNCH_LESSONS.length})` },
                    { id: "paths", label: `Learning Paths (${LEARNING_PATHS.length})` },
                    { id: "tools", label: "Interactive Tools" },
                    { id: "challenges", label: "Weekly Challenges" },
                    { id: "glossary", label: `Glossary (${GLOSSARY_TERMS.length})` },
                    { id: "formulas", label: `Formulas (${FINANCIAL_FORMULAS.length})` }
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

            {/* SEARCH BAR & CATEGORY FILTERS */}
            {(activeTab === "catalog" || activeTab === "glossary") && (
                <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
                            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type="text"
                                placeholder="Search lessons, concepts, formulas, terminology..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 14px 10px 40px",
                                    borderRadius: "12px",
                                    border: "1px solid #cbd5e1",
                                    fontSize: "0.88rem",
                                    outline: "none"
                                }}
                            />
                        </div>
                    </div>

                    {activeTab === "catalog" && (
                        <div className="wm-tab-pills" style={{ marginBottom: "0" }}>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`wm-tab-pill ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{ fontSize: "0.78rem", padding: "6px 12px" }}
                                >
                                    <span>{cat}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW 1: LESSON CATALOG */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "catalog" && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "18px",
                    marginBottom: "32px"
                }}>
                    {filteredLessons.map((lesson) => {
                        const lessonState = progress.lessons[lesson.id];
                        const isMastered = lessonState?.status === "Mastered" || lessonState?.status === "Applied";
                        const isApplied = lessonState?.status === "Applied";
                        const isCompleted = lessonState?.status === "Completed" || isMastered;

                        return (
                            <div
                                key={lesson.id}
                                className="wm-card"
                                onClick={() => openLessonPlayer(lesson)}
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "14px",
                                    border: "1px solid #e2e8f0",
                                    padding: "18px",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "6px" }}>
                                            {lesson.level} • {lesson.duration}
                                        </span>

                                        {isApplied ? (
                                            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "2px 8px", borderRadius: "8px" }}>
                                                ✓ Applied
                                            </span>
                                        ) : isMastered ? (
                                            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#6366f1", backgroundColor: "rgba(99, 102, 241, 0.1)", padding: "2px 8px", borderRadius: "8px" }}>
                                                ✓ Mastered
                                            </span>
                                        ) : isCompleted ? (
                                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#3b82f6", backgroundColor: "rgba(59, 130, 246, 0.1)", padding: "2px 8px", borderRadius: "8px" }}>
                                                Completed
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#f59e0b", backgroundColor: "rgba(245, 158, 11, 0.1)", padding: "2px 8px", borderRadius: "8px" }}>
                                                +{lesson.xpReward} XP
                                            </span>
                                        )}
                                    </div>

                                    <h4 style={{ margin: "4px 0 6px 0", fontSize: "0.98rem", fontWeight: 800, color: "#0f172a", lineHeight: "1.3" }}>
                                        {lesson.title}
                                    </h4>

                                    <p style={{ margin: "0 0 12px 0", fontSize: "0.78rem", color: "#64748b", lineHeight: "1.4" }}>
                                        {lesson.summary}
                                    </p>
                                </div>

                                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                                    <span style={{ color: "#6366f1", fontWeight: 600 }}>Improves Health Score</span>
                                    <ChevronRight size={16} color="#6366f1" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW 2: 11 LEARNING PATHS */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "paths" && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "20px",
                    marginBottom: "32px"
                }}>
                    {LEARNING_PATHS.map((path) => {
                        const pathLessons = LAUNCH_LESSONS.filter(l => l.pathId === path.id);
                        const pathMastered = pathLessons.filter(l => {
                            const st = progress.lessons[l.id]?.status;
                            return st === "Mastered" || st === "Applied";
                        }).length;
                        const pct = pathLessons.length > 0 ? Math.round((pathMastered / pathLessons.length) * 100) : 0;

                        return (
                            <div key={path.id} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                                    <div style={{ fontSize: "1.8rem" }}>{path.icon}</div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{path.name}</h3>
                                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{pathLessons.length} Lessons • {path.estimatedDuration}</span>
                                    </div>
                                </div>

                                <p style={{ fontSize: "0.82rem", color: "#475569", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                                    {path.shortOutcome}
                                </p>

                                <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
                                    <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#6366f1" }} />
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                                    <span style={{ fontWeight: 700, color: "#6366f1" }}>{pathMastered}/{pathLessons.length} Mastered ({pct}%)</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (pathLessons.length > 0) openLessonPlayer(pathLessons[0]);
                                        }}
                                        className="wm-btn-secondary"
                                        style={{ padding: "4px 12px", fontSize: "0.78rem" }}
                                    >
                                        Begin Path →
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW 3: INTERACTIVE TOOLS */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "tools" && (
                <AcademyToolsSuite
                    userMonthlyIncome={healthReport.monthlyIncome || 60000}
                    userMonthlyExpenses={healthReport.monthlyExpenses || 42000}
                />
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW 4: WEEKLY CHALLENGES */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "challenges" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                    {WEEKLY_CHALLENGES.map((ch) => {
                        const isDone = progress.completedChallenges.includes(ch.id);

                        return (
                            <div key={ch.id} style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "18px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6366f1", backgroundColor: "rgba(99, 102, 241, 0.1)", padding: "2px 8px", borderRadius: "6px" }}>
                                        +{ch.xpReward} XP
                                    </span>
                                    {isDone && <CheckCircle2 size={18} color="#10b981" />}
                                </div>

                                <h4 style={{ margin: "4px 0 6px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>{ch.title}</h4>
                                <p style={{ margin: "0 0 14px 0", fontSize: "0.78rem", color: "#475569", lineHeight: "1.4" }}>{ch.description}</p>

                                <button
                                    type="button"
                                    onClick={() => completeWeeklyChallenge(ch.id, ch.xpReward)}
                                    disabled={isDone}
                                    className={isDone ? "wm-btn-secondary" : "wm-btn-primary"}
                                    style={{ width: "100%", justifyContent: "center", fontSize: "0.8rem" }}
                                >
                                    {isDone ? "Challenge Completed!" : "Complete Challenge"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW 5: GLOSSARY */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "glossary" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                    {filteredGlossary.map((g) => (
                        <div key={g.id} style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>{g.term}</h4>
                                <span style={{ fontSize: "0.7rem", color: "#64748b", backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "6px" }}>{g.category}</span>
                            </div>
                            <p style={{ margin: "4px 0 8px 0", fontSize: "0.78rem", color: "#475569", lineHeight: "1.4" }}>{g.definition}</p>
                            <div style={{ fontSize: "0.72rem", color: "#6366f1", fontWeight: 600, background: "rgba(99, 102, 241, 0.05)", padding: "6px 10px", borderRadius: "6px" }}>
                                Example: {g.rupeeExample}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW 6: FORMULAS */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "formulas" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                    {FINANCIAL_FORMULAS.map((f) => (
                        <div key={f.id} style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px" }}>
                            <h4 style={{ margin: "0 0 6px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>{f.name}</h4>
                            <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem", fontWeight: 800, color: "#6366f1", marginBottom: "8px" }}>
                                {f.expression}
                            </div>
                            <p style={{ margin: "0 0 8px 0", fontSize: "0.78rem", color: "#475569" }}>{f.explanation}</p>
                            <div style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700 }}>Example: {f.example}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* FULL LESSON PLAYER MODAL */}
            {/* ------------------------------------------------------------- */}
            {selectedLesson && (
                <div className="wm-modal-backdrop" onClick={() => setSelectedLesson(null)}>
                    <div className="wm-modal-card wm-lesson-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "780px", maxHeight: "90vh", overflowY: "auto" }}>
                        {/* Modal Header */}
                        <div className="wm-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                            <div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1", backgroundColor: "rgba(99, 102, 241, 0.1)", padding: "3px 10px", borderRadius: "8px" }}>
                                    {selectedLesson.level} • {selectedLesson.duration} • +{selectedLesson.xpReward} XP
                                </span>
                                <h2 style={{ margin: "6px 0 0 0", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>{selectedLesson.title}</h2>
                            </div>
                            <button type="button" onClick={() => setSelectedLesson(null)} className="wm-modal-close-btn">
                                <X size={20} />
                            </button>
                        </div>

                        {/* 60-Second Summary Callout */}
                        <div style={{ background: "rgba(99, 102, 241, 0.06)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "12px", padding: "14px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                            <Lightbulb size={20} color="#6366f1" style={{ marginTop: "2px", flexShrink: 0 }} />
                            <div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6366f1" }}>60-Second Summary</span>
                                <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#0f172a", fontWeight: 600 }}>{selectedLesson.summary}</p>
                            </div>
                        </div>

                        {/* Objectives */}
                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>Learning Objectives</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {selectedLesson.objectives.map((obj, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#475569" }}>
                                        <Check size={14} color="#10b981" />
                                        <span>{obj}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Core Content */}
                        <div style={{ marginBottom: "20px", fontSize: "0.88rem", color: "#334155", lineHeight: "1.6" }}>
                            {selectedLesson.coreText.map((paragraph, i) => (
                                <p key={i} style={{ marginBottom: "12px" }}>{paragraph}</p>
                            ))}
                        </div>

                        {/* Formula Callout if present */}
                        {selectedLesson.formula && (
                            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "14px", marginBottom: "20px" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>{selectedLesson.formula.name}</span>
                                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6366f1", margin: "4px 0" }}>{selectedLesson.formula.expression}</div>
                                <span style={{ fontSize: "0.78rem", color: "#475569" }}>{selectedLesson.formula.explanation}</span>
                            </div>
                        )}

                        {/* ₹ Indian Example */}
                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#10b981" }}>Real-Life ₹ Example — {selectedLesson.rupeeExample.title}</span>
                            <p style={{ margin: "6px 0 8px 0", fontSize: "0.82rem", color: "#475569" }}>{selectedLesson.rupeeExample.scenario}</p>
                            <div style={{ fontSize: "0.78rem", color: "#0f172a", fontWeight: 700, background: "rgba(16, 185, 129, 0.08)", padding: "8px 12px", borderRadius: "8px" }}>
                                Takeaway: {selectedLesson.rupeeExample.takeaway}
                            </div>
                        </div>

                        {/* YOUR NUMBERS / TRANSACTION SYNC */}
                        <div style={{ background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px", marginBottom: "20px" }}>
                            <h5 style={{ margin: "0 0 6px 0", fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>YOUR MONEY PATTERNS</h5>
                            {isFreshUser ? (
                                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                    Import your bank statement to connect this lesson to your actual spending numbers.
                                </div>
                            ) : (
                                <div style={{ fontSize: "0.82rem", color: "#0f172a", fontWeight: 600 }}>
                                    Your Savings Rate: <strong style={{ color: "#10b981" }}>{healthReport.savingsRate}%</strong> | Monthly Surplus: <strong style={{ color: "#6366f1" }}>₹{healthReport.monthlySurplus.toLocaleString("en-IN")}</strong>
                                </div>
                            )}
                        </div>

                        {/* Checkpoint Quiz */}
                        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                <Sparkles size={18} color="#6366f1" />
                                <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>Checkpoint Quiz (80%+ Pass Required for Mastery)</h4>
                            </div>

                            {selectedLesson.quizzes.map((quiz, qIdx) => (
                                <div key={quiz.id} style={{ marginBottom: "16px" }}>
                                    <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", margin: "0 0 8px 0" }}>
                                        Q{qIdx + 1}: {quiz.question}
                                    </p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {quiz.options.map((opt, optIdx) => {
                                            const isSelected = quizAnswers[quiz.id] === optIdx;
                                            const isCorrect = optIdx === quiz.correctAnswer;
                                            let bg = "#f8fafc";
                                            let border = "#cbd5e1";
                                            if (isSelected) { bg = "rgba(99, 102, 241, 0.1)"; border = "#6366f1"; }
                                            if (quizSubmitted) {
                                                if (isCorrect) { bg = "rgba(16, 185, 129, 0.1)"; border = "#10b981"; }
                                                else if (isSelected && !isCorrect) { bg = "rgba(239, 68, 68, 0.1)"; border = "#ef4444"; }
                                            }

                                            return (
                                                <button
                                                    key={optIdx}
                                                    type="button"
                                                    disabled={quizSubmitted}
                                                    onClick={() => setQuizAnswers(prev => ({ ...prev, [quiz.id]: optIdx }))}
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

                            {!quizSubmitted ? (
                                <button
                                    type="button"
                                    onClick={handleQuizSubmit}
                                    disabled={Object.keys(quizAnswers).length < selectedLesson.quizzes.length}
                                    className="wm-btn-primary"
                                    style={{ width: "100%", justifyContent: "center" }}
                                >
                                    Submit Quiz & Claim Mastery
                                </button>
                            ) : (
                                <div style={{ background: quizScorePct >= 80 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", padding: "12px", borderRadius: "8px", border: `1px solid ${quizScorePct >= 80 ? "#10b981" : "#ef4444"}`, textAlign: "center" }}>
                                    <strong style={{ color: quizScorePct >= 80 ? "#10b981" : "#ef4444" }}>
                                        {quizScorePct >= 80 ? `🎉 Quiz Mastered! Score: ${quizScorePct}% (+10 XP)` : `❌ Score: ${quizScorePct}%. Review the core concepts and try again.`}
                                    </strong>
                                </div>
                            )}
                        </div>

                        {/* APPLY TO MY MONEY ACTION */}
                        <div style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#ffffff", borderRadius: "14px", padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <span style={{ fontSize: "0.75rem", opacity: 0.9, fontWeight: 700 }}>APPLY TO MY MONEY (+25 XP)</span>
                                <h4 style={{ margin: "2px 0 0 0", fontSize: "1rem", fontWeight: 800 }}>{selectedLesson.appliedAction.title}</h4>
                                <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", opacity: 0.9 }}>{selectedLesson.appliedAction.actionText}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => applyActionToMoney(selectedLesson.id, selectedLesson.appliedAction.xpReward)}
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