import type { Transaction } from "../api/transactions";

export interface HealthPillar {
    id: string;
    title: string;
    score: number;
    maxScore: number;
    percentage: number;
    status: "excellent" | "good" | "moderate" | "warning";
    description: string;
}

export interface HealthInsight {
    type: "positive" | "warning" | "neutral";
    title: string;
    message: string;
}

export interface HealthRecommendation {
    id: string;
    title: string;
    impact: string;
    difficulty: "Easy" | "Medium" | "High";
    category: string;
    action: string;
}

export interface FinancialHealthReport {
    score: number;
    grade: "Excellent" | "Good" | "Fair" | "Critical";
    verdict: string;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    savingsRate: number;
    discretionarySpend: number;
    essentialSpend: number;
    pillars: HealthPillar[];
    insights: HealthInsight[];
    recommendations: HealthRecommendation[];
}

export const calculateFinancialHealth = (
    transactions: Transaction[] = []
): FinancialHealthReport => {
    if (!transactions || transactions.length === 0) {
        return {
            score: 50,
            grade: "Fair",
            verdict: "Add your income and expenses to unlock your personalized Financial Health diagnostics.",
            monthlyIncome: 0,
            monthlyExpenses: 0,
            monthlySavings: 0,
            savingsRate: 0,
            discretionarySpend: 0,
            essentialSpend: 0,
            pillars: [
                {
                    id: "savings",
                    title: "Savings & Accumulation",
                    score: 15,
                    maxScore: 35,
                    percentage: 43,
                    status: "moderate",
                    description: "Track your monthly surplus to build an emergency fund.",
                },
                {
                    id: "discipline",
                    title: "Expense Control",
                    score: 15,
                    maxScore: 30,
                    percentage: 50,
                    status: "moderate",
                    description: "Keep essential living costs within reasonable boundaries.",
                },
                {
                    id: "balance",
                    title: "Spending Balance",
                    score: 10,
                    maxScore: 20,
                    percentage: 50,
                    status: "moderate",
                    description: "Maintain a healthy balance between essentials and lifestyle.",
                },
                {
                    id: "runway",
                    title: "Cashflow Buffer",
                    score: 10,
                    maxScore: 15,
                    percentage: 67,
                    status: "good",
                    description: "Ensures financial resilience against unexpected costs.",
                },
            ],
            insights: [
                {
                    type: "neutral",
                    title: "Awaiting Data",
                    message: "Import bank statements or add transactions to generate your real-time health score.",
                },
            ],
            recommendations: [
                {
                    id: "rec-1",
                    title: "Import Bank Statement",
                    impact: "+20 Health Pts",
                    difficulty: "Easy",
                    category: "Setup",
                    action: "Upload your latest statement PDF to automatically analyze your cashflow.",
                },
            ],
        };
    }

    // Filter current or recent month transactions, or all if dataset is small
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTxns = transactions.filter((t) => {
        const d = new Date(t.date);
        if (Number.isNaN(d.getTime())) return true;
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const activeSet = monthlyTxns.length >= 3 ? monthlyTxns : transactions;

    const monthlyIncome = activeSet
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const monthlyExpenses = activeSet
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    activeSet
        .filter((t) => t.type === "expense")
        .forEach((t) => {
            const cat = t.category || "Other";
            categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount || 0);
        });

    const discretionaryCats = ["Shopping", "Entertainment", "Other"];
    const essentialCats = ["Food", "Bills", "Transport", "Rent", "Health"];

    const discretionarySpend = Object.entries(categoryTotals)
        .filter(([cat]) => discretionaryCats.includes(cat))
        .reduce((sum, [, amt]) => sum + amt, 0);

    const essentialSpend = Object.entries(categoryTotals)
        .filter(([cat]) => essentialCats.includes(cat))
        .reduce((sum, [, amt]) => sum + amt, 0);

    // 1. Savings Score (Max 35)
    let savingsScore = 0;
    if (savingsRate >= 50) savingsScore = 35;
    else if (savingsRate >= 35) savingsScore = 30;
    else if (savingsRate >= 20) savingsScore = 24;
    else if (savingsRate >= 10) savingsScore = 16;
    else if (savingsRate > 0) savingsScore = 8;
    else savingsScore = 0;

    // 2. Expense Discipline (Max 30)
    let disciplineScore = 0;
    const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 100;
    if (expenseRatio <= 40) disciplineScore = 30;
    else if (expenseRatio <= 60) disciplineScore = 25;
    else if (expenseRatio <= 75) disciplineScore = 18;
    else if (expenseRatio <= 90) disciplineScore = 10;
    else if (expenseRatio <= 100) disciplineScore = 5;
    else disciplineScore = 0;

    // 3. Category Balance (Max 20)
    let balanceScore = 0;
    const discRatio = monthlyExpenses > 0 ? (discretionarySpend / monthlyExpenses) * 100 : 0;
    if (discRatio <= 25) balanceScore = 20;
    else if (discRatio <= 40) balanceScore = 16;
    else if (discRatio <= 55) balanceScore = 11;
    else if (discRatio <= 70) balanceScore = 6;
    else balanceScore = 2;

    // 4. Cashflow Buffer (Max 15)
    let bufferScore = 0;
    if (monthlySavings > 0) {
        if (monthlySavings >= monthlyExpenses * 1.5) bufferScore = 15;
        else if (monthlySavings >= monthlyExpenses * 0.5) bufferScore = 12;
        else bufferScore = 8;
    } else {
        bufferScore = 2;
    }

    const totalScore = Math.min(100, Math.max(0, Math.round(savingsScore + disciplineScore + balanceScore + bufferScore)));

    let grade: "Excellent" | "Good" | "Fair" | "Critical" = "Fair";
    let verdict = "Your financial health is stable but has clear optimization opportunities.";

    if (totalScore >= 85) {
        grade = "Excellent";
        verdict = "Outstanding financial health! Your high savings rate and controlled burn rate provide excellent freedom.";
    } else if (totalScore >= 70) {
        grade = "Good";
        verdict = "Strong financial health. Your spending is controlled and you are consistently generating surplus cashflow.";
    } else if (totalScore >= 45) {
        grade = "Fair";
        verdict = "Moderate financial health. Lowering discretionary expenses can significantly accelerate your savings growth.";
    } else {
        grade = "Critical";
        verdict = "Your finances need prompt attention. Expenses are matching or outpacing income.";
    }

    // Dynamic Insights & Checklist
    const insights: HealthInsight[] = [];

    if (savingsRate >= 25) {
        insights.push({
            type: "positive",
            title: "Strong Savings Velocity",
            message: `You are saving ${savingsRate}% of your total earnings, well above the recommended 20% benchmark.`,
        });
    } else if (savingsRate > 0) {
        insights.push({
            type: "warning",
            title: "Moderate Savings Cushion",
            message: `Your current savings rate is ${savingsRate}%. Targeting 20%+ will build your emergency reserve faster.`,
        });
    } else {
        insights.push({
            type: "warning",
            title: "Zero Net Savings This Month",
            message: "Monthly outflow exceeds or matches income. Consider capping discretionary shopping.",
        });
    }

    if (essentialSpend <= monthlyIncome * 0.5 && monthlyIncome > 0) {
        insights.push({
            type: "positive",
            title: "Essential Expenses in Control",
            message: "Essential living costs (Food, Bills, Transport) are comfortably under 50% of your income.",
        });
    }

    if (categoryTotals["Shopping"] && categoryTotals["Shopping"] > monthlyExpenses * 0.35) {
        insights.push({
            type: "warning",
            title: "High Shopping Concentration",
            message: `Shopping accounts for ₹${categoryTotals["Shopping"].toLocaleString("en-IN")} (${Math.round((categoryTotals["Shopping"] / monthlyExpenses) * 100)}% of expenses).`,
        });
    }

    if (categoryTotals["Food"] && categoryTotals["Food"] > monthlyExpenses * 0.4) {
        insights.push({
            type: "warning",
            title: "Food & Dining Surge",
            message: `Food & dining makes up ${Math.round((categoryTotals["Food"] / monthlyExpenses) * 100)}% of total monthly outflow.`,
        });
    }

    if (monthlySavings > 0) {
        insights.push({
            type: "positive",
            title: "Positive Cashflow Buffer",
            message: `You accumulated ₹${monthlySavings.toLocaleString("en-IN")} in surplus cashflow this period.`,
        });
    }

    // Recommendations
    const recommendations: HealthRecommendation[] = [];

    if (savingsRate < 35) {
        recommendations.push({
            id: "rec-savings",
            title: "Automate 10% Extra Savings",
            impact: "+12 Health Pts",
            difficulty: "Easy",
            category: "Savings",
            action: `Move ₹${Math.round(monthlyIncome * 0.1).toLocaleString("en-IN")} directly into a high-yield emergency reserve on payday.`,
        });
    }

    if (discretionarySpend > monthlyExpenses * 0.3) {
        recommendations.push({
            id: "rec-disc",
            title: "Optimize Discretionary Shopping",
            impact: "+8 Health Pts",
            difficulty: "Medium",
            category: "Budgeting",
            action: "Apply a 48-hour cooling-off rule on non-essential purchases above ₹2,000.",
        });
    }

    recommendations.push({
        id: "rec-emergency",
        title: "Build 3-Month Safety Net",
        impact: "+15 Financial Resilience",
        difficulty: "Medium",
        category: "Protection",
        action: `Target an emergency reserve of ₹${Math.round(monthlyExpenses * 3).toLocaleString("en-IN")} (3 months of current baseline expenses).`,
    });

    const pillars: HealthPillar[] = [
        {
            id: "savings",
            title: "Savings & Accumulation",
            score: savingsScore,
            maxScore: 35,
            percentage: Math.round((savingsScore / 35) * 100),
            status: savingsScore >= 28 ? "excellent" : savingsScore >= 20 ? "good" : savingsScore >= 12 ? "moderate" : "warning",
            description: `${savingsRate}% of monthly income retained as surplus.`,
        },
        {
            id: "discipline",
            title: "Expense Control",
            score: disciplineScore,
            maxScore: 30,
            percentage: Math.round((disciplineScore / 30) * 100),
            status: disciplineScore >= 24 ? "excellent" : disciplineScore >= 18 ? "good" : disciplineScore >= 10 ? "moderate" : "warning",
            description: `Spending represents ${Math.round(expenseRatio)}% of incoming cashflow.`,
        },
        {
            id: "balance",
            title: "Spending Balance",
            score: balanceScore,
            maxScore: 20,
            percentage: Math.round((balanceScore / 20) * 100),
            status: balanceScore >= 16 ? "excellent" : balanceScore >= 11 ? "good" : balanceScore >= 6 ? "moderate" : "warning",
            description: `Discretionary purchases at ${Math.round(discRatio)}% of total expenses.`,
        },
        {
            id: "runway",
            title: "Cashflow Buffer",
            score: bufferScore,
            maxScore: 15,
            percentage: Math.round((bufferScore / 15) * 100),
            status: bufferScore >= 12 ? "excellent" : bufferScore >= 8 ? "good" : "moderate",
            description: monthlySavings > 0 ? "Positive operating surplus maintained." : "Operating deficit detected.",
        },
    ];

    return {
        score: totalScore,
        grade,
        verdict,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        savingsRate,
        discretionarySpend,
        essentialSpend,
        pillars,
        insights,
        recommendations,
    };
};
