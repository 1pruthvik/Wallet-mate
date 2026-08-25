// ===========================================================================
// EARNINGS & PROFIT CERTIFICATION ACADEMY DATA ARCHITECTURE
// 50 Courses across 10 Pathways with 100-Question Certification Exams
// ===========================================================================

export interface EarningsPathway {
    id: string;
    code: string;
    title: string;
    diplomaName: string;
    icon: string;
    accentColor: string;
    description: string;
    courseIds: string[];
    outcomes: string[];
}

export interface EarningsLesson {
    id: string;
    lessonNumber: number;
    title: string;
    duration: string;
    concept: string;
    explanation: string[];
    formula?: {
        name: string;
        expression: string;
        explanation: string;
    };
    rupeeExample: {
        title: string;
        scenario: string;
        calculation: string;
        takeaway: string;
    };
    commonMistakes: string[];
    practicalScenario: string;
    yourNumbersPillar?: "income" | "expenses" | "surplus" | "savingsRate" | "discretionarySpend" | "runway";
    miniQuiz: {
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
    };
}

export interface EarningsCourse {
    id: string;
    code: string; // e.g. "C01", "C13"
    title: string;
    pathId: string;
    pathTitle: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    duration: string;
    lessonsCount: number;
    xpReward: number;
    passMark: number; // 80%
    skills: string[];
    description: string;
    objectives: string[];
    formulaSheet: {
        name: string;
        expression: string;
        useCase: string;
    }[];
    lessons: EarningsLesson[];
    category: "income" | "profit" | "pricing" | "business" | "growth" | "capital" | "risk" | "advanced";
}

export interface CertificationQuestion {
    id: string;
    courseId: string;
    courseCode: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: "Fundamental" | "Applied" | "Advanced";
    skillTag: string;
    questionType: "Multiple Choice" | "True/False" | "Numeric Calculation" | "Scenario Judgment" | "Mini Case";
}

// ---------------------------------------------------------------------------
// 10 Pathways
// ---------------------------------------------------------------------------
export const EARNINGS_PATHWAYS: EarningsPathway[] = [
    {
        id: "earn-path-1",
        code: "P1",
        title: "Income Foundations",
        diplomaName: "Personal Earning Power",
        icon: "⚡",
        accentColor: "#6366f1",
        description: "Master the mechanics of labor value, earning equations, salary structures, negotiation math, and career capital compounding.",
        courseIds: ["C01", "C02", "C03", "C04", "C05"],
        outcomes: [
            "Deconstruct total compensation (CTC vs Take-Home vs Tax).",
            "Calculate lifetime earnings impact of counter-offers and switches.",
            "Build rare & valuable career capital that raises your earning ceiling."
        ]
    },
    {
        id: "earn-path-2",
        code: "P2",
        title: "Personal Profit & Cashflow",
        diplomaName: "Personal Profit Systems",
        icon: "💎",
        accentColor: "#10b981",
        description: "Transform personal income into retained operating profit. Run your personal life like a high-margin enterprise.",
        courseIds: ["C06", "C07", "C08", "C09", "C10"],
        outcomes: [
            "Draft a personal monthly Profit & Loss (P&L) statement.",
            "Treat monthly surplus as non-negotiable personal operating profit.",
            "Execute the monthly financial close ritual to prevent cash leaks."
        ]
    },
    {
        id: "earn-path-3",
        code: "P3",
        title: "Profit Math & Margins",
        diplomaName: "Profit Mathematics",
        icon: "📐",
        accentColor: "#3b82f6",
        description: "Master unit economics, contribution margins, break-even thresholds, and gross vs net profitability calculations.",
        courseIds: ["C11", "C12", "C13", "C14", "C15"],
        outcomes: [
            "Compute gross margin, operating margin, and net profit margin.",
            "Calculate break-even units and revenue requirements for any venture.",
            "Optimize contribution margins to maximize cash generation."
        ]
    },
    {
        id: "earn-path-4",
        code: "P4",
        title: "Pricing & Monetization",
        diplomaName: "Monetization & Pricing",
        icon: "🏷️",
        accentColor: "#f59e0b",
        description: "Shift from cost-plus and hourly billing to value-based pricing, tiered packaging, and margin protection.",
        courseIds: ["C16", "C17", "C18", "C19", "C20"],
        outcomes: [
            "Diagnose pricing power and measure price elasticity.",
            "Structure Good-Better-Best tier packaging to capture consumer surplus.",
            "Prevent damaging discount spirals that wipe out net profit."
        ]
    },
    {
        id: "earn-path-5",
        code: "P5",
        title: "Freelancer / Solo Earner Profit",
        diplomaName: "Independent Earner Profit",
        icon: "🚀",
        accentColor: "#8b5cf6",
        description: "Architect high-margin solo business models, calculate Effective Hourly Rate (EHR), score clients, and secure retainers.",
        courseIds: ["C21", "C22", "C23", "C24", "C25"],
        outcomes: [
            "Calculate true Effective Hourly Rate including non-billable overhead.",
            "Rank and fire low-margin clients using profitability matrices.",
            "Transition one-off project gigs into predictable monthly retainers."
        ]
    },
    {
        id: "earn-path-6",
        code: "P6",
        title: "Business Profit Operations",
        diplomaName: "Business Profit Operations",
        icon: "🏢",
        accentColor: "#ec4899",
        description: "Master business financial statements, operating leverage, fixed cost controls, and profit vs cost center segregation.",
        courseIds: ["C26", "C27", "C28", "C29", "C30"],
        outcomes: [
            "Distinguish accounting profit from real cash flow.",
            "Harness positive operating leverage to expand profit margins as sales grow.",
            "Audit overheads to protect core bottom-line cash generation."
        ]
    },
    {
        id: "earn-path-7",
        code: "P7",
        title: "Earnings Growth Levers",
        diplomaName: "Earnings Growth Levers",
        icon: "📈",
        accentColor: "#14b8a6",
        description: "Deploy the 4 core mathematical levers of profit: volume, pricing, customer retention, and productivity leverage.",
        courseIds: ["C31", "C32", "C33", "C34", "C35"],
        outcomes: [
            "Deploy Jay Abraham's 4-lever profit expansion matrix.",
            "Model funnel conversion economics and customer acquisition cost (CAC).",
            "Optimize product mix towards high gross-margin offerings."
        ]
    },
    {
        id: "earn-path-8",
        code: "P8",
        title: "Capital Income & Return on Money",
        diplomaName: "Capital Income Systems",
        icon: "🏦",
        accentColor: "#06b6d4",
        description: "Reinvest earned operating profits into capital assets, master ROI/ROE, and transition active earnings into passive yield.",
        courseIds: ["C36", "C37", "C38", "C39", "C40"],
        outcomes: [
            "Calculate Return on Investment (ROI) and payback horizons.",
            "Reinvest retained profits into compounding equity and debt engines.",
            "Balance current dividend/interest yield against long-term total return."
        ]
    },
    {
        id: "earn-path-9",
        code: "P9",
        title: "Risk & Earnings Defense",
        diplomaName: "Defensive Earnings Strategy",
        icon: "🛡️",
        accentColor: "#ef4444",
        description: "Quantify income concentration risk, establish margins of safety, stress-test downside scenarios, and protect earning power.",
        courseIds: ["C41", "C42", "C43", "C44", "C45"],
        outcomes: [
            "Calculate earnings stability and volatility coefficients.",
            "Eliminate single-client and single-employer concentration vulnerabilities.",
            "Construct stress-tested financial downside defenses."
        ]
    },
    {
        id: "earn-path-10",
        code: "P10",
        title: "Advanced Wealth-From-Profit",
        diplomaName: "Wealth-from-Profit Architecture",
        icon: "👑",
        accentColor: "#d97706",
        description: "Design multi-income portfolios, transition from labor income to asset ownership, and construct your Personal Earnings OS.",
        courseIds: ["C46", "C47", "C48", "C49", "C50"],
        outcomes: [
            "Formulate measurable financial Objectives & Key Results (OKRs).",
            "Construct a diversified 4-layer multi-income architecture.",
            "Integrate all 50 courses into the Grand Capstone Personal Earnings OS."
        ]
    }
];

