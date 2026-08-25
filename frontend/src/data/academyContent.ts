export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
}

export interface RupeeExample {
    title: string;
    scenario: string;
    takeaway: string;
}

export interface AppliedAction {
    title: string;
    actionText: string;
    xpReward: number;
}

export interface LessonFormula {
    name: string;
    expression: string;
    explanation: string;
}

export interface LessonContent {
    id: string;
    pathId: string;
    title: string;
    summary: string;
    duration: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    xpReward: number;
    objectives: string[];
    coreText: string[];
    formula?: LessonFormula;
    rupeeExample: RupeeExample;
    appliedAction: AppliedAction;
    quizzes: QuizQuestion[];
}

export interface LearningPath {
    id: string;
    name: string;
    icon: string;
    estimatedDuration: string;
    shortOutcome: string;
}

export interface GlossaryTerm {
    id: string;
    term: string;
    category: string;
    definition: string;
    rupeeExample: string;
}

export interface FinancialFormula {
    id: string;
    name: string;
    expression: string;
    explanation: string;
    example: string;
}

export interface WeeklyChallenge {
    id: string;
    title: string;
    description: string;
    xpReward: number;
}

// ---------------------------------------------------------------------------
// 11 Core Learning Paths
// ---------------------------------------------------------------------------
export const LEARNING_PATHS: LearningPath[] = [
    {
        id: "path-1",
        name: "Financial Foundations & Mindset",
        icon: "🌱",
        estimatedDuration: "25 mins",
        shortOutcome: "Understand cashflow velocity, inflation realities, and the mindset shift from consumer to wealth builder."
    },
    {
        id: "path-2",
        name: "Cashflow & Liquidity Mastery",
        icon: "💧",
        estimatedDuration: "30 mins",
        shortOutcome: "Learn net cashflow dynamics, liquidity buffers, and how to prevent month-end bank balance anxiety."
    },
    {
        id: "path-3",
        name: "Smart Budgeting & 50/30/20 Rule",
        icon: "📊",
        estimatedDuration: "35 mins",
        shortOutcome: "Master zero-based allocation, flexible category budgeting, and the classic 50/30/20 lifestyle framework."
    },
    {
        id: "path-4",
        name: "Transaction Intelligence & Audit",
        icon: "🔍",
        estimatedDuration: "30 mins",
        shortOutcome: "Spot subscription leaks, micro-spend drains, and recurring UPI traps before they eat your salary."
    },
    {
        id: "path-5",
        name: "Emergency Runway & Shock Absorbers",
        icon: "🛡️",
        estimatedDuration: "35 mins",
        shortOutcome: "Build a bulletproof 3-6 month emergency fund across liquid mutual funds and high-yield flexi-FDs."
    },
    {
        id: "path-6",
        name: "Debt Elimination & Credit Score",
        icon: "💳",
        estimatedDuration: "40 mins",
        shortOutcome: "Demystify CIBIL scores, optimize Debt-to-Income (DTI), and deploy Debt Avalanche vs Snowball."
    },
    {
        id: "path-7",
        name: "High-Velocity Saving & Payday Rules",
        icon: "💰",
        estimatedDuration: "30 mins",
        shortOutcome: "Implement 'Pay Yourself First' automation on Day 1 of salary credit to maintain a 25%+ savings rate."
    },
    {
        id: "path-8",
        name: "Investing & Compound Growth Engine",
        icon: "📈",
        estimatedDuration: "45 mins",
        shortOutcome: "Master Index SIPs, Nifty 50 compounding, Rupee-cost averaging, and asset allocation strategies."
    },
    {
        id: "path-9",
        name: "Tax Planning & Regime Optimization",
        icon: "📑",
        estimatedDuration: "40 mins",
        shortOutcome: "Navigate New vs Old Tax Regime, Section 80C deductions, NPS Tier-1 benefits, and capital gains tax."
    },
    {
        id: "path-10",
        name: "Behavioral Finance & Impulse Control",
        icon: "🧠",
        estimatedDuration: "30 mins",
        shortOutcome: "Overcome FOMO, lifestyle inflation, instant dopamine spending, and execute the 48-hour cooling rule."
    },
    {
        id: "path-11",
        name: "Long-term Wealth & Financial Independence",
        icon: "👑",
        estimatedDuration: "50 mins",
        shortOutcome: "Calculate your FIRE target corpus, safe withdrawal rates (SWR), and multi-generational compounding."
    }
];

