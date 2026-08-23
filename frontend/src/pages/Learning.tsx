import React, { useState } from "react";

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
                    "FinMitra's core philosophy is to systematically maximize your income-generating assets while capping recurring liabilities."
                ],
                keyTakeaways: [
                    "Assets generate positive cashflow or capital growth.",
                    "Liabilities continuously drain monthly surplus.",
                    "Track your Net Worth = Total Assets - Total Liabilities."
                ],
                quiz: {
                    question: "Which of the following is considered an asset?",
                    options: [
                        "A depreciating luxury car with EMI",
                        "A low-cost broad market index fund",
                        "A credit card balance carried month to month",
                        "A high-maintenance lifestyle subscription"
                    ],
                    correctAnswer: 1,
                    explanation: "Broad market index funds appreciate over time and generate returns, making them wealth-building assets."
                }
            },
            {
                id: "l-1-2",
                title: "Understanding Inflation: The Silent Money Thief",
                duration: "5 min read",
                level: "Beginner",
                summary: "Why keeping all your savings in cash guarantees a loss in purchasing power over time.",
                content: [
                    "Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power.",
                    "In India, historical retail inflation has averaged between 5% and 7% annually. A ₹100 item today will cost approximately ₹196 in 10 years at 7% inflation.",
                    "Keeping all surplus in a 3% savings bank account causes your real purchasing power to decline by ~3-4% every single year.",
                    "To build real wealth, your money must be invested in instruments that historically outpace inflation (Equity, Mutual Funds, Gold, Real Estate)."
                ],
                keyTakeaways: [
                    "Cash loses purchasing power at ~6% annually in India.",
                    "Real Return = Nominal Investment Return - Inflation Rate.",
                    "Equity and index funds are proven long-term inflation hedges."
                ],
                quiz: {
                    question: "If an investment yields 7% and annual inflation is 6%, what is your approximate real return?",
                    options: [
                        "+13%",
                        "+1%",
                        "-1%",
                        "+7%"
                    ],
                    correctAnswer: 1,
                    explanation: "Real return is calculated by subtracting inflation from nominal return (7% - 6% = 1%)."
                }
            }
        ]
    },
    {
        id: "mod-2",
        title: "The Art of Budgeting & Expense Control",
        icon: "📊",
        category: "Budgeting",
        description: "Proven frameworks like the 50/30/20 rule, envelope methods, and plug-the-leak techniques.",
        lessons: [
            {
                id: "l-2-1",
                title: "The 50/30/20 Framework (Adapted for India)",
                duration: "5 min read",
                level: "Beginner",
                summary: "A simple, stress-free formula to allocate every rupee you earn with clarity.",
                content: [
                    "The 50/30/20 rule divides your take-home monthly salary into three distinct buckets:",
                    "1. 50% Needs: Rent/home EMI, groceries, utilities, basic transport, health insurance, school fees.",
                    "2. 30% Wants: Dining out, weekend trips, cinema, gadgets, streaming subscriptions, shopping.",
                    "3. 20% Savings & Investments: Emergency fund, SIPs, PPF, index funds, retirement corpus.",
                    "If your essential living costs exceed 50%, start by trimming discretionary lifestyle spending before reducing your investment percentage."
                ],
                keyTakeaways: [
                    "Automate your 20% savings on the day salary arrives.",
                    "Never exceed 30% on lifestyle wants.",
                    "Review monthly categorizations on FinMitra to maintain your ratio."
                ],
                quiz: {
                    question: "Under the 50/30/20 rule, what percentage of income should ideally go to savings & investing?",
                    options: [
                        "At least 20%",
                        "No more than 5%",
                        "Exactly 50%",
                        "Whatever is left at the end of the month"
                    ],
                    correctAnswer: 0,
                    explanation: "The rule recommends at least 20% be invested immediately upon receiving salary."
                }
            },
            {
                id: "l-2-2",
                title: "Finding & Plugging Micro-Spending Leaks",
                duration: "4 min read",
                level: "Intermediate",
                summary: "How small daily habits like ₹200 food deliveries add up to ₹72,000+ per year.",
                content: [
                    "Micro-leaks are frequent, low-friction expenses (cab surges, delivery fees, unused gym or cloud subscriptions, convenience fees) that silently drain savings.",
                    "A ₹250 daily food delivery fee equates to ₹7,500/month or ₹90,000/year. Compounded over 10 years at 12% in an index fund, that represents over ₹18 Lakhs in lost wealth.",
                    "FinMitra's Spending Analytics detects recurring merchants and concentration spikes to help you spot these leaks effortlessly."
                ],
                keyTakeaways: [
                    "Small frequent expenses have massive compounding opportunity costs.",
                    "Audit recurring debit mandates once every 3 months.",
                    "Use FinMitra's Top Merchants tab to spot habit surges."
                ],
                quiz: {
                    question: "What is the primary danger of unmonitored micro-expenses?",
                    options: [
                        "They trigger bank penalties",
                        "They carry huge compounding opportunity cost over time",
                        "They lower credit scores directly",
                        "They cannot be tracked in bank statements"
                    ],
                    correctAnswer: 1,
                    explanation: "Small amounts compounded over decades in lost investment returns equal massive sums."
                }
            }
        ]
    },
    {
        id: "mod-3",
        title: "Emergency Funds & Financial Safety",
        icon: "🛡️",
        category: "Protection",
        description: "Build an unbreakable safety net so unexpected life events never force you into high-interest debt.",
        lessons: [
            {
                id: "l-3-1",
                title: "How to Size & Park Your Emergency Fund",
                duration: "6 min read",
                level: "Beginner",
                summary: "How much you need, where to keep it for maximum liquidity, and when to use it.",
                content: [
                    "An emergency fund is 3 to 6 months of mandatory living expenses (rent + food + bills + EMIs) set aside strictly for crises like job loss, medical emergencies, or family distress.",
                    "Example: If your basic monthly survival cost is ₹30,000, your target reserve is ₹90,000 to ₹1,80,000.",
                    "Where to park it: Never invest emergency funds in volatile stocks or locked real estate. Keep 50% in a high-yield savings account and 50% in liquid mutual funds or sweep-in fixed deposits with instant withdrawal."
                ],
                keyTakeaways: [
                    "Target 3 to 6 months of non-negotiable monthly living expenses.",
                    "Prioritize safety and liquidity over high returns for this fund.",
                    "Never treat sudden shopping discounts as an emergency."
                ],
                quiz: {
                    question: "Where should your emergency reserve be stored?",
                    options: [
                        "In high-risk penny stocks",
                        "In liquid accounts with instant withdrawal access",
                        "In long-term lock-in real estate",
                        "In physical cash buried at home"
                    ],
                    correctAnswer: 1,
                    explanation: "Emergency funds must be 100% liquid and principal-safe so you can access them within minutes."
                }
            }
        ]
    },
    {
        id: "mod-4",
        title: "Investing & Compounding Intelligence",
        icon: "🚀",
        category: "Growth",
        description: "The mechanics of compounding, systematic investment plans (SIP), index funds, and risk management.",
        lessons: [
            {
                id: "l-4-1",
                title: "The Eighth Wonder: Power of Compounding",
                duration: "5 min read",
                level: "Intermediate",
                summary: "How time in the market consistently beats timing the market.",
                content: [
                    "Compounding happens when the earnings on your investments begin generating their own earnings over time.",
                    "Consider two investors:",
                    "Investor A starts investing ₹5,000/month at age 22 and stops at age 32 (10 years total investment = ₹6 Lakhs).",
                    "Investor B starts investing ₹5,000/month at age 32 and continues until age 60 (28 years total investment = ₹16.8 Lakhs).",
                    "At 12% annual return, at age 60, Investor A will have approximately ₹1.9 Crore, while Investor B will have ~₹1.5 Crore! Starting 10 years earlier created ₹40 Lakhs more wealth with less than half the total capital invested."
                ],
                keyTakeaways: [
                    "Time in the market is the single greatest multiplier in wealth creation.",
                    "Start early, even with ₹500 or ₹1,000 per month.",
                    "Reinvest all dividends and market gains."
                ],
                quiz: {
                    question: "What factor has the greatest influence on compounding power?",
                    options: [
                        "Picking yesterday's top gaining stock",
                        "Time duration that money remains invested",
                        "Frequent buying and selling daily",
                        "Borrowing money to trade options"
                    ],
                    correctAnswer: 1,
                    explanation: "Compounding is exponential over time; longer time horizons generate vastly superior returns."
                }
            }
        ]
    }
];

