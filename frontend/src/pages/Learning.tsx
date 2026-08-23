import React, { useState } from "react";
import {
    BookOpen,
    CheckCircle2,
    Award,
    ChevronRight,
    X,
    Lightbulb,
    Sparkles,
    Check,
} from "lucide-react";

interface Lesson {
    id: string;
    title: string;
    duration: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    summary: string;
    content: string[];
    keyTakeaways: string[];
    quiz: {
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
    };
}

interface Module {
    id: string;
    title: string;
    icon: string;
    description: string;
    category: string;
    lessons: Lesson[];
}

const MODULES: Module[] = [
    {
        id: "mod-1",
        title: "Financial Foundations & Cashflow",
        icon: "🌱",
        category: "Basics",
        description: "Master the difference between assets and liabilities, inflation erosion, and cashflow dynamics.",
        lessons: [
            {
                id: "l-1-1",
                title: "Assets vs. Liabilities: The Cashflow Truth",
                duration: "4 min read",
                level: "Beginner",
                summary: "Learn what truly puts money into your pocket versus what takes money out.",
                content: [
                    "In simple terms, an asset is anything that puts money in your pocket on a recurring or capital appreciation basis (e.g., dividend stocks, rental property, index funds, treasury bonds).",
                    "A liability is anything that takes money out of your pocket through depreciation, interest, and maintenance (e.g., high-interest credit card debt, car loans, depreciating luxury gadgets).",
                    "Wallet-mate's core philosophy is to systematically maximize your income-generating assets while capping recurring liabilities.",
                ],
                keyTakeaways: [
                    "Assets generate positive cashflow or capital growth.",
                    "Liabilities continuously drain monthly surplus.",
                    "Track your Net Worth = Total Assets - Total Liabilities.",
                ],
                quiz: {
                    question: "Which of the following is considered an asset?",
                    options: [
                        "A depreciating luxury car with EMI",
                        "A low-cost broad market index fund",
                        "A credit card balance carried month to month",
                        "A high-maintenance lifestyle subscription",
                    ],
                    correctAnswer: 1,
                    explanation: "Broad market index funds appreciate over time and generate compound returns, making them genuine wealth-building assets.",
                },
            },
            {
                id: "l-1-2",
                title: "Understanding Inflation: The Silent Money Thief",
                duration: "5 min read",
                level: "Beginner",
                summary: "Why keeping all your savings in idle cash guarantees a loss in purchasing power over time.",
                content: [
                    "Inflation is the rate at which the general level of prices for goods and services rises. When inflation runs at 6% per year, an item that costs ₹100 today will cost ₹106 next year.",
                    "If your savings sit in an account earning only 3% interest, your real purchasing power is declining by ~3% every year.",
                    "To beat inflation, a portion of your long-term wealth must be deployed into equity index funds or growth assets that outpace retail CPI inflation.",
                ],
                keyTakeaways: [
                    "Cash loses purchasing power every year due to inflation.",
                    "Real Return = Nominal Return - Inflation Rate.",
                    "Equities historically provide the most accessible inflation hedge over 5+ year horizons.",
                ],
                quiz: {
                    question: "If inflation is 6% and your savings account yields 3.5%, what is your real annual return?",
                    options: [
                        "+3.5%",
                        "-2.5%",
                        "+9.5%",
                        "0%",
                    ],
                    correctAnswer: 1,
                    explanation: "Real return is calculated as 3.5% - 6.0% = -2.5% purchasing power loss.",
                },
            },
        ],
    },
    {
        id: "mod-2",
        title: "The 50/30/20 & Zero-Based Budgeting",
        icon: "⚖️",
        category: "Budgeting",
        description: "Proven frameworks to divide your net income between needs, wants, and financial independence.",
        lessons: [
            {
                id: "l-2-1",
                title: "The Classic 50/30/20 Rule Decoded",
                duration: "5 min read",
                level: "Beginner",
                summary: "How to allocate your paycheck so you never have to guess whether you can afford something.",
                content: [
                    "The 50/30/20 framework splits your post-tax income into three simple buckets: 50% for Needs (rent, groceries, utilities, EMIs), 30% for Wants (dining out, travel, entertainment), and 20% for Savings & Investments (SIPs, emergency fund, debt paydown).",
                    "By establishing these proportions automatically at the start of each month, you can spend guilt-free on your 30% wants knowing your future is secured.",
                ],
                keyTakeaways: [
                    "50% Needs: Housing, food, bills, healthcare.",
                    "30% Wants: Hobbies, lifestyle, leisure, dining.",
                    "20% Wealth: Emergency fund, index SIPs, retirement.",
                ],
                quiz: {
                    question: "If your monthly income is ₹60,000, how much should go to savings under the 50/30/20 rule?",
                    options: [
                        "₹6,000",
                        "₹12,000",
                        "₹18,000",
                        "₹30,000",
                    ],
                    correctAnswer: 1,
                    explanation: "20% of ₹60,000 is exactly ₹12,000 allocated directly toward savings and investments.",
                },
            },
        ],
    },
    {
        id: "mod-3",
        title: "Index Investing & Compound Interest",
        icon: "📈",
        category: "Investing",
        description: "Harness the power of systematic rupee-cost averaging and passive broad-market compounding.",
        lessons: [
            {
                id: "l-3-1",
                title: "The Magic of Rupee Cost Averaging (SIP)",
                duration: "6 min read",
                level: "Intermediate",
                summary: "Why automated monthly investing beats trying to time the market peaks and troughs.",
                content: [
                    "Rupee-cost averaging through Systematic Investment Plans (SIPs) removes emotion from investing. When markets dip, your fixed rupee amount buys more units; when markets rise, it buys fewer units.",
                    "Over long periods (7-10+ years), this significantly lowers your average cost per unit and allows compound interest to exponentialize your capital base.",
                ],
                keyTakeaways: [
                    "SIPs eliminate the stress of market timing.",
                    "Market downturns become buying opportunities for long-term investors.",
                    "Discipline and time in the market beat timing the market.",
                ],
                quiz: {
                    question: "What is the primary advantage of a monthly SIP over lump-sum market timing?",
                    options: [
                        "Guarantees you never lose money in any single month",
                        "Averages down your acquisition cost automatically across market cycles",
                        "Eliminates government capital gains tax entirely",
                        "Offers a fixed guaranteed interest rate like a fixed deposit",
                    ],
                    correctAnswer: 1,
                    explanation: "Rupee-cost averaging buys more units at market lows, lowering average holding cost without needing to predict tops or bottoms.",
                },
            },
        ],
    },
];