// ---------------------------------------------------------------------------
// 24 Structured Launch Lessons
// ---------------------------------------------------------------------------
export const LAUNCH_LESSONS: LessonContent[] = [
    // PATH 1: Basics
    {
        id: "l-1-1",
        pathId: "path-1",
        title: "The Anatomy of Cashflow & Wealth Velocity",
        summary: "Discover why income alone is not wealth, and how cashflow velocity dictates financial freedom.",
        duration: "6 min read",
        level: "Beginner",
        xpReward: 50,
        objectives: [
            "Differentiate between high income and true financial net worth.",
            "Understand how money velocity creates compounding momentum.",
            "Identify the 3 stages of personal wealth generation."
        ],
        coreText: [
            "Earning a handsome salary is only half the battle. If an individual earns ₹1,50,000 every month but spends ₹1,45,000, their net cash retention is just ₹5,000. They are just one unexpected shock away from financial distress.",
            "Wealth velocity represents how fast your retained surplus is deployed into compounding assets rather than depreciating liabilities.",
            "When you begin tracking your inflows and outflows systematically, you transition from reactive spending to proactive wealth building."
        ],
        formula: {
            name: "Net Cashflow Rate",
            expression: "Net Cashflow = Monthly Income - Total Outflows",
            explanation: "The surplus amount retained at the end of each month that can be converted to compounding investments."
        },
        rupeeExample: {
            title: "Rohan vs Priya: Income vs Net Retained",
            scenario: "Rohan earns ₹1,20,000/month but spends ₹1,15,000 on rent, EMIs, and dining. Priya earns ₹80,000/month, maintains living costs at ₹50,000, and invests ₹30,000 in index funds.",
            takeaway: "In 5 years, Priya accumulates over ₹25 Lakhs in wealth, whereas Rohan has negligible liquid reserves despite a higher income."
        },
        appliedAction: {
            title: "Audit Your Month-End Surplus",
            actionText: "Calculate your exact liquid surplus from last month's salary and verify if it exceeds 20% of your take-home pay.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-1-1-1",
                question: "What is the key differentiator between earning high income and building wealth?",
                options: [
                    "Having multiple credit cards with high limits",
                    "The net surplus retained and invested into compounding assets",
                    "Spending on premium luxury experiences",
                    "Buying high-depreciation consumer tech"
                ],
                correctAnswer: 1
            },
            {
                id: "q-1-1-2",
                question: "If your monthly income is ₹90,000 and total expenses are ₹65,000, what is your net monthly cashflow?",
                options: ["₹15,000", "₹20,000", "₹25,000", "₹30,000"],
                correctAnswer: 2
            }
        ]
    },
    {
        id: "l-1-2",
        pathId: "path-1",
        title: "Inflation: The Silent Tax on Bank Balances",
        summary: "Understand how consumer inflation silently erodes the purchasing power of idle savings accounts.",
        duration: "5 min read",
        level: "Beginner",
        xpReward: 50,
        objectives: [
            "Learn how consumer price inflation (CPI) affects your future buying power.",
            "Understand Real Return = Nominal Return minus Inflation.",
            "Know why savings accounts yielding 3% result in negative real returns."
        ],
        coreText: [
            "Keeping excess cash in a conventional savings account earning 2.7%-3.5% interest feels safe, but with India's average retail inflation running around 5%-6%, your real purchasing power shrinks every single year.",
            "Real Return is calculated by subtracting inflation and taxes from your nominal gains. If an instrument offers 6% nominal yield and inflation is 5.5%, your real wealth growth is nearly zero.",
            "To build long-term wealth, every rupee beyond your emergency reserve must be put in growth assets that beat inflation by at least 4% to 7%."
        ],
        formula: {
            name: "Real Rate of Return",
            expression: "Real Return % ≈ Nominal Return % - Inflation Rate %",
            explanation: "The actual growth of purchasing power after accounting for price increases."
        },
        rupeeExample: {
            title: "The ₹10 Lakh Savings Account Trap",
            scenario: "Aman leaves ₹10 Lakhs in a 3% savings account for 10 years. With 6% inflation, the nominal balance grows to ₹13.4 Lakhs, but its actual goods purchasing power drops to just ₹7.5 Lakhs in today's terms.",
            takeaway: "Idle cash in low-yield accounts guarantees a loss in real purchasing power over the long run."
        },
        appliedAction: {
            title: "Check Your Bank's Flexi-Sweep Option",
            actionText: "Enable auto-sweep flexi fixed deposit on your primary savings account to earn 6.5%+ on idle balances without losing liquidity.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-1-2-1",
                question: "If a Fixed Deposit yields 7% per annum and retail inflation is 5.5%, what is the approximate real return?",
                options: ["1.5%", "7.0%", "12.5%", "-1.5%"],
                correctAnswer: 0
            }
        ]
    },
    {
        id: "l-1-3",
        pathId: "path-1",
        title: "The 3 Money Buckets: Security, Growth, and Freedom",
        summary: "Structure your financial life into three clear functional buckets to eliminate financial uncertainty.",
        duration: "7 min read",
        level: "Beginner",
        xpReward: 50,
        objectives: [
            "Set up the 3-bucket financial architecture.",
            "Segregate short-term safety from long-term capital compounding.",
            "Avoid panic selling by keeping adequate liquidity in the Security bucket."
        ],
        coreText: [
            "Bucket 1 (Security) contains your emergency fund and immediate 12-month liabilities in liquid instruments.",
            "Bucket 2 (Growth) holds monthly systematic index funds, mutual funds, and equity portfolios built to compound for 5+ years.",
            "Bucket 3 (Freedom) powers your aspirational goals like home purchase, sabbatical, entrepreneurship, or early retirement."
        ],
        rupeeExample: {
            title: "Surviving Market Volatility with Buckets",
            scenario: "During a market correction, Karan panicked and sold equities because his rent was due. Anita had 6 months of rent in her Security bucket, allowing her equity portfolio to recover untouched and compound.",
            takeaway: "Never invest money in equities that you might need in under 3 years."
        },
        appliedAction: {
            title: "Categorize Your Current Assets",
            actionText: "List down all your financial accounts and assign each to either Security, Growth, or Freedom.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-1-3-1",
                question: "Which money bucket should hold your 6-month living expenses emergency reserve?",
                options: ["Growth Bucket (Equities)", "Security Bucket (Liquid/FD)", "Freedom Bucket (Speculative)", "Crypto Bucket"],
                correctAnswer: 1
            }
        ]
    },

    // PATH 2: Cashflow
    {
        id: "l-2-1",
        pathId: "path-2",
        title: "Cashflow Cycles: Inflows, Burn Rate, and Runway",
        summary: "Measure your daily burn rate and calculate how many months you can survive without new income.",
        duration: "6 min read",
        level: "Beginner",
        xpReward: 60,
        objectives: [
            "Calculate your exact monthly personal burn rate.",
            "Determine your liquid runway in months.",
            "Identify seasonal spending spikes before they disrupt cashflow."
        ],
        coreText: [
            "Your burn rate is the total amount of money that leaves your accounts each month for essential and lifestyle commitments.",
            "Your runway is calculated by dividing total liquid reserves by your monthly burn rate. Having a runway of less than 2 months puts you in extreme danger during unexpected layoffs or medical emergencies.",
            "By monitoring cashflow daily, you spot deficit months early and adjust discretionary spending before drawing down debt."
        ],
        formula: {
            name: "Runway in Months",
            expression: "Runway (Months) = Total Liquid Reserves / Monthly Burn Rate",
            explanation: "The duration you can maintain your lifestyle without any incoming salary."
        },
        rupeeExample: {
            title: "Calculating Runway During a Career Transition",
            scenario: "Neha has ₹2,40,000 in liquid savings. Her mandatory monthly burn rate (rent, food, insurance, basic bills) is ₹40,000.",
            takeaway: "Neha has a safe 6-month runway (₹2,40,000 / ₹40,000 = 6 months) allowing her to upskill or transition without taking high-interest loans."
        },
        appliedAction: {
            title: "Calculate Your Exact Runway",
            actionText: "Divide your current liquid bank balance by your average monthly expenditure to find your current runway in months.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-2-1-1",
                question: "If your monthly expenses are ₹50,000 and your liquid savings are ₹1,50,000, what is your runway?",
                options: ["1 Month", "3 Months", "6 Months", "9 Months"],
                correctAnswer: 1
            }
        ]
    },
    {
        id: "l-2-2",
        pathId: "path-2",
        title: "Optimizing Payment Timing & Salary Day Routines",
        summary: "Align bill due dates and investment debits immediately after salary credit to safeguard cashflow.",
        duration: "5 min read",
        level: "Beginner",
        xpReward: 50,
        objectives: [
            "Align credit card and utility due dates 3-5 days post salary credit.",
            "Automate SIP debits on day 2 of payday.",
            "Prevent accidental overdraft fees and late payment penalties."
        ],
        coreText: [
            "Most people experience cashflow crunches because their large bills are scattered randomly across the 15th, 22nd, and 28th of the month.",
            "When you cluster your SIPs, rent, and utility debits within the first 5 days after salary credit, you operate on a clear remaining balance for the rest of the month.",
            "This eliminates the psychological illusion of having surplus cash during the middle of the month."
        ],
        rupeeExample: {
            title: "Payday Optimization",
            scenario: "Vikram's salary lands on the 1st. He set his SIPs for the 3rd and utility debits for the 5th. By the 6th, all obligations are paid and he knows his exact safe-to-spend balance.",
            takeaway: "Automated early-month settlement prevents lifestyle overspending."
        },
        appliedAction: {
            title: "Set All Auto-Debits to 3rd-5th of the Month",
            actionText: "Update your SIP and recurring bill payment schedules in your banking apps to execute within 5 days of salary credit.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-2-2-1",
                question: "Why is scheduling SIPs immediately after salary credit recommended?",
                options: [
                    "It ensures you invest before discretionary lifestyle spending takes over",
                    "Banks charge lower fees on the 1st of the month",
                    "Stock markets always drop on salary days",
                    "Credit cards do not work on weekends"
                ],
                correctAnswer: 0
            }
        ]
    },

    // PATH 3: Budgeting
    {
        id: "l-3-1",
        pathId: "path-3",
        title: "The 50/30/20 Rule: Indian Household Edition",
        summary: "Apply the classic 50/30/20 budget framework tailored to Indian living costs and metro rentals.",
        duration: "7 min read",
        level: "Beginner",
        xpReward: 60,
        objectives: [
            "Allocate 50% of take-home pay to Needs (Rent, Groceries, Utilities, Basic EMIs).",
            "Cap Wants (Dining out, OTT, Gadgets, Vacations) at 30%.",
            "Commit at least 20% to Savings, Investments, and Debt Acceleration."
        ],
        coreText: [
            "The 50/30/20 budget provides a clear benchmark to evaluate whether your lifestyle is financially sustainable.",
            "Needs (50% max): Essential housing, groceries, transport, utility bills, health insurance, and mandatory debt minimums.",
            "Wants (30% max): Discretionary choices like dining out, leisure shopping, high-end gym memberships, and entertainment.",
            "Savings (20% minimum): Investments in SIPs, PPF, emergency fund building, and extra principal prepayments on loans."
        ],
        formula: {
            name: "50/30/20 Allocation",
            expression: "Needs (≤50%) + Wants (≤30%) + Savings (≥20%) = 100% Net Income",
            explanation: "The target proportional distribution of post-tax take-home earnings."
        },
        rupeeExample: {
            title: "Applying 50/30/20 to a ₹75,000 Salary in Bengaluru",
            scenario: "For a net take-home of ₹75,000:\n- Needs: ₹37,500 (Rent ₹22k, Groceries ₹8k, Bills ₹7.5k)\n- Wants: ₹22,500 (Dining, weekend trips, OTT)\n- Savings: ₹15,000 (Index SIP ₹10k, Emergency Buffer ₹5k)",
            takeaway: "Maintaining these ratios guarantees ongoing wealth accumulation while still enjoying current lifestyle comfort."
        },
        appliedAction: {
            title: "Run the 50/30/20 Calculator on Your Income",
            actionText: "Open the Interactive Tools tab in this Academy, enter your net salary, and compare your actual category spend to the target guidelines.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-3-1-1",
                question: "In the 50/30/20 framework, what percentage of net income should ideally be committed to savings & investments?",
                options: ["At least 5%", "At least 10%", "At least 20%", "Exactly 50%"],
                correctAnswer: 2
            }
        ]
    },
    {
        id: "l-3-2",
        pathId: "path-3",
        title: "Zero-Based Budgeting: Giving Every Rupee a Job",
        summary: "Eliminate unaccounted cash leaks by allocating every single rupee before the month begins.",
        duration: "6 min read",
        level: "Intermediate",
        xpReward: 60,
        objectives: [
            "Understand how Zero-Based Budgeting (Income - Expenses - Investments = 0) works.",
            "Eliminate 'phantom expenses' that vanish from your bank account without recall.",
            "Assign surplus funds into specific sinking funds for future planned expenses."
        ],
        coreText: [
            "Zero-based budgeting does not mean having ₹0 in your bank account. It means every single rupee of your income is assigned to a specific category: living expenses, investments, savings, or fun money.",
            "When income minus all assigned outflows equals zero, there is no unallocated money left to be mindlessly squandered on impulse purchases.",
            "Sinking funds (e.g. annual car insurance, festival shopping, electronics upgrade) ensure that lump-sum annual expenses never break your monthly budget."
        ],
        rupeeExample: {
            title: "Sinking Funds for Annual Car Insurance",
            scenario: "Anil needs ₹18,000 for annual car insurance every November. Instead of scrambling in November, he allocates ₹1,500 every month into a dedicated sinking fund.",
            takeaway: "Planned sinking funds turn large financial shocks into manageable monthly line items."
        },
        appliedAction: {
            title: "Create 1 Annual Sinking Fund",
            actionText: "Identify one large upcoming expense in the next 6 months and set up a monthly recurring deposit or separate pot for it.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-3-2-1",
                question: "What is the primary premise of Zero-Based Budgeting?",
                options: [
                    "You must spend every rupee until your bank balance is literally zero",
                    "Income minus all budgeted allocations (expenses, investments, savings) equals zero",
                    "You should have zero credit cards and zero bank accounts",
                    "You only buy items priced at zero rupees"
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: "l-3-3",
        pathId: "path-3",
        title: "Pay Yourself First: The Golden Rule of Savings",
        summary: "Invert the traditional savings equation (Income - Expenses = Savings) to guarantee consistent wealth building.",
        duration: "5 min read",
        level: "Beginner",
        xpReward: 60,
        objectives: [
            "Understand why saving what is 'left over' almost always results in zero savings.",
            "Implement the new equation: Income - Investments = Allowed Spending.",
            "Automate wealth accumulation on Day 1."
        ],
        coreText: [
            "Traditional thinking says: Save whatever money is left at the end of the month after paying all bills and spending. In reality, according to Parkinson's Law, expenses always expand to meet income.",
            "When you 'Pay Yourself First', you automatically transfer 20%-30% of your salary into investment accounts on Day 1. You then live comfortably on the remaining 70%-80% without feeling deprived.",
            "This simple behavioral flip turns wealth building from an afterthought into a non-negotiable fixed commitment."
        ],
        formula: {
            name: "The Wealth Builder Equation",
            expression: "Allowed Spending = Net Income - Target Investment (Pay Yourself First)",
            explanation: "Set aside your future wealth first, then spend the rest guilt-free."
        },
        rupeeExample: {
            title: "Same Salary, Different Equations",
            scenario: "Both Ajay and Sneha earn ₹60,000. Ajay tries to save whatever is left and ends up saving ₹2,000/month. Sneha automates ₹15,000 SIP on payday and spends the remaining ₹45,000 freely.",
            takeaway: "Sneha accumulates ₹1.8 Lakhs/year in wealth effortlessly while Ajay struggles to save ₹24,000."
        },
        appliedAction: {
            title: "Automate Payday Investment Transfer",
            actionText: "Ensure your primary SIP or recurring investment executes within 48 hours of salary arrival.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-3-3-1",
                question: "What is the 'Pay Yourself First' principle?",
                options: [
                    "Buying luxury items for yourself before paying your landlord",
                    "Transferring your target savings/investments to wealth accounts immediately upon receiving income",
                    "Taking personal loans to pay for dining out",
                    "Paying your friends before paying bills"
                ],
                correctAnswer: 1
            }
        ]
    },

    // PATH 4: Transactions
    {
        id: "l-4-1",
        pathId: "path-4",
        title: "The UPI Friction Trap & Micro-Transaction Drains",
        summary: "Learn how instant zero-friction UPI payments bypass the brain's spending pain receptors.",
        duration: "6 min read",
        level: "Beginner",
        xpReward: 50,
        objectives: [
            "Recognize how frictionless QR scanning leads to micro-spending leakage.",
            "Calculate the aggregate monthly impact of ₹50 - ₹200 daily impulse payments.",
            "Use dedicated UPI wallets with strict preloaded spending caps."
        ],
        coreText: [
            "Physical cash created tangible friction: you felt money leaving your wallet. UPI scanning eliminates all physical and cognitive friction, making ₹150 for coffee, ₹350 for snacks, and ₹500 for rides feel harmless.",
            "When you review 100+ micro UPI transactions at month-end, they frequently sum up to ₹12,000 - ₹18,000 of unremembered discretionary leakage.",
            "By setting up a secondary UPI wallet or separate daily-spend account with a fixed weekly budget, you re-introduce conscious spending boundaries."
        ],
        rupeeExample: {
            title: "The ₹150 Daily Snack Drain",
            scenario: "Kavya spends ₹180 every working day on quick UPI snacks, coffee, and cab add-ons. Over 22 working days, this equals ₹3,960/month. Over 1 year, that is ₹47,520.",
            takeaway: "Small daily UPI micro-payments compound into significant capital leaks over 12 months."
        },
        appliedAction: {
            title: "Audit Your Top 5 UPI Merchants",
            actionText: "Check your transaction list and identify your top 3 most frequent food delivery, coffee, or quick-commerce merchants.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-4-1-1",
                question: "Why do instant digital payments like UPI increase impulse spending?",
                options: [
                    "Banks charge high interest on UPI payments",
                    "Zero cognitive and physical friction prevents the brain's natural pause before spending",
                    "UPI limits spending to once per day",
                    "UPI only allows purchases over ₹10,000"
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: "l-4-2",
        pathId: "path-4",
        title: "Auditing Subscription Creep & Zombie Recurring Charges",
        summary: "Identify and eliminate recurring monthly and annual subscriptions you no longer actively use.",
        duration: "5 min read",
        level: "Beginner",
        xpReward: 50,
        objectives: [
            "Conduct a full quarterly audit of auto-debit mandates and app subscriptions.",
            "Calculate the true annual cost of recurring services.",
            "Cancel 'Zombie Subscriptions' to immediately unlock monthly cashflow."
        ],
        coreText: [
            "A subscription that costs ₹499/month seems insignificant in isolation, but 6 overlapping entertainment, cloud storage, fitness, and news subscriptions quickly total ₹3,500/month or ₹42,000/year.",
            "Many users forget auto-debits on credit cards for services they haven't used in 4 months (known as Zombie Subscriptions).",
            "Auditing your auto-debits twice a year is the fastest way to instantly recover ₹1,000 - ₹3,000 in monthly disposable income without sacrificing quality of life."
        ],
        rupeeExample: {
            title: "The ₹36,000 Subscription Cleanup",
            scenario: "Deepak had 2 unused OTT platforms (₹1,100/mo), an old cloud backup (₹650/mo), and a gym membership he stopped visiting (₹1,250/mo).",
            takeaway: "Canceling these 4 subscriptions freed up ₹3,000/month, which he redirected into a Nifty 50 Index SIP."
        },
        appliedAction: {
            title: "Cancel 1 Unused Subscription Today",
            actionText: "Review your active recurring mandates in your banking app or credit card and cancel at least one unused service.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-4-2-1",
                question: "What is a 'Zombie Subscription'?",
                options: [
                    "A subscription to a horror movie streaming platform",
                    "A recurring auto-debit service that continues charging you even though you rarely or never use it",
                    "A subscription paid in cryptocurrency",
                    "A government tax on software"
                ],
                correctAnswer: 1
            }
        ]
    },

    // PATH 5: Emergency Fund
    {
        id: "l-5-1",
        pathId: "path-5",
        title: "The 3-to-6 Month Emergency Fund Architecture",
        summary: "Build a resilient liquidity buffer to protect your long-term investments from unplanned life events.",
        duration: "7 min read",
        level: "Beginner",
        xpReward: 60,
        objectives: [
            "Calculate your exact target Emergency Fund size (3x to 6x monthly essential expenses).",
            "Select the ideal instruments: High-yield Flexi FDs and Overnight/Liquid Mutual Funds.",
            "Understand why an emergency fund is insurance, not an investment seeking high returns."
        ],
        coreText: [
            "An emergency fund is not meant to make you rich; its purpose is to keep you from becoming poor when unpredictable shocks hit.",
            "If you have single-income dependants, target 6 to 9 months of essential living expenses. If you have dual-income stability and low fixed obligations, 3 to 6 months is sufficient.",
            "Never lock emergency money in equity mutual funds, locked tax-savers, or real estate. It must be accessible within 24 hours without market exit loss."
        ],
        formula: {
            name: "Emergency Target Corpus",
            expression: "Emergency Buffer = Essential Monthly Expenses × (3 to 6 Months)",
            explanation: "Total liquid cash required to maintain essential life functions during zero income."
        },
        rupeeExample: {
            title: "Navigating Sudden Medical Out-of-Pocket Expenses",
            scenario: "Rahul had ₹2,50,000 parked in a liquid fund and flexi FD. When an urgent hospital admission required a ₹80,000 deposit before insurance reimbursement, he paid immediately without borrowing.",
            takeaway: "Liquid reserves provide peace of mind and protect against high-interest medical debt."
        },
        appliedAction: {
            title: "Calculate Your 6-Month Emergency Target",
            actionText: "Multiply your monthly rent, groceries, insurance, and loan EMIs by 6 to determine your absolute safety target.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-5-1-1",
                question: "Where should your emergency fund be stored?",
                options: [
                    "Small-cap equity mutual funds for maximum growth",
                    "High-liquidity instruments like Flexi-FDs and Overnight/Liquid debt funds",
                    "Physical gold jewellery kept in a bank locker",
                    "Real estate agricultural land"
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: "l-5-2",
        pathId: "path-5",
        title: "Liquid Funds vs Fixed Deposits vs Sweep Accounts",
        summary: "Compare the top safe parking instruments for your emergency reserves based on yield, taxation, and liquidity.",
        duration: "6 min read",
        level: "Intermediate",
        xpReward: 60,
        objectives: [
            "Understand how Auto-Sweep Savings Accounts work with zero penalty.",
            "Evaluate Liquid Debt Mutual Funds vs Bank Fixed Deposits.",
            "Optimize for post-tax yields and instant T+0 / T+1 redemption."
        ],
        coreText: [
            "Auto-Sweep Fixed Deposits automatically convert balances above a threshold (e.g. ₹25,000) into short-term FDs earning 6.5%-7.0%, while instantly breaking the required amount when you swipe your debit card.",
            "Liquid Mutual Funds invest in ultra-short commercial paper and treasury bills with up to ₹50,000 instant ATM withdrawal facility per fund house.",
            "A balanced emergency fund splits 50% in a Flexi-FD and 50% in top-tier Liquid Mutual Funds for maximum security and flexibility."
        ],
        rupeeExample: {
            title: "Optimizing ₹3 Lakhs Emergency Corpus",
            scenario: "Sunita splits ₹3 Lakhs: ₹1.5 Lakhs in Auto-Sweep FD with her primary bank and ₹1.5 Lakhs in an ultra-low expense Liquid Debt Fund.",
            takeaway: "She earns ~6.8% annual returns (~₹20,400/yr) while retaining 24/7 instant liquidity."
        },
        appliedAction: {
            title: "Check Your Bank's Auto-Sweep Settings",
            actionText: "Log into net banking and verify if Auto-Sweep / Multi-Option Deposit facility is active on your primary account.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-5-2-1",
                question: "What is the primary benefit of an Auto-Sweep Savings Account?",
                options: [
                    "It automatically buys lottery tickets",
                    "It earns Fixed Deposit interest rates on idle surplus while maintaining liquid savings access",
                    "It eliminates all income taxes forever",
                    "It triples your salary automatically"
                ],
                correctAnswer: 1
            }
        ]
    },

    // PATH 6: Debt
    {
        id: "l-6-1",
        pathId: "path-6",
        title: "Debt-to-Income (DTI) Ratio & CIBIL Score Health",
        summary: "Understand how lenders evaluate your debt capacity and how to maintain a 780+ CIBIL score.",
        duration: "7 min read",
        level: "Intermediate",
        xpReward: 65,
        objectives: [
            "Calculate your Debt-to-Income (DTI) ratio.",
            "Keep total EMI commitments under 35% of gross monthly income.",
            "Master the 5 factors that dictate your CIBIL score (Payment history, credit utilization, tenure, credit mix, inquiries)."
        ],
        coreText: [
            "Your Debt-to-Income (DTI) ratio measures what percentage of your monthly income goes toward servicing debt (home loans, car loans, personal loans, credit card EMIs).",
            "A DTI below 30% is considered healthy. A DTI above 45% signals high financial vulnerability and will result in loan rejections or higher interest rates.",
            "To maintain a 780+ CIBIL score: pay 100% of your credit card bill on time, keep credit utilization below 30%, and avoid applying for multiple new credit cards within short windows."
        ],
        formula: {
            name: "Debt-to-Income (DTI) Ratio",
            expression: "DTI % = (Total Monthly Loan & EMI Payments / Gross Monthly Income) × 100",
            explanation: "Percentage of monthly earnings consumed by debt obligations. Recommended: ≤30%."
        },
        rupeeExample: {
            title: "Evaluating Loan Eligibility with DTI",
            scenario: "Amit earns ₹1,00,000/month. His current car loan EMI is ₹15,000 and personal loan EMI is ₹10,000 (Total EMIs = ₹25,000, DTI = 25%).",
            takeaway: "Because his DTI is 25%, banks happily approve his new home loan at their lowest competitive interest rate."
        },
        appliedAction: {
            title: "Calculate Your Current DTI Ratio",
            actionText: "Add up all your monthly EMIs, divide by your monthly earnings, and verify if your ratio is below 35%.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-6-1-1",
                question: "What is the recommended upper limit for a healthy Debt-to-Income (DTI) ratio?",
                options: ["10%", "30% - 35%", "70%", "90%"],
                correctAnswer: 1
            },
            {
                id: "q-6-1-2",
                question: "What is the ideal credit card utilization ratio to maintain an excellent CIBIL credit score?",
                options: ["Above 90%", "Between 60% and 80%", "Below 30% of your total credit limit", "Exactly 100% every month"],
                correctAnswer: 2
            }
        ]
    },
    {
        id: "l-6-2",
        pathId: "path-6",
        title: "Debt Avalanche vs Debt Snowball Payoff Strategies",
        summary: "Compare the mathematically optimal Debt Avalanche against the psychologically powerful Debt Snowball method.",
        duration: "8 min read",
        level: "Intermediate",
        xpReward: 70,
        objectives: [
            "Deploy the Debt Avalanche method (highest interest rate first) to minimize total interest paid.",
            "Deploy the Debt Snowball method (smallest balance first) for quick psychological momentum.",
            "Consolidate toxic 36%-42% credit card revolving balances into lower-cost instruments."
        ],
        coreText: [
            "Debt Avalanche: Rank all debts by interest rate. Pay minimums on all, and throw every extra rupee at the highest interest debt (e.g. 42% credit card balance). This saves the most money mathematically.",
            "Debt Snowball: Rank all debts by balance size. Pay minimums on all, and attack the smallest balance first (e.g. ₹15,000 store EMI). Eliminating accounts rapidly gives you emotional confidence.",
            "Never carry forward credit card balances or pay only the 'Minimum Due'. Credit cards charge 3.5% to 3.8% monthly (42% to 48% annual APR), which is the fastest path to compound debt traps."
        ],
        rupeeExample: {
            title: "Avalanche Saves ₹48,000 in Interest",
            scenario: "Pooja has: A) ₹50,000 Credit Card debt at 42% interest, B) ₹1,50,000 Personal Loan at 14% interest. By aggressively clearing Debt A first, she eliminates high compounding interest immediately.",
            takeaway: "Prioritizing high-interest debt saves tens of thousands in interest expense."
        },
        appliedAction: {
            title: "Rank Your Current Debts by APR",
            actionText: "List all outstanding loans and credit cards by interest rate to determine your next payoff target.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-6-2-1",
                question: "Which debt payoff strategy focuses on paying off the highest interest rate debt first?",
                options: ["Debt Snowball", "Debt Avalanche", "Debt Lottery", "Minimum Payment Forever"],
                correctAnswer: 1
            }
        ]
    },

    // PATH 7: Saving
    {
        id: "l-7-1",
        pathId: "path-7",
        title: "Target-Driven Savings: The 30% Savings Rate Blueprint",
        summary: "Learn how increasing your savings rate from 10% to 35% cuts your working career by 15 years.",
        duration: "6 min read",
        level: "Intermediate",
        xpReward: 60,
        objectives: [
            "Understand the direct mathematical connection between Savings Rate % and Years to Financial Freedom.",
            "Step up your savings rate by 2% each quarter.",
            "Direct 50% of annual salary increments straight to investment SIPs (The 50% Increment Rule)."
        ],
        coreText: [
            "Your savings rate is the single most important metric in personal finance—far more influential in early years than picking high-flying stocks.",
            "A person saving 10% of their income takes roughly 9 years of work to fund 1 year of retirement living. A person saving 35% takes only 1.8 years of work to fund 1 year of retirement.",
            "Whenever you get a salary hike or promotion, immediately commit 50% of the new increment to automated SIPs before upgrading your lifestyle."
        ],
        formula: {
            name: "Savings Rate Percentage",
            expression: "Savings Rate % = (Monthly Saved & Invested Amount / Total Monthly Net Income) × 100",
            explanation: "The percentage of net earnings converted into wealth-generating capital."
        },
        rupeeExample: {
            title: "The 50% Increment Rule in Practice",
            scenario: "Divya receives a ₹15,000/month salary hike. Instead of spending all ₹15,000, she steps up her Mutual Fund SIP by ₹7,500 and uses the remaining ₹7,500 for lifestyle improvements.",
            takeaway: "She avoids lifestyle creep while continuously expanding her investment momentum."
        },
        appliedAction: {
            title: "Calculate Your Current Savings Rate",
            actionText: "Divide your monthly SIP and savings transfers by your net salary to see if you meet the 20%-30% target.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-7-1-1",
                question: "What is the 50% Increment Rule?",
                options: [
                    "Borrowing 50% more money each year",
                    "Directing at least 50% of any new salary raise directly into investments before expanding lifestyle spend",
                    "Spending 50% of your salary on luxury holidays",
                    "Giving 50% of your earnings to charity"
                ],
                correctAnswer: 1
            }
        ]
    },

    // PATH 8: Investing
    {
        id: "l-8-1",
        pathId: "path-8",
        title: "Demystifying Mutual Funds: Index vs Active vs Debt",
        summary: "Understand the Indian mutual fund landscape and why low-cost broad index funds beat 80% of active funds.",
        duration: "8 min read",
        level: "Intermediate",
        xpReward: 75,
        objectives: [
            "Differentiate between Direct Plans and Regular Plans (saving 0.8%-1.2% in commissions annually).",
            "Understand Total Expense Ratio (TER) and tracking error.",
            "Construct a core-satellite mutual fund portfolio using Nifty 50 and Nifty Next 50 index funds."
        ],
        coreText: [
            "A Mutual Fund pools money from thousands of investors to buy a diversified basket of stocks or bonds managed by professional asset management companies (AMCs).",
            "Always choose Direct Plans over Regular Plans. Regular plans pay ongoing distributor commissions that can eat up to 20% to 25% of your total wealth over a 20-year horizon.",
            "Passive Index Funds (Nifty 50, Nifty Midcap 150) simply replicate the index with ultra-low expense ratios (0.1%-0.2%), consistently outperforming majority of actively managed funds after fees."
        ],
        rupeeExample: {
            title: "Direct vs Regular: The ₹22 Lakh Difference",
            scenario: "Two investors invest ₹10,000/month for 25 years at 12% return. Investor A picks Direct Plans (0.2% TER) and builds ~₹1.89 Crore. Investor B picks Regular Plans (1.4% TER) and builds ~₹1.67 Crore.",
            takeaway: "Direct plans generated ₹22 Lakhs of extra wealth for the exact same underlying portfolio."
        },
        appliedAction: {
            title: "Verify If Your Mutual Funds Are 'Direct'",
            actionText: "Open your investment portal or CAS statement and ensure all your scheme names contain the word 'Direct - Growth'.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-8-1-1",
                question: "Why are 'Direct Plans' of mutual funds superior for long-term investors?",
                options: [
                    "They have higher commission fees for distributors",
                    "They eliminate distributor commission, resulting in a lower expense ratio and higher compounding returns",
                    "They guarantee 100% tax exemption",
                    "They are only available to billionaires"
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: "l-8-2",
        pathId: "path-8",
        title: "The Power of Compounding & The Rule of 72",
        summary: "Master the mathematics of exponential wealth compounding and calculate how fast your money doubles.",
        duration: "7 min read",
        level: "Beginner",
        xpReward: 65,
        objectives: [
            "Understand the exponential nature of Compound Interest.",
            "Use the Rule of 72 to estimate money doubling times.",
            "Learn why starting to invest 5 years earlier can double your retirement corpus."
        ],
        coreText: [
            "Compound interest is interest earned on top of previously accumulated interest. In early years, growth feels linear, but after year 10, the compounding snowball accelerates dramatically.",
            "The Rule of 72 is a quick shortcut: divide 72 by your expected annual return percentage to find how many years it takes for your investment to double.",
            "For example, at 12% CAGR in an equity index, your investment doubles every 6 years (72 / 12 = 6). At 7% in a fixed deposit, it takes ~10.3 years (72 / 7 = 10.3)."
        ],
        formula: {
            name: "The Rule of 72",
            expression: "Years to Double ≈ 72 / Annual Interest Rate (%)",
            explanation: "A simple mathematical mental model to calculate investment doubling periods."
        },
        rupeeExample: {
            title: "Starting at Age 23 vs Age 30",
            scenario: "Ananya invests ₹10,000/month from age 23 to 33 (10 years, invested ₹12L) and stops. Raj starts at age 30 and invests ₹10,000/month until age 60 (30 years, invested ₹36L).",
            takeaway: "At age 60 (assuming 12% CAGR), Ananya's corpus reaches ~₹3.5 Crore while Raj reaches ~₹3.5 Crore despite Raj investing 3x more money, because Ananya gave compounding 7 extra years."
        },
        appliedAction: {
            title: "Calculate Your SIP Future Value",
            actionText: "Open the SIP Calculator tool in this Academy and project your wealth over a 15-year compounding horizon.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-8-2-1",
                question: "Using the Rule of 72, approximately how many years will it take for an investment to double at a 12% annual return?",
                options: ["2 Years", "6 Years", "12 Years", "24 Years"],
                correctAnswer: 1
            }
        ]
    },

    // PATH 9: Tax
    {
        id: "l-9-1",
        pathId: "path-9",
        title: "New vs Old Tax Regime: Indian Tax Masterclass",
        summary: "Evaluate which income tax regime saves you more money based on your salary and deductions.",
        duration: "8 min read",
        level: "Intermediate",
        xpReward: 70,
        objectives: [
            "Understand slab rates under the New Tax Regime (Section 115BAC).",
            "Calculate Old Regime deductions: Standard Deduction (₹75k), 80C (₹1.5L), 80D Health Insurance (₹25k-₹50k), HRA, and Home Loan 24(b).",
            "Find your personal breakeven deduction threshold."
        ],
        coreText: [
            "The New Tax Regime provides lower tax slabs with a ₹75,000 standard deduction and full tax rebate up to ₹7,75,000 taxable income, but disallows most exemptions.",
            "The Old Tax Regime allows claiming HRA, Section 80C (PPF, ELSS, EPF, Life Insurance up to ₹1.5 Lakhs), Section 80D (health insurance), and NPS 80CCD(1B) up to ₹50,000.",
            "Rule of thumb: If your total eligible deductions exceed ₹3.75 - ₹4.0 Lakhs, the Old Regime is often beneficial; otherwise, the New Regime provides lower tax and zero compliance hassle."
        ],
        rupeeExample: {
            title: "Comparing Tax Regimes at ₹12 Lakh Salary",
            scenario: "Kartik earns ₹12 Lakhs and has ₹1.5L in 80C and ₹2L in HRA. In the Old Regime, his taxable base reduces significantly. Saurav has zero rent or loans and pays significantly lower tax in the New Regime.",
            takeaway: "Calculate your exact deductions annually before submitting your tax declaration."
        },
        appliedAction: {
            title: "Check Your Eligible Tax Deductions",
            actionText: "List all your eligible investments in EPF, PPF, ELSS, Health Insurance, and HRA to determine your optimal tax regime.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-9-1-1",
                question: "Under the New Tax Regime, what is the standard deduction for salaried individuals?",
                options: ["₹25,000", "₹50,000", "₹75,000", "₹1,50,000"],
                correctAnswer: 2
            }
        ]
    },

    // PATH 10: Behavioral
    {
        id: "l-10-1",
        pathId: "path-10",
        title: "The 48-Hour Cooling Rule & Impulse Spending Hacks",
        summary: "De-escalate dopamine-driven impulse buys and regain cognitive control over discretionary wants.",
        duration: "6 min read",
        level: "Beginner",
        xpReward: 50,
        objectives: [
            "Understand the neurochemistry of dopamine shopping and flash sales.",
            "Execute the 48-Hour Rule for non-essential purchases over ₹2,000.",
            "Convert item prices into 'Hours of Your Life Worked' before tapping buy."
        ],
        coreText: [
            "Online shopping apps and flash sales are engineered to trigger sudden dopamine surges. When you feel an intense urge to purchase a non-essential gadget or outfit, your emotional brain overrides rational budgeting.",
            "The 48-Hour Cooling Rule states: whenever you want to buy a non-essential item exceeding ₹2,000, add it to a wishlist and wait a full 48 hours before purchasing.",
            "In over 70% of cases, the dopamine spike fades after 48 hours, and you realize you never actually needed the item."
        ],
        formula: {
            name: "Price in Hours of Life",
            expression: "Hours Worked = Item Price / Your Hourly Take-Home Wage",
            explanation: "Calculate how many hours of your life you must trade to buy an object."
        },
        rupeeExample: {
            title: "The ₹12,000 Smartwatch Reality Check",
            scenario: "Manish earns ₹60,000/month (~₹350/hour). He wanted to buy a ₹12,000 smartwatch on impulse. Calculating ₹12,000 / ₹350 = 34 hours of hard labor made him realize it wasn't worth a full week of work.",
            takeaway: "Translating prices into working hours instantly dissolves impulse purchases."
        },
        appliedAction: {
            title: "Add 1 Impulse Desire to the 48-Hour Cooling List",
            actionText: "Use the 48-Hour Cooling Tool in this Academy to park one item you want to buy before committing money.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-10-1-1",
                question: "How does the 48-Hour Cooling Rule help curb impulse spending?",
                options: [
                    "It freezes your bank account for 48 hours",
                    "It allows the initial dopamine rush to subside so you can evaluate the purchase rationally",
                    "It increases product prices after 2 days",
                    "It forces delivery agents to wait 48 hours"
                ],
                correctAnswer: 1
            }
        ]
    },

    // PATH 11: Wealth & FIRE
    {
        id: "l-11-1",
        pathId: "path-11",
        title: "The FIRE Framework: Financial Independence, Retire Early",
        summary: "Calculate your Financial Independence number using the 25x / 30x annual expense rule.",
        duration: "8 min read",
        level: "Advanced",
        xpReward: 80,
        objectives: [
            "Understand the FIRE movement (Lean FIRE, Fat FIRE, Coast FIRE).",
            "Calculate your Target FIRE Corpus using the 25x - 33x annual expense rule.",
            "Understand Safe Withdrawal Rates (3% to 4% SWR)."
        ],
        coreText: [
            "Financial Independence means your investments generate sufficient passive income to cover 100% of your living expenses indefinitely without mandatory work.",
            "The classic 25x Rule states: if your annual living expenses are ₹6 Lakhs, a diversified compounding corpus of ₹1.5 Crore (25 × ₹6L) allows you to safely withdraw 4% annually without depleting your capital.",
            "In higher inflation emerging economies like India, a 30x to 33x multiplier (3.0% to 3.3% SWR) is recommended for multi-decade retirement sustainability."
        ],
        formula: {
            name: "FIRE Target Corpus",
            expression: "FIRE Number = Annual Living Expenses × 30",
            explanation: "The target investment portfolio size required for lifelong financial independence."
        },
        rupeeExample: {
            title: "Calculating a ₹8 Lakh Annual Expense FIRE Target",
            scenario: "Arjun and Shilpa spend ₹8,00,000 per year on living expenses. Their target 30x FIRE corpus is ₹2.4 Crore (30 × ₹8,00,000).",
            takeaway: "Once they cross ₹2.4 Crore in compounding assets, work becomes an optional choice rather than a survival necessity."
        },
        appliedAction: {
            title: "Calculate Your Target FIRE Number",
            actionText: "Multiply your current annual expenses by 30 to see your lifetime Financial Independence target.",
            xpReward: 25
        },
        quizzes: [
            {
                id: "q-11-1-1",
                question: "If your household expenses are ₹10 Lakhs per year, what is your 30x FIRE corpus target?",
                options: ["₹1 Crore", "₹2.5 Crore", "₹3.0 Crore", "₹10 Crore"],
                correctAnswer: 2
            }
        ]
    }
];