const Learning: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
    const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem("finmitra_completed_lessons");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const categories = ["All", "Basics", "Budgeting", "Protection", "Growth"];

    const allLessons = MODULES.flatMap((m) => m.lessons);
    const progressPercentage = Math.round((completedLessons.length / allLessons.length) * 100);

    const filteredModules = selectedCategory === "All"
        ? MODULES
        : MODULES.filter((m) => m.category === selectedCategory);

    const openLesson = (lesson: Lesson) => {
        setActiveLesson(lesson);
        setSelectedAnswer(null);
        setQuizSubmitted(false);
    };

    const closeLesson = () => {
        setActiveLesson(null);
        setSelectedAnswer(null);
        setQuizSubmitted(false);
    };

    const handleQuizSubmit = () => {
        if (selectedAnswer === null || !activeLesson) return;
        setQuizSubmitted(true);

        if (selectedAnswer === activeLesson.quiz.correctAnswer && !completedLessons.includes(activeLesson.id)) {
            const updated = [...completedLessons, activeLesson.id];
            setCompletedLessons(updated);
            try {
                localStorage.setItem("finmitra_completed_lessons", JSON.stringify(updated));
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="learning-page">
            {/* HEADER */}
            <div className="page-header">
                <div>
                    <h1>Financial Education & Curriculum</h1>
                    <p>Bite-sized, practical financial intelligence designed for real-world wealth creation.</p>
                </div>

                <div className="learning-progress-badge">
                    <span className="prog-label">Progress: {progressPercentage}%</span>
                    <div className="prog-bar-mini">
                        <div className="prog-fill-mini" style={{ width: `${progressPercentage}%` }} />
                    </div>
                    <span className="prog-count">{completedLessons.length}/{allLessons.length} Completed</span>
                </div>
            </div>

            {/* CATEGORY FILTER PILLS */}
            <div className="learning-filters">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        className={`filter-chip ${selectedCategory === cat ? "filter-chip-active" : ""}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* MODULES & LESSONS */}
            <div className="modules-container">
                {filteredModules.map((mod) => (
                    <div key={mod.id} className="module-section">
                        <div className="module-header-card">
                            <div className="module-icon-box">{mod.icon}</div>
                            <div className="module-title-box">
                                <span className="module-category-tag">{mod.category}</span>
                                <h2>{mod.title}</h2>
                                <p>{mod.description}</p>
                            </div>
                        </div>

                        <div className="lessons-grid">
                            {mod.lessons.map((lesson) => {
                                const isDone = completedLessons.includes(lesson.id);

                                return (
                                    <div
                                        key={lesson.id}
                                        className={`lesson-card ${isDone ? "lesson-card-completed" : ""}`}
                                        onClick={() => openLesson(lesson)}
                                    >
                                        <div className="lesson-card-top">
                                            <span className="lesson-level-badge">{lesson.level}</span>
                                            <span className="lesson-duration-text">{lesson.duration}</span>
                                        </div>

                                        <h3>{lesson.title}</h3>
                                        <p>{lesson.summary}</p>

                                        <div className="lesson-card-footer">
                                            {isDone ? (
                                                <span className="lesson-done-tag">✓ Completed</span>
                                            ) : (
                                                <span className="lesson-start-link">Start Lesson →</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* LESSON READER MODAL */}
            {activeLesson && (
                <div className="lesson-modal-overlay" onClick={closeLesson}>
                    <div className="lesson-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="lesson-modal-header">
                            <div>
                                <span className="lesson-level-badge">{activeLesson.level} • {activeLesson.duration}</span>
                                <h2>{activeLesson.title}</h2>
                            </div>
                            <button type="button" className="modal-close-btn" onClick={closeLesson}>×</button>
                        </div>

                        <div className="lesson-modal-body">
                            {/* ARTICLE CONTENT */}
                            <div className="lesson-article-text">
                                {activeLesson.content.map((p, idx) => (
                                    <p key={idx}>{p}</p>
                                ))}
                            </div>

                            {/* KEY TAKEAWAYS */}
                            <div className="lesson-takeaways-box">
                                <h3>💡 Key Takeaways</h3>
                                <ul>
                                    {activeLesson.keyTakeaways.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* KNOWLEDGE CHECK QUIZ */}
                            <div className="lesson-quiz-box">
                                <div className="quiz-header">
                                    <h3>🧠 Quick Knowledge Check</h3>
                                    <span>Test your understanding</span>
                                </div>

                                <p className="quiz-question">{activeLesson.quiz.question}</p>

                                <div className="quiz-options-list">
                                    {activeLesson.quiz.options.map((opt, idx) => {
                                        let btnClass = "quiz-option-btn";
                                        if (selectedAnswer === idx) {
                                            btnClass += " quiz-option-selected";
                                        }
                                        if (quizSubmitted) {
                                            if (idx === activeLesson.quiz.correctAnswer) {
                                                btnClass += " quiz-option-correct";
                                            } else if (selectedAnswer === idx) {
                                                btnClass += " quiz-option-wrong";
                                            }
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                className={btnClass}
                                                disabled={quizSubmitted}
                                                onClick={() => setSelectedAnswer(idx)}
                                            >
                                                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                                                <span className="option-text">{opt}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {!quizSubmitted ? (
                                    <button
                                        type="button"
                                        className="quiz-submit-btn"
                                        disabled={selectedAnswer === null}
                                        onClick={handleQuizSubmit}
                                    >
                                        Submit Answer
                                    </button>
                                ) : (
                                    <div className="quiz-feedback-box">
                                        <div className="feedback-result">
                                            {selectedAnswer === activeLesson.quiz.correctAnswer ? (
                                                <span className="result-correct">🎉 Correct! Lesson marked as completed.</span>
                                            ) : (
                                                <span className="result-wrong">Incorrect. Review the explanation below:</span>
                                            )}
                                        </div>
                                        <p className="feedback-explanation">{activeLesson.quiz.explanation}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lesson-modal-footer">
                            <button type="button" className="btn-secondary" onClick={closeLesson}>
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