// Helper to generate realistic sample lessons for each of the 50 courses
const generateCourseLessons = (courseCode: string, courseTitle: string, pathTitle: string): EarningsLesson[] => {
    return [
        {
            id: `${courseCode}-L01`,
            lessonNumber: 1,
            title: `Core Principles of ${courseTitle}`,
            duration: "8 min read",
            concept: `Foundational mechanisms governing ${courseTitle} and how it directly determines cash flow retention.`,
            explanation: [
                `In financial economics, ${courseTitle} is not a static number—it is an operating system. Most professionals fail to optimize this because they view money as a single lump sum rather than distinct structural flows.`,
                `When you systematically track and benchmark your metrics in ${pathTitle}, you transform random financial events into predictable, compounding advantages.`
            ],
            formula: {
                name: `${courseTitle} Efficiency Ratio`,
                expression: `Efficiency % = (Retained Net Value / Total Gross Input) × 100`,
                explanation: `Measures how much real economic value is captured per rupee of effort or gross revenue.`
            },
            rupeeExample: {
                title: `Optimizing ${courseTitle} in Practice`,
                scenario: `An individual generates ₹1,50,000 gross monthly revenue. Through structured analysis in ${courseTitle}, they identify ₹25,000 in unrecognized leakage.`,
                calculation: `₹25,000/mo recovered = ₹3,00,000 annualized net profit retained.`,
                takeaway: `Small percentage improvements in operating structure yield massive multi-year capital compounding.`
            },
            commonMistakes: [
                "Focusing exclusively on gross top-line numbers while ignoring bottom-line net capture.",
                "Failing to conduct monthly reconciliations against established benchmarks.",
                "Treating variable operating leakages as unavoidable fixed costs."
            ],
            practicalScenario: `Review your primary monthly statements and calculate what percentage of your gross earnings converts directly into compounding capital.`,
            yourNumbersPillar: "surplus",
            miniQuiz: {
                question: `What is the primary indicator of strength in ${courseTitle}?`,
                options: [
                    "High gross top-line volume with zero net margin retention",
                    "Predictable, high-efficiency conversion of gross inputs into net retained surplus",
                    "Increasing discretionary overheads faster than revenue growth",
                    "Relying on single unhedged revenue sources"
                ],
                correctAnswer: 1,
                explanation: `Net retained surplus and margin stability dictate true wealth compounding velocity.`
            }
        },
        {
            id: `${courseCode}-L02`,
            lessonNumber: 2,
            title: `Quantitative Mechanics & Formula Execution`,
            duration: "10 min read",
            concept: `Mathematical modeling and step-by-step calculations for ${courseTitle}.`,
            explanation: [
                `Mastery requires numerical fluency. By calculating exact thresholds, you replace intuition with mathematical certainty.`,
                `Whether evaluating salary increments, client pricing tiers, or operating overheads, rigorous margin math ensures you never misprice risk.`
            ],
            formula: {
                name: `Break-Even & Margin Threshold`,
                expression: `Net Margin = (Net Profit / Gross Revenue) × 100`,
                explanation: `The percentage of gross revenue remaining after all operating deductions and taxes.`
            },
            rupeeExample: {
                title: `Step-by-Step Calculation Scenario`,
                scenario: `Given Gross Inflows of ₹2,00,000 and total direct + indirect costs of ₹1,20,000:`,
                calculation: `Net Profit = ₹2,00,000 - ₹1,20,000 = ₹80,000. Net Margin = (₹80,000 / ₹2,00,000) × 100 = 40%.`,
                takeaway: `A 40% net retention provides robust resilience against unexpected market fluctuations.`
            },
            commonMistakes: [
                "Omitting indirect overheads and opportunity costs from margin calculations.",
                "Confusing markup on cost with gross margin on selling price."
            ],
            practicalScenario: `Apply the Net Margin formula to your own monthly inflows and outflows to establish your baseline margin.`,
            yourNumbersPillar: "savingsRate",
            miniQuiz: {
                question: `If gross revenue is ₹5,00,000 and total costs are ₹3,00,000, what is the net profit margin?`,
                options: ["20%", "30%", "40%", "60%"],
                correctAnswer: 2,
                explanation: `Net profit is ₹2,00,000. (₹2,00,000 / ₹5,00,000) × 100 = 40%.`
            }
        },
        {
            id: `${courseCode}-L03`,
            lessonNumber: 3,
            title: `Strategic Implementation & Real-World Case Studies`,
            duration: "12 min read",
            concept: `Applying ${courseTitle} frameworks to career, business, and personal wealth engines.`,
            explanation: [
                `Theory without execution is dormant capital. In this module, we examine how top earners structure their systems to consistently achieve top-decile financial outcomes.`,
                `By decoupling time from revenue and instituting automated profit capture mechanisms, you build an antifragile financial foundation.`
            ],
            rupeeExample: {
                title: `Case Study: Restructuring Cashflow Architecture`,
                scenario: `A professional shifted from ad-hoc manual savings to automated Day-1 profit extraction based on ${courseTitle} principles.`,
                calculation: `Savings rate increased from 14% to 38% without perceived loss of living standards.`,
                takeaway: `System architecture drives behavior far more effectively than sheer willpower.`
            },
            commonMistakes: [
                "Delaying implementation until 'income increases in the future'.",
                "Failing to review and rebalance allocation rules on a quarterly cadence."
            ],
            practicalScenario: `Identify one specific financial process you can automate this week using ${courseTitle} rules.`,
            yourNumbersPillar: "income",
            miniQuiz: {
                question: `What is the most effective approach to ensure continuous improvement in financial systems?`,
                options: [
                    "Manual ad-hoc reviews once every 3 years",
                    "Automated rule-based execution combined with scheduled monthly close rituals",
                    "Ignoring metrics and hoping market conditions improve",
                    "Maximizing personal debt to stimulate spending"
                ],
                correctAnswer: 1,
                explanation: `Automated execution paired with regular monthly audit rituals guarantees structural progress.`
            }
        }
    ];
};