// ---------------------------------------------------------------------------
// 12 Essential Glossary Terms
// ---------------------------------------------------------------------------
export const GLOSSARY_TERMS: GlossaryTerm[] = [
    {
        id: "g-1",
        term: "CAGR (Compound Annual Growth Rate)",
        category: "Investing",
        definition: "The annualized rate of return that represents the smooth geometric progression of an investment over multiple years.",
        rupeeExample: "An investment growing from ₹1 Lakh to ₹2 Lakh over 6 years delivered a CAGR of ~12.2%."
    },
    {
        id: "g-2",
        term: "SIP (Systematic Investment Plan)",
        category: "Investing",
        definition: "A method of investing a fixed sum of money at regular monthly intervals into mutual funds, enabling rupee-cost averaging.",
        rupeeExample: "Investing ₹5,000 on the 5th of every month into an index fund."
    },
    {
        id: "g-3",
        term: "CIBIL Score",
        category: "Credit & Debt",
        definition: "A 3-digit numeric summary (ranging from 300 to 900) of your credit history and repayment reliability in India.",
        rupeeExample: "A score above 750 unlocks lower home loan interest rates and fast approvals."
    },
    {
        id: "g-4",
        term: "Expense Ratio (TER)",
        category: "Mutual Funds",
        definition: "The annual percentage fee charged by an AMC to manage a mutual fund scheme.",
        rupeeExample: "A Direct Index fund with 0.1% TER charges ₹10 on a ₹10,000 investment per year."
    },
    {
        id: "g-5",
        term: "DTI (Debt-to-Income Ratio)",
        category: "Debt",
        definition: "The percentage of gross monthly income consumed by loan EMIs and debt servicing.",
        rupeeExample: "Paying ₹20,000 in EMIs out of ₹80,000 income gives a DTI of 25%."
    },
    {
        id: "g-6",
        term: "Emergency Runway",
        category: "Liquidity",
        definition: "The number of months you can sustain mandatory living expenses using liquid reserves without any incoming salary.",
        rupeeExample: "₹3 Lakhs in savings with ₹50,000 monthly burn rate = 6 months of runway."
    },
    {
        id: "g-7",
        term: "Section 80C",
        category: "Tax",
        definition: "Income Tax deduction allowing up to ₹1.5 Lakhs reduction in taxable income for EPF, PPF, ELSS, and Life Insurance under Old Tax Regime.",
        rupeeExample: "Investing ₹1.5 Lakhs in ELSS saves up to ₹46,800 in the 30% tax bracket."
    },
    {
        id: "g-8",
        term: "Safe Withdrawal Rate (SWR)",
        category: "Wealth & FIRE",
        definition: "The percentage of retirement corpus that can be withdrawn each year without running out of money over a 30+ year horizon.",
        rupeeExample: "Withdrawing ₹3.5 Lakhs annually from a ₹1 Crore corpus represents a 3.5% SWR."
    },
    {
        id: "g-9",
        term: "Zero-Based Budget",
        category: "Budgeting",
        definition: "A budgeting method where Income minus all allocated expenses, investments, and savings equals zero.",
        rupeeExample: "Every single rupee of ₹70,000 salary is assigned before the month starts."
    },
    {
        id: "g-10",
        term: "Auto-Sweep Account",
        category: "Banking",
        definition: "A bank facility that automatically shifts savings balance above a threshold into high-yield Fixed Deposits while preserving instant liquidity.",
        rupeeExample: "Earning 6.8% FD rates on balances over ₹25,000 without penalty."
    },
    {
        id: "g-11",
        term: "Rupee-Cost Averaging",
        category: "Investing",
        definition: "Investing fixed sums regardless of market highs and lows, purchasing more units when prices fall and fewer when prices rise.",
        rupeeExample: "Buying index units automatically during market dips via regular monthly SIP."
    },
    {
        id: "g-12",
        term: "Discretionary Spending (Wants)",
        category: "Budgeting",
        definition: "Non-essential lifestyle expenditures like dining out, luxury shopping, and vacations that can be reduced in times of financial stress.",
        rupeeExample: "Spending on weekend food delivery and OTT platforms."
    }
];