const Learning: React.FC = () => {
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem("finmitra_completed_lessons");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Quiz state
    const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

    const categories = ["All", ...Array.from(new Set(MODULES.map((m) => m.category)))];

    const filteredModules = MODULES.filter(
        (m) => selectedCategory === "All" || m.category === selectedCategory
    );

    const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedCount = completedLessonIds.length;
    const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const openLesson = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setSelectedQuizOption(null);
        setQuizSubmitted(false);
    };

    const handleQuizSubmit = () => {
        if (selectedQuizOption === null || !selectedLesson) return;
        setQuizSubmitted(true);

        if (selectedQuizOption === selectedLesson.quiz.correctAnswer) {
            if (!completedLessonIds.includes(selectedLesson.id)) {
                const updated = [...completedLessonIds, selectedLesson.id];
                setCompletedLessonIds(updated);
                localStorage.setItem("finmitra_completed_lessons", JSON.stringify(updated));
            }
        }
    };

    return (
        <div className="wm-page-wrapper">
            {/* Header */}
            <div className="wm-page-header">
                <div>
                    <h1 className="wm-page-title">Financial Education Academy</h1>
                    <p className="wm-page-subtitle">
                        Master cashflow optimization, budgeting principles, and long-term wealth compounding.
                    </p>
                </div>

                <div className="wm-learning-progress-badge">
                    <Award size={18} color="#635bff" />
                    <span>{completedCount} of {totalLessons} Lessons Mastered ({progressPct}%)</span>
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="wm-tab-pills" style={{ marginBottom: "24px" }}>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        className={`wm-tab-pill ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        <span>{cat}</span>
                    </button>
                ))}
            </div>

            {/* Modules & Lessons Grid */}
            <div className="wm-modules-grid">
                {filteredModules.map((module) => (
                    <div key={module.id} className="wm-card wm-module-card">
                        <div className="wm-module-header">
                            <div className="wm-module-icon">{module.icon}</div>
                            <div>
                                <span className="wm-module-cat">{module.category}</span>
                                <h3 className="wm-module-title">{module.title}</h3>
                            </div>
                        </div>
                        <p className="wm-module-desc">{module.description}</p>

                        <div className="wm-lessons-list">
                            {module.lessons.map((lesson) => {
                                const isCompleted = completedLessonIds.includes(lesson.id);
                                return (
                                    <div
                                        key={lesson.id}
                                        className={`wm-lesson-item ${isCompleted ? 'completed' : ''}`}
                                        onClick={() => openLesson(lesson)}
                                    >
                                        <div className="wm-lesson-info">
                                            <div className="wm-lesson-status-icon">
                                                {isCompleted ? (
                                                    <CheckCircle2 size={16} color="#10b981" />
                                                ) : (
                                                    <BookOpen size={16} color="#635bff" />
                                                )}
                                            </div>
                                            <div>
                                                <h5 className="wm-lesson-title">{lesson.title}</h5>
                                                <div className="wm-lesson-meta">
                                                    <span>{lesson.duration}</span>
                                                    <span>•</span>
                                                    <span>{lesson.level}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button type="button" className="wm-lesson-arrow-btn">
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lesson Reader Modal */}
            {selectedLesson && (
                <div className="wm-modal-backdrop" onClick={() => setSelectedLesson(null)}>
                    <div className="wm-modal-card wm-lesson-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="wm-modal-header">
                            <div>
                                <div className="wm-lesson-modal-badge">
                                    <BookOpen size={13} />
                                    <span>{selectedLesson.duration} • {selectedLesson.level}</span>
                                </div>
                                <h3>{selectedLesson.title}</h3>
                            </div>
                            <button type="button" onClick={() => setSelectedLesson(null)} className="wm-modal-close-btn">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="wm-lesson-modal-body">
                            {/* Summary callout */}
                            <div className="wm-lesson-summary-box">
                                <Lightbulb size={18} color="#635bff" />
                                <p>{selectedLesson.summary}</p>
                            </div>

                            {/* Paragraphs */}
                            <div className="wm-lesson-text-content">
                                {selectedLesson.content.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>

                            {/* Key takeaways */}
                            <div className="wm-takeaways-box">
                                <h5>Key Financial Principles</h5>
                                <ul>
                                    {selectedLesson.keyTakeaways.map((k, i) => (
                                        <li key={i}>
                                            <Check size={14} color="#10b981" />
                                            <span>{k}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Knowledge Check Quiz */}
                            <div className="wm-quiz-box">
                                <div className="wm-quiz-header">
                                    <Sparkles size={16} color="#635bff" />
                                    <h4>Knowledge Check</h4>
                                </div>
                                <p className="wm-quiz-question">{selectedLesson.quiz.question}</p>

                                <div className="wm-quiz-options">
                                    {selectedLesson.quiz.options.map((opt, idx) => {
                                        const isSelected = selectedQuizOption === idx;
                                        const isCorrect = idx === selectedLesson.quiz.correctAnswer;
                                        let btnClass = "wm-quiz-opt";
                                        if (isSelected) btnClass += " selected";
                                        if (quizSubmitted) {
                                            if (isCorrect) btnClass += " correct";
                                            else if (isSelected && !isCorrect) btnClass += " incorrect";
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                className={btnClass}
                                                onClick={() => !quizSubmitted && setSelectedQuizOption(idx)}
                                                disabled={quizSubmitted}
                                            >
                                                <span className="opt-indicator">{String.fromCharCode(65 + idx)}</span>
                                                <span className="opt-text">{opt}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {!quizSubmitted ? (
                                    <button
                                        type="button"
                                        onClick={handleQuizSubmit}
                                        disabled={selectedQuizOption === null}
                                        className="wm-btn-primary"
                                        style={{ marginTop: "16px", width: "100%" }}
                                    >
                                        Submit Answer
                                    </button>
                                ) : (
                                    <div className="wm-quiz-explanation">
                                        <div className="explanation-title">
                                            {selectedQuizOption === selectedLesson.quiz.correctAnswer ? (
                                                <span style={{ color: "#10b981", fontWeight: 600 }}>🎉 Correct! Mastered this lesson.</span>
                                            ) : (
                                                <span style={{ color: "#ef4444", fontWeight: 600 }}>❌ Not quite. Review explanation:</span>
                                            )}
                                        </div>
                                        <p>{selectedLesson.quiz.explanation}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="wm-modal-actions">
                            <button
                                type="button"
                                onClick={() => setSelectedLesson(null)}
                                className="wm-btn-secondary"
                            >
                                Close Lesson
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Learning;