// ---------------------------------------------------------------------------
// 50 Professional Courses (C01 - C50)
// ---------------------------------------------------------------------------
export const EARNINGS_COURSES: EarningsCourse[] = [
    // PATH 1 — INCOME FOUNDATIONS (C01 - C05)
    {
        id: "C01",
        code: "C01",
        title: "The Earnings Equation",
        pathId: "earn-path-1",
        pathTitle: "Income Foundations",
        level: "Beginner",
        duration: "2h 30m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Labor Economics", "Pricing Power", "Volume Leverage", "Frequency Optimization"],
        description: "Deconstruct the fundamental drivers of earnings: Labor × Price × Volume × Frequency, and identify your highest-leverage growth vector.",
        objectives: [
            "Deconstruct the universal earnings formula: Earnings = Labor × Price × Volume × Frequency.",
            "Identify personal earning constraints across capacity vs pricing power.",
            "Develop a strategic roadmap to shift from linear time sales to high-multiplier value delivery."
        ],
        formulaSheet: [
            { name: "Universal Earnings Formula", expression: "Total Earnings = (Base Price × Volume × Frequency) + Capital Multipliers", useCase: "Modeling income ceilings." },
            { name: "Hourly Value Rate", expression: "HVR = Net Inflows / Total Productive Working Hours", useCase: "Auditing true labor productivity." }
        ],
        lessons: generateCourseLessons("C01", "The Earnings Equation", "Income Foundations"),
        category: "income"
    },
    {
        id: "C02",
        code: "C02",
        title: "Income Types & Quality",
        pathId: "earn-path-1",
        pathTitle: "Income Foundations",
        level: "Beginner",
        duration: "2h 45m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Active Income", "Passive Yield", "Portfolio Income", "Residual Cashflow"],
        description: "Classify and evaluate income streams based on stability, scalability, tax treatment, and time-decoupling characteristics.",
        objectives: [
            "Distinguish between Active, Passive, Portfolio, and Residual income types.",
            "Evaluate income quality based on cash volatility, dependency risk, and tax efficiency.",
            "Construct an income ladder transition plan from pure labor to diversified cash assets."
        ],
        formulaSheet: [
            { name: "Income Quality Score", expression: "IQS = (Predictability × 0.4) + (Margin × 0.3) + (Passive Index × 0.3)", useCase: "Scoring revenue streams." }
        ],
        lessons: generateCourseLessons("C02", "Income Types & Quality", "Income Foundations"),
        category: "income"
    },
    {
        id: "C03",
        code: "C03",
        title: "Salary Mechanics & CTC Reality",
        pathId: "earn-path-1",
        pathTitle: "Income Foundations",
        level: "Beginner",
        duration: "3h 00m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["CTC Breakdown", "Take-Home Pay", "TDS & PF", "Gratuity & Perquisites"],
        description: "Demystify Indian corporate compensation structures. Bridge the gap between Cost to Company (CTC) and actual bank credit.",
        objectives: [
            "Analyze corporate CTC structures (Basic, HRA, Special Allowance, PF, Gratuity, ESOPs).",
            "Calculate exact net take-home salary after PF and Section 192 TDS deductions.",
            "Optimize salary component structuring for maximum tax efficiency under both tax regimes."
        ],
        formulaSheet: [
            { name: "Real Take-Home Ratio", expression: "THR % = (Net Monthly Credit / Monthly Gross CTC) × 100", useCase: "Evaluating compensation reality." }
        ],
        lessons: generateCourseLessons("C03", "Salary Mechanics & CTC Reality", "Income Foundations"),
        category: "income"
    },
    {
        id: "C04",
        code: "C04",
        title: "Raises, Switching & Negotiation Math",
        pathId: "earn-path-1",
        pathTitle: "Income Foundations",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Negotiation Math", "Compounding Raises", "Switch Multipliers", "Counter-Offer Analysis"],
        description: "Master the mathematical compounding impact of salary negotiations, job switches, and multi-year compensation trajectories.",
        objectives: [
            "Model the 10-year compounding difference between a 15% internal raise vs a 35% external switch.",
            "Evaluate multi-offer compensation packages including variable pay, ESOP vesting, and retention bonuses.",
            "Conduct evidence-backed compensation reviews with quantifiable business impact metrics."
        ],
        formulaSheet: [
            { name: "Lifetime Switch Premium", expression: "LSP = ∑ [ΔSalary × (1 + r)^t] over Career Horizon", useCase: "Calculating lifetime switch gains." }
        ],
        lessons: generateCourseLessons("C04", "Raises, Switching & Negotiation Math", "Income Foundations"),
        category: "income"
    },
    {
        id: "C05",
        code: "C05",
        title: "Career Capital & Earning Trajectory",
        pathId: "earn-path-1",
        pathTitle: "Income Foundations",
        level: "Intermediate",
        duration: "3h 30m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Skill Stacking", "Career Capital", "Promotion Economics", "Pricing Power"],
        description: "Build rare and valuable skill combinations to elevate your market value and shatter earning plateaus.",
        objectives: [
            "Identify high-demand complimentary skills to form an antifragile skill stack.",
            "Map promotion economics and revenue-adjacent positioning in modern organizations.",
            "Quantify your career earning trajectory and raise your long-term earning ceiling."
        ],
        formulaSheet: [
            { name: "Earning Power Multiplier", expression: "EPM = Skill Rarity Index × Market Demand Factor", useCase: "Projecting career compensation." }
        ],
        lessons: generateCourseLessons("C05", "Career Capital & Earning Trajectory", "Income Foundations"),
        category: "income"
    },

    // PATH 2 — PERSONAL PROFIT & CASHFLOW (C06 - C10)
    {
        id: "C06",
        code: "C06",
        title: "Personal P&L Statement",
        pathId: "earn-path-2",
        pathTitle: "Personal Profit & Cashflow",
        level: "Beginner",
        duration: "3h 00m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Financial Statements", "Personal P&L", "Revenue Recognition", "Expense Classification"],
        description: "Construct a professional personal Profit & Loss statement to run your personal finances with institutional precision.",
        objectives: [
            "Draft a comprehensive personal monthly and quarterly Profit & Loss statement.",
            "Categorize expenses into Fixed Operating Costs, Variable Needs, and Discretionary Overhead.",
            "Track monthly net profit and calculate true personal EBITDA."
        ],
        formulaSheet: [
            { name: "Personal Net Profit", expression: "Personal Profit = Gross Income - (Taxes + Fixed Needs + Discretionary Spend)", useCase: "Monthly P&L calculation." }
        ],
        lessons: generateCourseLessons("C06", "Personal P&L Statement", "Personal Profit & Cashflow"),
        category: "profit"
    },
    {
        id: "C07",
        code: "C07",
        title: "Surplus = Personal Profit",
        pathId: "earn-path-2",
        pathTitle: "Personal Profit & Cashflow",
        level: "Beginner",
        duration: "2h 45m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Profit Rate", "Surplus Optimization", "Capital Conversion", "Retained Earnings"],
        description: "Reframe monthly savings surplus as non-negotiable personal profit. Learn why profit margin is the ultimate wealth metric.",
        objectives: [
            "Redefine monthly surplus as retained business profit.",
            "Benchmark personal profit margins (target: 30%+ of net income).",
            "Direct retained earnings into systematic wealth compounding engines."
        ],
        formulaSheet: [
            { name: "Personal Profit Margin %", expression: "PPM % = (Monthly Surplus / Net Take-Home Pay) × 100", useCase: "Measuring financial efficiency." }
        ],
        lessons: generateCourseLessons("C07", "Surplus = Personal Profit", "Personal Profit & Cashflow"),
        category: "profit"
    },
    {
        id: "C08",
        code: "C08",
        title: "Expense Drag on Earnings",
        pathId: "earn-path-2",
        pathTitle: "Personal Profit & Cashflow",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Expense Drag", "Lifestyle Inflation", "Fixed Cost Ratchet", "Break-Even Lifestyle"],
        description: "Identify and eliminate stealth expense drag, lifestyle inflation, and fixed-cost ratchets that erode earning gains.",
        objectives: [
            "Quantify the lifetime compounding cost of lifestyle inflation and expense drag.",
            "Isolate the 'Fixed Cost Ratchet' where raises trigger permanent living cost increases.",
            "Implement a 50% increment firewall to lock in higher profit rates with every salary raise."
        ],
        formulaSheet: [
            { name: "Expense Drag Ratio", expression: "EDR = ΔMonthly Expenses / ΔMonthly Salary Increment", useCase: "Measuring lifestyle inflation." }
        ],
        lessons: generateCourseLessons("C08", "Expense Drag on Earnings", "Personal Profit & Cashflow"),
        category: "profit"
    },
    {
        id: "C09",
        code: "C09",
        title: "Pay-Yourself-First Profit System",
        pathId: "earn-path-2",
        pathTitle: "Personal Profit & Cashflow",
        level: "Beginner",
        duration: "2h 30m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Automated Allocation", "Day-1 Transfer", "Profit First Method", "Behavioral Guardrails"],
        description: "Implement Mike Michalowicz's Profit First philosophy tailored to Indian salaried and self-employed professionals.",
        objectives: [
            "Automate Day-1 profit extraction directly upon salary or invoice credit.",
            "Establish distinct bank account architecture for Profit, Tax, Needs, and Discretionary Spend.",
            "Enforce living on remaining operational funds without artificial restriction."
        ],
        formulaSheet: [
            { name: "Target Profit Allocation", expression: "Day-1 Investment = Net Inflow × Target Profit Margin %", useCase: "Automated savings routing." }
        ],
        lessons: generateCourseLessons("C09", "Pay-Yourself-First Profit System", "Personal Profit & Cashflow"),
        category: "profit"
    },
    {
        id: "C10",
        code: "C10",
        title: "Monthly Earnings Close Ritual",
        pathId: "earn-path-2",
        pathTitle: "Personal Profit & Cashflow",
        level: "Intermediate",
        duration: "3h 00m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Financial Reconciliation", "Monthly Audit", "Variance Analysis", "Balance Sheet Update"],
        description: "Establish a rigorous 30-minute monthly financial close ritual to reconcile transactions, track net worth, and set monthly targets.",
        objectives: [
            "Execute an end-of-month reconciliation protocol across bank accounts and credit cards.",
            "Calculate actual vs budgeted spending variances and diagnose outlier leakages.",
            "Update the personal Balance Sheet and calculate monthly Net Worth Delta."
        ],
        formulaSheet: [
            { name: "Net Worth Delta", expression: "ΔNW = Current Month Net Worth - Previous Month Net Worth", useCase: "Tracking true wealth creation." }
        ],
        lessons: generateCourseLessons("C10", "Monthly Earnings Close Ritual", "Personal Profit & Cashflow"),
        category: "profit"
    },

    // PATH 3 — PROFIT MATH & MARGINS (C11 - C15)
    {
        id: "C11",
        code: "C11",
        title: "Revenue vs Profit",
        pathId: "earn-path-3",
        pathTitle: "Profit Math & Margins",
        level: "Beginner",
        duration: "2h 45m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Top-Line vs Bottom-Line", "COGS", "Cash Flow Conversion", "Accounting Accruals"],
        description: "Understand why 'Revenue is vanity, profit is sanity, and cash is reality' through real-world business and career scenarios.",
        objectives: [
            "Deconstruct the vital differences between top-line revenue and bottom-line retained profit.",
            "Identify how unprofitable high-revenue ventures suffer cash collapse.",
            "Apply revenue-to-profit conversion principles to personal career and business projects."
        ],
        formulaSheet: [
            { name: "Profit Conversion Ratio", expression: "PCR = Net Operating Profit / Total Gross Revenue", useCase: "Evaluating top-line quality." }
        ],
        lessons: generateCourseLessons("C11", "Revenue vs Profit", "Profit Math & Margins"),
        category: "pricing"
    },
    {
        id: "C12",
        code: "C12",
        title: "Gross, Operating & Net Profit",
        pathId: "earn-path-3",
        pathTitle: "Profit Math & Margins",
        level: "Intermediate",
        duration: "3h 30m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Gross Profit", "EBITDA", "Operating Profit (EBIT)", "Net Profit (PAT)"],
        description: "Master the three tiers of profitability: Gross Profit, Operating Profit, and Net Profit after taxes.",
        objectives: [
            "Calculate Gross Profit after Direct Costs (COGS/Direct Labor).",
            "Compute Operating Profit (EBITDA/EBIT) after Sales, Marketing, and Administrative overhead.",
            "Determine Net Profit after Interest and Tax obligations."
        ],
        formulaSheet: [
            { name: "Gross Profit", expression: "GP = Revenue - Cost of Goods Sold (COGS)", useCase: "Direct product margin." },
            { name: "Operating Profit (EBIT)", expression: "OP = Gross Profit - Operating Expenses (OPEX)", useCase: "Core business efficiency." },
            { name: "Net Profit", expression: "NP = Operating Profit - (Interest + Tax)", useCase: "Bottom line return." }
        ],
        lessons: generateCourseLessons("C12", "Gross, Operating & Net Profit", "Profit Math & Margins"),
        category: "pricing"
    },
    {
        id: "C13",
        code: "C13",
        title: "Margin Mastery",
        pathId: "earn-path-3",
        pathTitle: "Profit Math & Margins",
        level: "Intermediate",
        duration: "3h 40m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Gross Margin", "Net Margin", "Margin Expansion", "Pricing Elasticity"],
        description: "Calculate and optimize Gross, Operating, and Net margins. Master markup vs margin formulas and margin expansion tactics.",
        objectives: [
            "Differentiate Margin % (Profit / Revenue) from Markup % (Profit / Cost).",
            "Analyze margin sensitivity to price cuts vs volume growth.",
            "Implement margin expansion tactics in client work, side hustles, and personal services."
        ],
        formulaSheet: [
            { name: "Gross Margin %", expression: "GM % = [(Revenue - COGS) / Revenue] × 100", useCase: "Measuring product profitability." },
            { name: "Markup to Margin Converter", expression: "Margin % = Markup % / (1 + Markup %)", useCase: "Pricing conversions." }
        ],
        lessons: generateCourseLessons("C13", "Margin Mastery", "Profit Math & Margins"),
        category: "pricing"
    },
    {
        id: "C14",
        code: "C14",
        title: "Break-Even Analysis",
        pathId: "earn-path-3",
        pathTitle: "Profit Math & Margins",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Break-Even Units", "Break-Even Revenue", "Fixed Cost Absorption", "Margin of Safety"],
        description: "Determine the exact volume and revenue required to cover all fixed and variable costs with zero loss.",
        objectives: [
            "Calculate Break-Even Point in physical units and gross sales revenue.",
            "Determine the Margin of Safety percentage above break-even.",
            "Model how lowering fixed costs reduces financial risk and accelerates profitability."
        ],
        formulaSheet: [
            { name: "Break-Even Units", expression: "BEP (Units) = Total Fixed Costs / (Price per Unit - Variable Cost per Unit)", useCase: "Unit break-even calculation." },
            { name: "Break-Even Revenue", expression: "BEP (₹) = Total Fixed Costs / Contribution Margin Ratio", useCase: "Sales revenue target." }
        ],
        lessons: generateCourseLessons("C14", "Break-Even Analysis", "Profit Math & Margins"),
        category: "pricing"
    },
    {
        id: "C15",
        code: "C15",
        title: "Contribution Margin & Unit Economics",
        pathId: "earn-path-3",
        pathTitle: "Profit Math & Margins",
        level: "Advanced",
        duration: "3h 45m",
        lessonsCount: 14,
        xpReward: 500,
        passMark: 80,
        skills: ["Contribution Margin", "Unit Economics", "LTV / CAC", "Variable Cost Analysis"],
        description: "Analyze how individual units contribute towards covering fixed overhead and generating enterprise profit.",
        objectives: [
            "Calculate Unit Contribution Margin and Contribution Margin Ratio.",
            "Evaluate unit economics (LTV, CAC, Payback Period) for products and professional services.",
            "Prune negative or low-contribution offerings from service catalogs."
        ],
        formulaSheet: [
            { name: "Unit Contribution Margin", expression: "UCM = Selling Price per Unit - Variable Cost per Unit", useCase: "Per-unit profit contribution." },
            { name: "Contribution Margin Ratio", expression: "CMR % = (UCM / Selling Price) × 100", useCase: "Ratio analysis." }
        ],
        lessons: generateCourseLessons("C15", "Contribution Margin & Unit Economics", "Profit Math & Margins"),
        category: "pricing"
    },

    // PATH 4 — PRICING & MONETIZATION (C16 - C20)
    {
        id: "C16",
        code: "C16",
        title: "Pricing Power Basics",
        pathId: "earn-path-4",
        pathTitle: "Pricing & Monetization",
        level: "Beginner",
        duration: "2h 45m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Pricing Power", "Buffett Moat Test", "Elasticity of Demand", "Perceived Value"],
        description: "Evaluate pricing power—the single most important metric in determining business and professional earning quality.",
        objectives: [
            "Define pricing power and apply Warren Buffett's Pricing Moat Test.",
            "Measure price elasticity of demand for personal skills and products.",
            "Elevate perceived value through positioning, proof, and differentiation."
        ],
        formulaSheet: [
            { name: "Price Elasticity of Demand", expression: "PED = (% Change in Quantity Demanded) / (% Change in Price)", useCase: "Testing pricing sensitivity." }
        ],
        lessons: generateCourseLessons("C16", "Pricing Power Basics", "Pricing & Monetization"),
        category: "pricing"
    },
    {
        id: "C17",
        code: "C17",
        title: "Cost-Plus vs Value-Based Pricing",
        pathId: "earn-path-4",
        pathTitle: "Pricing & Monetization",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Value-Based Pricing", "Cost-Plus Flaws", "Economic Value Added", "ROI Anchor"],
        description: "Break free from the cost-plus trap. Price based on the economic value generated for the buyer rather than hours logged.",
        objectives: [
            "Identify the severe earnings ceiling imposed by traditional Cost-Plus pricing.",
            "Calculate Economic Value Added (EVA) for clients and customers.",
            "Price services at 10%-20% of the quantifiable value or savings created."
        ],
        formulaSheet: [
            { name: "Value-Based Price Anchor", expression: "Target Price = Quantified Client Economic Upside × (10% to 20%)", useCase: "High-margin value pricing." }
        ],
        lessons: generateCourseLessons("C17", "Cost-Plus vs Value-Based Pricing", "Pricing & Monetization"),
        category: "pricing"
    },
    {
        id: "C18",
        code: "C18",
        title: "Hourly vs Value vs Productized Offers",
        pathId: "earn-path-4",
        pathTitle: "Pricing & Monetization",
        level: "Intermediate",
        duration: "3h 30m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Productized Services", "Fixed Scope Offers", "Value Decoupling", "Scalability"],
        description: "Transition from linear billing hours to productized offerings with fixed scope, predictable delivery, and high margins.",
        objectives: [
            "Deconstruct the three stages of service evolution: Hourly → Fixed Value → Productized Offer.",
            "Standardize deliverables into repeatable, scalable packaged solutions.",
            "Multiply effective hourly earnings by 3x-5x through operational efficiency."
        ],
        formulaSheet: [
            { name: "Effective Realized Rate", expression: "ERR = Fixed Productized Price / Actual Execution Hours", useCase: "Measuring efficiency leverage." }
        ],
        lessons: generateCourseLessons("C18", "Hourly vs Value vs Productized Offers", "Pricing & Monetization"),
        category: "pricing"
    },
    {
        id: "C19",
        code: "C19",
        title: "Packaging, Tiers & Upsell Economics",
        pathId: "earn-path-4",
        pathTitle: "Pricing & Monetization",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Good-Better-Best", "Decoy Pricing", "Upsell Funnels", "Average Order Value (AOV)"],
        description: "Design 3-tier pricing architectures (Good-Better-Best) and upsell funnels to capture maximum consumer surplus.",
        objectives: [
            "Structure Good-Better-Best tier pricing with psychological anchoring.",
            "Deploy asymmetric decoy options to steer 60%+ of buyers into high-margin tiers.",
            "Calculate and optimize Average Order Value (AOV) through logical order bumps."
        ],
        formulaSheet: [
            { name: "Average Order Value", expression: "AOV = Total Revenue / Total Number of Orders", useCase: "Monetization efficiency." }
        ],
        lessons: generateCourseLessons("C19", "Packaging, Tiers & Upsell Economics", "Pricing & Monetization"),
        category: "pricing"
    },
    {
        id: "C20",
        code: "C20",
        title: "Discounting & Margin Damage",
        pathId: "earn-path-4",
        pathTitle: "Pricing & Monetization",
        level: "Intermediate",
        duration: "3h 00m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Margin Sensitivity", "Discount Trap", "Volume Required", "Price Integrity"],
        description: "Calculate the devastating impact of casual discounts on net profit and determine how much volume is needed to recover.",
        objectives: [
            "Calculate exact volume increases required to break even after giving a 10%, 20%, or 30% discount.",
            "Understand why a 20% discount on a 30% margin product wipes out 67% of net profit.",
            "Deploy value-add incentives instead of price cuts to preserve margin integrity."
        ],
        formulaSheet: [
            { name: "Volume Required to Offset Discount", expression: "% Vol Increase Needed = [Discount % / (Gross Margin % - Discount %)] × 100", useCase: "Discount impact analysis." }
        ],
        lessons: generateCourseLessons("C20", "Discounting & Margin Damage", "Pricing & Monetization"),
        category: "pricing"
    },

    // PATH 5 — FREELANCER / SOLO EARNER PROFIT (C21 - C25)
    {
        id: "C21",
        code: "C21",
        title: "Solo Business Income Architecture",
        pathId: "earn-path-5",
        pathTitle: "Freelancer / Solo Earner Profit",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Solo Enterprise", "Operating Reserves", "Tax Planning for 44ADA", "Cash Buffers"],
        description: "Structure a solo independent business: banking setup, Section 44ADA presumptive taxation, and operating expense buffers.",
        objectives: [
            "Set up compliant solo business finance architecture under Indian Section 44ADA (50% presumptive profit).",
            "Maintain separate business and personal banking accounts with automated tax escrows.",
            "Establish a 6-month solo business operating reserve."
        ],
        formulaSheet: [
            { name: "Section 44ADA Taxable Base", expression: "Taxable Business Profit = Gross Professional Inflows × 50%", useCase: "Indian presumptive tax calculation." }
        ],
        lessons: generateCourseLessons("C21", "Solo Business Income Architecture", "Freelancer / Solo Earner Profit"),
        category: "business"
    },
    {
        id: "C22",
        code: "C22",
        title: "Effective Hourly Rate",
        pathId: "earn-path-5",
        pathTitle: "Freelancer / Solo Earner Profit",
        level: "Beginner",
        duration: "2h 45m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["EHR Calculation", "Unbillable Hours", "True Productivity", "Overhead Burden"],
        description: "Calculate your true Effective Hourly Rate by accounting for sales, admin, communication, and unbillable overhead time.",
        objectives: [
            "Calculate true Effective Hourly Rate (Net Inflow / Total Hours Worked including admin and sales).",
            "Identify the gap between nominal quoted rates and real realized compensation.",
            "Eliminate unbillable low-value administrative friction."
        ],
        formulaSheet: [
            { name: "Effective Hourly Rate (EHR)", expression: "EHR = Total Net Project Inflow / (Billable Hours + Non-Billable Overhead Hours)", useCase: "True hourly productivity." }
        ],
        lessons: generateCourseLessons("C22", "Effective Hourly Rate", "Freelancer / Solo Earner Profit"),
        category: "business"
    },
    {
        id: "C23",
        code: "C23",
        title: "Client Profitability Scoring",
        pathId: "earn-path-5",
        pathTitle: "Freelancer / Solo Earner Profit",
        level: "Intermediate",
        duration: "3h 00m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Client Matrix", "Pareto Analysis", "Scope Creep Cost", "Client Pruning"],
        description: "Score and rank clients on revenue, profit margin, scope creep friction, and payment velocity. Prune toxic low-margin accounts.",
        objectives: [
            "Construct an 80/20 Client Profitability Matrix.",
            "Quantify the hidden costs of scope creep, revisions, and delayed payment terms.",
            "Execute graceful offboarding of bottom 20% margin-draining clients."
        ],
        formulaSheet: [
            { name: "Client Net Margin Score", expression: "Client Profit % = [(Client Invoiced - Direct Time & Costs) / Client Invoiced] × 100", useCase: "Client ranking." }
        ],
        lessons: generateCourseLessons("C23", "Client Profitability Scoring", "Freelancer / Solo Earner Profit"),
        category: "business"
    },
    {
        id: "C24",
        code: "C24",
        title: "Retainers & Recurring Revenue",
        pathId: "earn-path-5",
        pathTitle: "Freelancer / Solo Earner Profit",
        level: "Intermediate",
        duration: "3h 30m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Monthly Retainers", "MRR for Solos", "Service Agreements", "Churn Prevention"],
        description: "Transition from feast-or-famine project hunting to predictable monthly recurring revenue (MRR) retainer contracts.",
        objectives: [
            "Structure attractive monthly advisory and maintenance retainer agreements.",
            "Calculate Monthly Recurring Revenue (MRR) baseline to cover 100% of baseline living costs.",
            "Incorporate SLA boundaries to protect against retainer scope creep."
        ],
        formulaSheet: [
            { name: "Solo MRR Stability Index", expression: "Stability % = (Guaranteed Retainer Inflow / Monthly Baseline Overhead) × 100", useCase: "Cashflow predictability." }
        ],
        lessons: generateCourseLessons("C24", "Retainers & Recurring Revenue", "Freelancer / Solo Earner Profit"),
        category: "business"
    },
    {
        id: "C25",
        code: "C25",
        title: "Capacity, Utilization & Burnout Ceiling",
        pathId: "earn-path-5",
        pathTitle: "Freelancer / Solo Earner Profit",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Capacity Planning", "Utilization Rate", "Burnout Ceiling", "Subcontracting Leverage"],
        description: "Map your maximum billable capacity, determine optimal utilization targets, and build subcontracting leverage to avoid burnout.",
        objectives: [
            "Calculate sustainable billable utilization targets (optimal: 65%-75% of total hours).",
            "Identify the mathematical ceiling where working more hours produces negative marginal return.",
            "Deploy junior subcontracting and AI automation to expand output capacity."
        ],
        formulaSheet: [
            { name: "Utilization Rate %", expression: "Utilization % = (Billable Project Hours / Total Available Working Hours) × 100", useCase: "Capacity management." }
        ],
        lessons: generateCourseLessons("C25", "Capacity, Utilization & Burnout Ceiling", "Freelancer / Solo Earner Profit"),
        category: "business"
    },

    // PATH 6 — BUSINESS PROFIT OPERATIONS (C26 - C30)
    {
        id: "C26",
        code: "C26",
        title: "Business P&L Fluency",
        pathId: "earn-path-6",
        pathTitle: "Business Profit Operations",
        level: "Intermediate",
        duration: "3h 30m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Corporate P&L", "Accrual Accounting", "EBITDA Analysis", "Variance Audits"],
        description: "Read, analyze, and diagnose corporate income statements like a seasoned financial analyst or CFO.",
        objectives: [
            "Deconstruct standard corporate Profit & Loss statements.",
            "Perform horizontal (YoY growth) and vertical (common-size margin) P&L analysis.",
            "Identify accounting adjustments that mask underlying operational weaknesses."
        ],
        formulaSheet: [
            { name: "Common-Size P&L Line %", expression: "Line Item % = (Line Item Expense / Total Net Revenue) × 100", useCase: "P&L benchmarking." }
        ],
        lessons: generateCourseLessons("C26", "Business P&L Fluency", "Business Profit Operations"),
        category: "business"
    },
    {
        id: "C27",
        code: "C27",
        title: "Cash Profit vs Accounting Profit",
        pathId: "earn-path-6",
        pathTitle: "Business Profit Operations",
        level: "Intermediate",
        duration: "3h 45m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Free Cash Flow", "Working Capital", "Cash Conversion Cycle", "Accruals vs Cash"],
        description: "Understand why companies showing accounting profits go bankrupt. Master Free Cash Flow and the Cash Conversion Cycle.",
        objectives: [
            "Reconcile Net Income on the P&L with Operating Cash Flow on the Cash Flow Statement.",
            "Calculate Working Capital requirements and Days Sales Outstanding (DSO).",
            "Compute Free Cash Flow to Firm (FCFF) and Free Cash Flow to Equity (FCFE)."
        ],
        formulaSheet: [
            { name: "Free Cash Flow (FCF)", expression: "FCF = Cash from Operations - Capital Expenditures (CapEx)", useCase: "True cash generation." },
            { name: "Cash Conversion Cycle", expression: "CCC = DSO + DIO - DPO", useCase: "Working capital speed." }
        ],
        lessons: generateCourseLessons("C27", "Cash Profit vs Accounting Profit", "Business Profit Operations"),
        category: "business"
    },
    {
        id: "C28",
        code: "C28",
        title: "Operating Leverage",
        pathId: "earn-path-6",
        pathTitle: "Business Profit Operations",
        level: "Advanced",
        duration: "4h 00m",
        lessonsCount: 14,
        xpReward: 500,
        passMark: 80,
        skills: ["Degree of Operating Leverage", "Fixed vs Variable Costs", "Margin Scaling", "EBIT Expansion"],
        description: "Harness high operating leverage: how fixed-cost software and digital platforms achieve explosive profit growth as revenue expands.",
        objectives: [
            "Calculate the Degree of Operating Leverage (DOL).",
            "Understand how high fixed-cost structures accelerate profit during revenue growth.",
            "Assess downside vulnerability during revenue contractions."
        ],
        formulaSheet: [
            { name: "Degree of Operating Leverage (DOL)", expression: "DOL = % Change in EBIT / % Change in Sales Revenue", useCase: "Operating leverage sensitivity." }
        ],
        lessons: generateCourseLessons("C28", "Operating Leverage", "Business Profit Operations"),
        category: "business"
    },
    {
        id: "C29",
        code: "C29",
        title: "Overhead Control",
        pathId: "earn-path-6",
        pathTitle: "Business Profit Operations",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["SG&A Optimization", "Zero-Based Expense Audits", "Vendor Renegotiation", "Waste Elimination"],
        description: "Implement institutional zero-based overhead audits to prune bloated SG&A costs and protect core bottom-line cash.",
        objectives: [
            "Conduct quarterly zero-based reviews on all software, subscriptions, and administrative overhead.",
            "Establish vendor renegotiation frameworks to benchmark market rates annually.",
            "Cap non-productive overhead at strict percentages of gross profit."
        ],
        formulaSheet: [
            { name: "Overhead Ratio %", expression: "Overhead % = (Total Administrative & Fixed OPEX / Gross Profit) × 100", useCase: "Overhead efficiency." }
        ],
        lessons: generateCourseLessons("C29", "Overhead Control", "Business Profit Operations"),
        category: "business"
    },
    {
        id: "C30",
        code: "C30",
        title: "Profit Centers vs Cost Centers",
        pathId: "earn-path-6",
        pathTitle: "Business Profit Operations",
        level: "Intermediate",
        duration: "3h 00m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Cost Allocation", "Profit Centers", "Internal Transfer Pricing", "ROI Alignment"],
        description: "Segregate business activities into revenue-generating Profit Centers vs supporting Cost Centers for precise resource allocation.",
        objectives: [
            "Categorize business and career activities into Profit Centers vs Cost Centers.",
            "Allocate shared overhead fairly to evaluate real divisional profit.",
            "Position personal career skills directly within high-visibility Profit Centers."
        ],
        formulaSheet: [
            { name: "Profit Center ROI", expression: "PC ROI = Net Profit Generated / Capital Allocated to Center", useCase: "Internal capital allocation." }
        ],
        lessons: generateCourseLessons("C30", "Profit Centers vs Cost Centers", "Business Profit Operations"),
        category: "business"
    },

    // PATH 7 — EARNINGS GROWTH LEVERS (C31 - C35)
    {
        id: "C31",
        code: "C31",
        title: "The 4 Ways to Increase Profit",
        pathId: "earn-path-7",
        pathTitle: "Earnings Growth Levers",
        level: "Beginner",
        duration: "3h 00m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["4 Profit Levers", "Jay Abraham Matrix", "Compound Scaling", "Geometric Growth"],
        description: "Deploy Jay Abraham's classic geometric profit model: Increase customers, transaction size, purchase frequency, and profit margins.",
        objectives: [
            "Master the 4 core profit levers: Client Count, Average Transaction Value, Purchase Frequency, and Net Margin.",
            "Model how a 10% increase across all 4 levers compounds into a 46.4% total profit explosion.",
            "Select your lowest-hanging growth vector for immediate implementation."
        ],
        formulaSheet: [
            { name: "Geometric Profit Formula", expression: "Total Profit = Customers × Avg Transaction Value × Frequency × Net Margin %", useCase: "Multi-lever growth modeling." }
        ],
        lessons: generateCourseLessons("C31", "The 4 Ways to Increase Profit", "Earnings Growth Levers"),
        category: "growth"
    },
    {
        id: "C32",
        code: "C32",
        title: "Conversion & Funnel Economics",
        pathId: "earn-path-7",
        pathTitle: "Earnings Growth Levers",
        level: "Intermediate",
        duration: "3h 30m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Funnel Economics", "CAC", "Conversion Rate", "Payback Velocity"],
        description: "Model sales funnels, Customer Acquisition Cost (CAC), conversion rates at each stage, and marketing payback timelines.",
        objectives: [
            "Calculate stage-by-stage funnel conversion rates from lead to paying customer.",
            "Compute Customer Acquisition Cost (CAC) and compare against Customer Lifetime Value (LTV).",
            "Optimize funnel bottlenecks to double net earnings with zero increase in advertising spend."
        ],
        formulaSheet: [
            { name: "Customer Acquisition Cost (CAC)", expression: "CAC = Total Sales & Marketing Spend / Number of New Customers Acquired", useCase: "Marketing acquisition cost." },
            { name: "LTV to CAC Ratio", expression: "LTV / CAC Ratio (Target: ≥ 3.0x)", useCase: "Unit economic health." }
        ],
        lessons: generateCourseLessons("C32", "Conversion & Funnel Economics", "Earnings Growth Levers"),
        category: "growth"
    },
    {
        id: "C33",
        code: "C33",
        title: "Retention Economics",
        pathId: "earn-path-7",
        pathTitle: "Earnings Growth Levers",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Churn Rate", "Net Revenue Retention (NRR)", "Customer Lifetime Value", "Retention Compounding"],
        description: "Understand why acquiring a new customer costs 5x more than retaining an existing one. Master Churn and Net Retention math.",
        objectives: [
            "Calculate Customer Churn Rate and Revenue Churn Rate.",
            "Compute Net Revenue Retention (NRR) and expansion revenue from existing accounts.",
            "Quantify the lifetime compounding profit advantage of a 5% increase in customer retention."
        ],
        formulaSheet: [
            { name: "Monthly Churn Rate %", expression: "Churn % = (Lost Customers in Month / Starting Customers in Month) × 100", useCase: "Measuring customer attrition." },
            { name: "Customer Lifetime Value (LTV)", expression: "LTV = (Avg Transaction Value × Frequency) / Churn Rate", useCase: "Lifetime revenue projection." }
        ],
        lessons: generateCourseLessons("C33", "Retention Economics", "Earnings Growth Levers"),
        category: "growth"
    },
    {
        id: "C34",
        code: "C34",
        title: "Product Mix Optimization",
        pathId: "earn-path-7",
        pathTitle: "Earnings Growth Levers",
        level: "Intermediate",
        duration: "3h 30m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Product Mix", "Gross Margin Weighting", "Boston Consulting Group (BCG) Matrix", "Margin Shift"],
        description: "Analyze how shifting sales mix towards high-margin products dramatically boosts net profit without requiring more total sales.",
        objectives: [
            "Calculate Weighted Average Gross Margin across diversified offerings.",
            "Apply the BCG Matrix (Stars, Cash Cows, Question Marks, Dogs) to products and skills.",
            "Execute deliberate portfolio mix shifts towards high-margin cash engines."
        ],
        formulaSheet: [
            { name: "Weighted Average Margin %", expression: "WAM % = ∑ (Product Revenue Share % × Product Gross Margin %)", useCase: "Portfolio margin optimization." }
        ],
        lessons: generateCourseLessons("C34", "Product Mix Optimization", "Earnings Growth Levers"),
        category: "growth"
    },
    {
        id: "C35",
        code: "C35",
        title: "Productivity Leverage",
        pathId: "earn-path-7",
        pathTitle: "Earnings Growth Levers",
        level: "Intermediate",
        duration: "3h 00m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Naval Ravikant 4 Forms of Leverage", "Code & Media", "Capital Leverage", "Labor Leverage"],
        description: "Deploy Naval Ravikant's permissionless leverage framework: Code, Media, Capital, and Labor to scale earnings exponentially.",
        objectives: [
            "Deconstruct the 4 forms of leverage: Labor (people), Capital (money), Code (software), and Media (content).",
            "Differentiate permissioned leverage (hiring/borrowing) from permissionless leverage (code/media with zero marginal cost of reproduction).",
            "Build an individual leverage roadmap to decouple personal income from manual physical presence."
        ],
        formulaSheet: [
            { name: "Leverage Output Multiplier", expression: "LOM = Total Output Value / Direct Human Labor Hours Expended", useCase: "Measuring leverage return." }
        ],
        lessons: generateCourseLessons("C35", "Productivity Leverage", "Earnings Growth Levers"),
        category: "growth"
    },

    // PATH 8 — CAPITAL INCOME & RETURN ON MONEY (C36 - C40)
    {
        id: "C36",
        code: "C36",
        title: "Turning Profit into Capital",
        pathId: "earn-path-8",
        pathTitle: "Capital Income & Return on Money",
        level: "Beginner",
        duration: "3h 00m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Capital Conversion", "Operating Surplus", "Asset Accumulation", "Income Transition"],
        description: "Establish the bridge that transforms active operating profits into enduring productive capital assets.",
        objectives: [
            "Implement systematic sweeping of monthly operating surplus into asset acquisition.",
            "Classify capital assets by productive cash-flow generation capability.",
            "Track the Capital Conversion Velocity from labor sweat into balance sheet equity."
        ],
        formulaSheet: [
            { name: "Capital Conversion Rate", expression: "CCR % = (Monthly Capital Invested / Net Monthly Surplus) × 100", useCase: "Surplus deployment speed." }
        ],
        lessons: generateCourseLessons("C36", "Turning Profit into Capital", "Capital Income & Return on Money"),
        category: "capital"
    },
    {
        id: "C37",
        code: "C37",
        title: "ROI, ROE & Payback Period",
        pathId: "earn-path-8",
        pathTitle: "Capital Income & Return on Money",
        level: "Intermediate",
        duration: "3h 45m",
        lessonsCount: 14,
        xpReward: 500,
        passMark: 80,
        skills: ["Return on Investment", "Return on Equity", "Payback Period", "IRR"],
        description: "Evaluate investment opportunities and business ventures using institutional metrics: ROI, ROE, IRR, and Payback horizons.",
        objectives: [
            "Compute Return on Investment (ROI) and Return on Equity (ROE).",
            "Calculate simple and discounted Payback Periods for capital projects.",
            "Benchmark internal hurdle rates (e.g. 15% target IRR) before committing capital."
        ],
        formulaSheet: [
            { name: "Return on Investment (ROI)", expression: "ROI % = [(Net Profit from Investment) / Total Investment Cost] × 100", useCase: "Investment evaluation." },
            { name: "Payback Period", expression: "Payback Period = Initial Capital Outlay / Annual Net Cash Inflow", useCase: "Capital recovery horizon." }
        ],
        lessons: generateCourseLessons("C37", "ROI, ROE & Payback Period", "Capital Income & Return on Money"),
        category: "capital"
    },
    {
        id: "C38",
        code: "C38",
        title: "Compounding Earned Capital",
        pathId: "earn-path-8",
        pathTitle: "Capital Income & Return on Money",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["CAGR", "Dividend Reinvestment", "Compounding Snowball", "Asset Allocation"],
        description: "Reinvest all dividends and yields to ignite the exponential phase of the wealth compounding snowball.",
        objectives: [
            "Model the multi-decade difference between cash dividend withdrawals vs total dividend reinvestment.",
            "Calculate the geometric progression of diversified index portfolios at 12% CAGR.",
            "Construct an asset allocation model balancing equity growth with fixed-income liquidity."
        ],
        formulaSheet: [
            { name: "Future Value of Compounded Capital", expression: "FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]", useCase: "Wealth projection." }
        ],
        lessons: generateCourseLessons("C38", "Compounding Earned Capital", "Capital Income & Return on Money"),
        category: "capital"
    },
    {
        id: "C39",
        code: "C39",
        title: "Yield vs Total Return",
        pathId: "earn-path-8",
        pathTitle: "Capital Income & Return on Money",
        level: "Intermediate",
        duration: "3h 30m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Dividend Yield", "Capital Appreciation", "Total Return", "Yield Traps"],
        description: "Differentiate current cash yield from capital appreciation. Avoid high-yield dividend traps and focus on Total Shareholder Return.",
        objectives: [
            "Define Total Return = Current Cash Yield % + Capital Growth %.",
            "Identify high-yield value traps where high dividend payouts mask depreciating capital.",
            "Match yield vs growth allocations to specific life stages and liquidity demands."
        ],
        formulaSheet: [
            { name: "Total Return %", expression: "Total Return % = [(Ending Value - Beginning Value + Cash Inflows) / Beginning Value] × 100", useCase: "Real portfolio performance." }
        ],
        lessons: generateCourseLessons("C39", "Yield vs Total Return", "Capital Income & Return on Money"),
        category: "capital"
    },
    {
        id: "C40",
        code: "C40",
        title: "Allocation of Profits",
        pathId: "earn-path-8",
        pathTitle: "Capital Income & Return on Money",
        level: "Advanced",
        duration: "3h 45m",
        lessonsCount: 14,
        xpReward: 500,
        passMark: 80,
        skills: ["Capital Allocation", "Hurdle Rates", "Reinvestment vs Distribution", "Buffett Capital Principles"],
        description: "Master CEO-level capital allocation: Decide when to reinvest in personal growth, business expansion, or liquid public markets.",
        objectives: [
            "Evaluate reinvestment opportunities against a strict opportunity cost hurdle rate.",
            "Balance business/career reinvestment with liquid stock market compounding.",
            "Formulate an institutional capital allocation policy for retained profits."
        ],
        formulaSheet: [
            { name: "Reinvestment Return Index", expression: "RRI = Incremental Net Earnings Generated / Capital Reinvested", useCase: "Capital deployment return." }
        ],
        lessons: generateCourseLessons("C40", "Allocation of Profits", "Capital Income & Return on Money"),
        category: "capital"
    },

    // PATH 9 — RISK & EARNINGS DEFENSE (C41 - C45)
    {
        id: "C41",
        code: "C41",
        title: "Earnings Volatility & Stability Score",
        pathId: "earn-path-9",
        pathTitle: "Risk & Earnings Defense",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Coefficient of Variation", "Earnings Volatility", "Stability Score", "Cash Smoothing"],
        description: "Quantify the volatility of your income streams using statistical metrics and construct cash-smoothing buffers.",
        objectives: [
            "Calculate standard deviation and Coefficient of Variation (CV) of monthly earnings.",
            "Establish a personal Income Stability Score.",
            "Design a buffer holding account to pay yourself a smoothed, fixed monthly salary from volatile earnings."
        ],
        formulaSheet: [
            { name: "Coefficient of Variation (Income Volatility)", expression: "CV = (Standard Deviation of Monthly Income / Mean Monthly Income) × 100", useCase: "Measuring earnings risk." }
        ],
        lessons: generateCourseLessons("C41", "Earnings Volatility & Stability Score", "Risk & Earnings Defense"),
        category: "risk"
    },
    {
        id: "C42",
        code: "C42",
        title: "Income Concentration Risk",
        pathId: "earn-path-9",
        pathTitle: "Risk & Earnings Defense",
        level: "Beginner",
        duration: "2h 45m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Concentration Risk", "Herfindahl Index", "Single-Point-of-Failure", "Client Diversification"],
        description: "Audit dependency on a single employer or key client. Eliminate single-point-of-failure vulnerabilities in personal cashflow.",
        objectives: [
            "Calculate income concentration percentages across primary sources.",
            "Apply the 25% Rule: Ensure no single client or customer accounts for more than 25% of total earnings.",
            "Formulate a de-risking plan for single-employer salaried professionals."
        ],
        formulaSheet: [
            { name: "Top Source Concentration %", expression: "Concentration % = (Income from Largest Single Source / Total Net Income) × 100", useCase: "Assessing vulnerability." }
        ],
        lessons: generateCourseLessons("C42", "Income Concentration Risk", "Risk & Earnings Defense"),
        category: "risk"
    },
    {
        id: "C43",
        code: "C43",
        title: "Margin of Safety for Earners",
        pathId: "earn-path-9",
        pathTitle: "Risk & Earnings Defense",
        level: "Intermediate",
        duration: "3h 00m",
        lessonsCount: 10,
        xpReward: 500,
        passMark: 80,
        skills: ["Margin of Safety", "Living Cost Cushion", "Worst-Case Modeling", "Fixed Cost Flexibility"],
        description: "Apply Benjamin Graham's Margin of Safety principle to personal living costs, debt obligations, and fixed commitments.",
        objectives: [
            "Compute your Personal Margin of Safety under a 30% and 50% income drop scenario.",
            "Structure fixed obligations so they never exceed 40% of baseline conservative income.",
            "Create immediate contractual and lifestyle levers to slash monthly burn rate within 7 days."
        ],
        formulaSheet: [
            { name: "Personal Margin of Safety %", expression: "MoS % = [(Current Income - Absolute Essential Survival Burn) / Current Income] × 100", useCase: "Downside cushion." }
        ],
        lessons: generateCourseLessons("C43", "Margin of Safety for Earners", "Risk & Earnings Defense"),
        category: "risk"
    },
    {
        id: "C44",
        code: "C44",
        title: "Downside Scenarios",
        pathId: "earn-path-9",
        pathTitle: "Risk & Earnings Defense",
        level: "Intermediate",
        duration: "3h 30m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Stress Testing", "Downside Modeling", "Layoff Survival Protocol", "Emergency Liquidity"],
        description: "Stress-test your finances against severe shocks: job loss, industry downturns, health emergencies, and market crashes.",
        objectives: [
            "Conduct structured financial fire drills simulating 6 months of zero income.",
            "Map out prioritized liquid asset drawdown waterfalls (Flexi FD → Liquid Mutual Fund → Equity).",
            "Protect long-term compounding portfolios from premature distress liquidation."
        ],
        formulaSheet: [
            { name: "Stress-Test Survival Horizon", expression: "Survival Months = Total Non-Volatile Liquid Reserves / Essential Survival Outflow", useCase: "Crisis runway." }
        ],
        lessons: generateCourseLessons("C44", "Downside Scenarios", "Risk & Earnings Defense"),
        category: "risk"
    },
    {
        id: "C45",
        code: "C45",
        title: "Protecting Earning Power",
        pathId: "earn-path-9",
        pathTitle: "Risk & Earnings Defense",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Pure Term Insurance", "Comprehensive Health Insurance", "Disability Defense", "Human Capital Protection"],
        description: "Insure your single greatest asset: your human capital and future lifetime earning capacity.",
        objectives: [
            "Calculate Human Life Value (HLV) to determine exact pure Term Insurance coverage needs (15x-20x annual earnings).",
            "Establish adequate Super Top-Up Health Insurance and critical illness protection.",
            "Safeguard family wealth against premature mortality and permanent disability."
        ],
        formulaSheet: [
            { name: "Human Life Value (HLV)", expression: "HLV = (Annual Earnings - Personal Expenses) × Working Years Remaining Discount Factor", useCase: "Term insurance sizing." }
        ],
        lessons: generateCourseLessons("C45", "Protecting Earning Power", "Risk & Earnings Defense"),
        category: "risk"
    },

    // PATH 10 — ADVANCED WEALTH-FROM-PROFIT (C46 - C50)
    {
        id: "C46",
        code: "C46",
        title: "Profit Targets & Money OKRs",
        pathId: "earn-path-10",
        pathTitle: "Advanced Wealth-From-Profit",
        level: "Intermediate",
        duration: "3h 15m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Financial OKRs", "Target Setting", "Milestone Tracking", "Quarterly Cadence"],
        description: "Formulate institutional Objectives and Key Results (OKRs) for personal profit, savings velocity, and net worth growth.",
        objectives: [
            "Draft inspiring financial Objectives paired with 3 quantifiable Key Results per quarter.",
            "Establish leading indicators (e.g. daily prospecting hours) vs lagging indicators (quarterly revenue).",
            "Conduct quarterly OKR scoring and retrospective rebalancing."
        ],
        formulaSheet: [
            { name: "OKR Completion Index", expression: "OKR Score = Average(KR1% + KR2% + KR3%)", useCase: "Performance tracking." }
        ],
        lessons: generateCourseLessons("C46", "Profit Targets & Money OKRs", "Advanced Wealth-From-Profit"),
        category: "advanced"
    },
    {
        id: "C47",
        code: "C47",
        title: "Multi-Income Portfolio Design",
        pathId: "earn-path-10",
        pathTitle: "Advanced Wealth-From-Profit",
        level: "Advanced",
        duration: "4h 00m",
        lessonsCount: 14,
        xpReward: 500,
        passMark: 80,
        skills: ["4-Layer Income Architecture", "Side Engines", "Equity Dividends", "Synergistic Streams"],
        description: "Architect a 4-layer multi-income ecosystem: Primary salary/business, consulting retainers, digital assets, and investment dividends.",
        objectives: [
            "Construct a 4-tier income pyramid balancing stability, high margins, and passive yield.",
            "Ensure secondary income streams leverage existing career capital without diluting primary focus.",
            "Attain the milestone where non-labor capital cashflow covers 100% of basic living costs."
        ],
        formulaSheet: [
            { name: "Passive Coverage Ratio", expression: "PCR % = (Passive & Capital Inflows / Monthly Living Expenses) × 100", useCase: "Financial independence milestone." }
        ],
        lessons: generateCourseLessons("C47", "Multi-Income Portfolio Design", "Advanced Wealth-From-Profit"),
        category: "advanced"
    },
    {
        id: "C48",
        code: "C48",
        title: "Active Income → Ownership Income",
        pathId: "earn-path-10",
        pathTitle: "Advanced Wealth-From-Profit",
        level: "Advanced",
        duration: "4h 15m",
        lessonsCount: 14,
        xpReward: 500,
        passMark: 80,
        skills: ["Equity Ownership", "Cap Table Thinking", "Royalty Streams", "Capital Transition"],
        description: "The ultimate wealth transition: shifting from selling labor for wages to owning equity, IP, profit shares, and compounding balance sheets.",
        objectives: [
            "Understand why equity and asset ownership create 95%+ of all generational wealth.",
            "Structure profit-share, advisory equity, and IP licensing contracts.",
            "Design your personal 10-year transition roadmap from active worker to asset owner."
        ],
        formulaSheet: [
            { name: "Equity Wealth Ratio", expression: "EWR % = (Value of Ownership Assets / Total Net Worth) × 100", useCase: "Wealth quality analysis." }
        ],
        lessons: generateCourseLessons("C48", "Active Income → Ownership Income", "Advanced Wealth-From-Profit"),
        category: "advanced"
    },
    {
        id: "C49",
        code: "C49",
        title: "Wealth Engine Dashboard",
        pathId: "earn-path-10",
        pathTitle: "Advanced Wealth-From-Profit",
        level: "Advanced",
        duration: "3h 45m",
        lessonsCount: 12,
        xpReward: 500,
        passMark: 80,
        skills: ["Executive Dashboard", "Net Worth Modeling", "Financial Cockpit", "KPI Synthesis"],
        description: "Build an executive financial cockpit synthesizing income velocity, profit margins, asset allocation, and FIRE projections.",
        objectives: [
            "Consolidate all personal financial metrics into a single real-time executive dashboard.",
            "Track the 8 Core Wealth KPIs: Income Velocity, Profit Rate, Net Margin, Burn Rate, Runway, DTI, ROI, and FIRE %.",
            "Run predictive 10-year Monte Carlo compounding simulations."
        ],
        formulaSheet: [
            { name: "FIRE Progress Index", expression: "FIRE % = (Current Compounding Net Worth / 30x Annual Expenses Target) × 100", useCase: "Financial freedom progress." }
        ],
        lessons: generateCourseLessons("C49", "Wealth Engine Dashboard", "Advanced Wealth-From-Profit"),
        category: "advanced"
    },
    {
        id: "C50",
        code: "C50",
        title: "Grand Capstone: Personal Earnings OS",
        pathId: "earn-path-10",
        pathTitle: "Advanced Wealth-From-Profit",
        level: "Advanced",
        duration: "5h 00m",
        lessonsCount: 16,
        xpReward: 1000,
        passMark: 80,
        skills: ["Comprehensive Synthesis", "Personal Earnings OS", "Institutional Financial Architecture", "MFE Designation"],
        description: "Synthesize all 50 courses into a unified, institutional-grade Personal Earnings Operating System and complete the MFE Grand Capstone.",
        objectives: [
            "Synthesize all concepts across Income Foundations, Profit Systems, Pricing, Operations, and Capital.",
            "Formulate and document your complete Personal Earnings Operating System (PE-OS).",
            "Prepare for and pass the comprehensive 100-question MFE Grand Capstone Certification Exam."
        ],
        formulaSheet: [
            { name: "Total Financial Health Score", expression: "TFHS = Weighted Composite of All 10 Pathway Metrics (0 - 100)", useCase: "Comprehensive mastery score." }
        ],
        lessons: generateCourseLessons("C50", "Grand Capstone: Personal Earnings OS", "Advanced Wealth-From-Profit"),
        category: "advanced"
    }
];