// ---------------------------------------------------------------------------
// 8 Core Financial Formulas
// ---------------------------------------------------------------------------
export const FINANCIAL_FORMULAS: FinancialFormula[] = [
    {
        id: "f-1",
        name: "Compound Interest Formula",
        expression: "A = P(1 + r/n)^(nt)",
        explanation: "Calculates the future value of an initial principal compounding over time at a given interest rate.",
        example: "₹1,00,000 invested at 12% for 10 years compounded annually grows to ₹3,10,584."
    },
    {
        id: "f-2",
        name: "The Rule of 72",
        expression: "Years to Double ≈ 72 / Annual Interest Rate (%)",
        explanation: "Quick estimation of the time required for an investment to double in value.",
        example: "At 12% CAGR, money doubles in 72 / 12 = 6 years."
    },
    {
        id: "f-3",
        name: "50/30/20 Budgeting Rule",
        expression: "Needs (≤50%) + Wants (≤30%) + Savings (≥20%) = 100% Income",
        explanation: "Target proportional allocation of monthly post-tax take-home pay.",
        example: "₹60,000 salary = ₹30k Needs, ₹18k Wants, ₹12k Savings."
    },
    {
        id: "f-4",
        name: "Debt-to-Income (DTI) Ratio",
        expression: "DTI % = (Total Monthly EMIs / Gross Monthly Income) × 100",
        explanation: "Proportion of income consumed by debt obligations (Target: ≤35%).",
        example: "₹18,000 EMIs on ₹60,000 income = 30% DTI (Healthy)."
    },
    {
        id: "f-5",
        name: "Emergency Runway (Months)",
        expression: "Runway = Total Liquid Reserves / Monthly Essential Outflows",
        explanation: "Number of months of living expenses covered without active income.",
        example: "₹2,40,000 savings / ₹40,000 monthly burn = 6 Months Runway."
    },
    {
        id: "f-6",
        name: "Real Rate of Return",
        expression: "Real Return % ≈ Nominal Return % - Inflation Rate %",
        explanation: "Net purchasing power growth after accounting for inflation.",
        example: "7% Fixed Deposit - 5.5% Inflation = 1.5% Real Return."
    },
    {
        id: "f-7",
        name: "FIRE Target Corpus (30x Rule)",
        expression: "FIRE Corpus = Annual Living Expenses × 30",
        explanation: "Target investment portfolio size for perpetual financial independence.",
        example: "₹6 Lakhs annual expenses × 30 = ₹1.8 Crore FIRE Target."
    },
    {
        id: "f-8",
        name: "Savings Rate Percentage",
        expression: "Savings Rate % = (Monthly Savings & Investments / Net Income) × 100",
        explanation: "Percentage of take-home pay retained for wealth building.",
        example: "₹18,000 saved on ₹60,000 salary = 30% Savings Rate."
    }
];

// ---------------------------------------------------------------------------
// 4 Actionable Weekly Challenges
// ---------------------------------------------------------------------------
export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
    {
        id: "wc-1",
        title: "The 48-Hour Zero-Impulse Weekend",
        description: "Postpone all non-essential discretionary purchases for 48 hours. Add them to your cooling wishlist instead of instant checkout.",
        xpReward: 50
    },
    {
        id: "wc-2",
        title: "Zombie Subscription Hunt",
        description: "Review your banking transactions and credit card statements. Identify and cancel at least one unused auto-debit subscription.",
        xpReward: 50
    },
    {
        id: "wc-3",
        title: "Bank Statement Health Sync",
        description: "Import this month's bank statement into FinMitra to evaluate your automated health score and personalized recommendations.",
        xpReward: 75
    },
    {
        id: "wc-4",
        title: "SIP Step-Up Alignment",
        description: "Increase one of your active mutual fund SIPs by at least ₹500 or 5% to accelerate compounding velocity.",
        xpReward: 75
    }
];