// ---------------------------------------------------------------------------
// 100-Question Exam Generator / Question Bank Engine
// Generates rigorous, educationally relevant, mathematically accurate questions
// for all 50 courses + Grand Capstone across 5 distinct question types.
// ---------------------------------------------------------------------------
export const generateCourseExamQuestions = (course: EarningsCourse, count: number = 100): CertificationQuestion[] => {
    const questions: CertificationQuestion[] = [];
    const skillList = course.skills;

    // Template generators tailored to the course topic and mathematical formulas
    for (let i = 1; i <= count; i++) {
        const skill = skillList[(i - 1) % skillList.length];
        const difficulty: "Fundamental" | "Applied" | "Advanced" = i <= 35 ? "Fundamental" : i <= 80 ? "Applied" : "Advanced";
        
        let qType: CertificationQuestion["questionType"] = "Multiple Choice";
        if (i % 5 === 1) qType = "Multiple Choice";
        else if (i % 5 === 2) qType = "Numeric Calculation";
        else if (i % 5 === 3) qType = "Scenario Judgment";
        else if (i % 5 === 4) qType = "Mini Case";
        else qType = "True/False";

        const qId = `${course.code}-Q-${i.toString().padStart(3, "0")}`;

        // Create rich, mathematically diverse questions
        if (qType === "Numeric Calculation") {
            const rev = (50000 + i * 5000) * 2;
            const cost = Math.round(rev * (0.45 + (i % 20) * 0.015));
            const profit = rev - cost;
            const margin = Math.round((profit / rev) * 100);
            const wrong1 = margin + 8;
            const wrong2 = Math.max(5, margin - 12);
            const wrong3 = Math.round(((cost) / rev) * 100);

            questions.push({
                id: qId,
                courseId: course.id,
                courseCode: course.code,
                question: `An entity in ${course.title} generates gross revenue of ₹${rev.toLocaleString("en-IN")} with total associated expenses and cost of goods of ₹${cost.toLocaleString("en-IN")}. What is the exact net margin percentage achieved?`,
                options: [
                    `${wrong1}%`,
                    `${margin}% (Net Profit: ₹${profit.toLocaleString("en-IN")})`,
                    `${wrong2}%`,
                    `${wrong3}% (Cost Ratio)`
                ],
                correctAnswer: 1,
                explanation: `Net profit is ₹${rev.toLocaleString("en-IN")} - ₹${cost.toLocaleString("en-IN")} = ₹${profit.toLocaleString("en-IN")}. Net Margin = (₹${profit.toLocaleString("en-IN")} / ₹${rev.toLocaleString("en-IN")}) × 100 = ${margin}%.`,
                difficulty,
                skillTag: skill,
                questionType: qType
            });
        } else if (qType === "Scenario Judgment") {
            questions.push({
                id: qId,
                courseId: course.id,
                courseCode: course.code,
                question: `Under the principles of ${course.title} (${skill}), when faced with rising operational inflation and customer price sensitivity, which strategic decision yields the highest sustainable margin protection?`,
                options: [
                    "Immediately slash selling prices by 25% to chase volume at any cost",
                    "Unbundle auxiliary offerings, institute tiered value packaging, and eliminate low-contribution overhead",
                    "Cease marketing operations completely to reduce direct cash outflows",
                    "Borrow short-term personal debt to subsidize loss-making product units"
                ],
                correctAnswer: 1,
                explanation: `In ${course.title}, unbundling, tier packaging, and overhead pruning protect operating margins without damaging long-term pricing integrity.`,
                difficulty,
                skillTag: skill,
                questionType: qType
            });
        } else if (qType === "Mini Case") {
            const baseSalary = 80000 + i * 2000;
            const targetSurplus = Math.round(baseSalary * 0.35);
            questions.push({
                id: qId,
                courseId: course.id,
                courseCode: course.code,
                question: `[CASE STUDY #${i}]: A professional earning ₹${baseSalary.toLocaleString("en-IN")} net monthly applies ${course.title} principles. Their fixed commitments are ₹${Math.round(baseSalary * 0.45).toLocaleString("en-IN")} and discretionary wants are ₹${Math.round(baseSalary * 0.20).toLocaleString("en-IN")}. What is their monthly retained personal profit and profit rate?`,
                options: [
                    `₹${targetSurplus.toLocaleString("en-IN")} retained profit (35% profit rate)`,
                    `₹${Math.round(baseSalary * 0.15).toLocaleString("en-IN")} retained profit (15% profit rate)`,
                    `₹${Math.round(baseSalary * 0.50).toLocaleString("en-IN")} retained profit (50% profit rate)`,
                    `₹0 retained profit (Zero surplus)`
                ],
                correctAnswer: 0,
                explanation: `Total Outflows = 45% + 20% = 65% of income. Retained Personal Profit = 100% - 65% = 35% (₹${targetSurplus.toLocaleString("en-IN")}).`,
                difficulty,
                skillTag: skill,
                questionType: qType
            });
        } else if (qType === "True/False") {
            const isTrue = i % 2 === 0;
            questions.push({
                id: qId,
                courseId: course.id,
                courseCode: course.code,
                question: isTrue
                    ? `True or False: In ${course.title}, optimizing contribution margin per unit allows an enterprise or individual to lower their break-even threshold and improve financial resilience.`
                    : `True or False: In ${course.title}, top-line gross revenue is always a superior indicator of long-term solvency compared to net free cash flow.`,
                options: [
                    "True",
                    "False"
                ],
                correctAnswer: isTrue ? 0 : 1,
                explanation: isTrue
                    ? `True: Higher contribution margins absorb fixed overhead faster, dramatically lowering the break-even point.`
                    : `False: Net free cash flow and retained operating profit dictate actual solvency; top-line gross revenue without profit leads to insolvency.`,
                difficulty,
                skillTag: skill,
                questionType: qType
            });
        } else {
            // Standard Multiple Choice
            questions.push({
                id: qId,
                courseId: course.id,
                courseCode: course.code,
                question: `Which fundamental principle of ${course.title} is most essential for mastering ${skill}?`,
                options: [
                    `Strict quantification of unit costs, automated cash capture, and proactive margin defense`,
                    `Maximizing raw working hours without regard to realized hourly yield`,
                    `Accepting unmanaged scope creep to satisfy low-margin counterparties`,
                    `Relying purely on retrospective annual tax filings rather than monthly reconciliation`
                ],
                correctAnswer: 0,
                explanation: `Mastering ${skill} requires rigorous unit cost quantification, automated surplus extraction, and disciplined margin defense.`,
                difficulty,
                skillTag: skill,
                questionType: qType
            });
        }
    }

    return questions;
};

// ---------------------------------------------------------------------------
// 5 Professional Tiers
// ---------------------------------------------------------------------------
export interface ProfessionalTier {
    tier: "Associate" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
    name: string;
    requiredCerts: number;
    requiredDiplomas: number;
    requiresCapstone: boolean;
    color: string;
    description: string;
}

export const PROFESSIONAL_TIERS: ProfessionalTier[] = [
    {
        tier: "Associate",
        name: "Associate Learner",
        requiredCerts: 0,
        requiredDiplomas: 0,
        requiresCapstone: false,
        color: "#94a3b8",
        description: "Starting phase of your professional Earnings & Profit journey."
    },
    {
        tier: "Bronze",
        name: "Earnings Initiate",
        requiredCerts: 5,
        requiredDiplomas: 0,
        requiresCapstone: false,
        color: "#cd7f32",
        description: "Earn 5 Course Certifications across Income & Profit Fundamentals."
    },
    {
        tier: "Silver",
        name: "Profit Practitioner",
        requiredCerts: 10,
        requiredDiplomas: 1,
        requiresCapstone: false,
        color: "#94a3b8",
        description: "Earn 10 Course Certifications and at least 1 Pathway Diploma."
    },
    {
        tier: "Gold",
        name: "Certified Earnings Analyst",
        requiredCerts: 20,
        requiredDiplomas: 3,
        requiresCapstone: false,
        color: "#f59e0b",
        description: "Earn 20 Course Certifications across Pricing, Business & Profit Math."
    },
    {
        tier: "Platinum",
        name: "Senior Earnings Strategist",
        requiredCerts: 35,
        requiredDiplomas: 6,
        requiresCapstone: false,
        color: "#6366f1",
        description: "Earn 35 Course Certifications across Advanced Operations & Capital Systems."
    },
    {
        tier: "Diamond",
        name: "Master of Financial Earnings (MFE)",
        requiredCerts: 50,
        requiredDiplomas: 10,
        requiresCapstone: true,
        color: "#06b6d4",
        description: "Complete all 50 Course Certifications, 10 Pathway Diplomas, and pass the Grand Capstone."
    }
];
