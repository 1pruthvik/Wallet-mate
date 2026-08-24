import { LAUNCH_LESSONS, type LessonContent } from "../data/academyContent";
import { type FinancialHealthEngineReport } from "../utils/financialHealth";

export interface PersonalizedRecommendation {
    lesson: LessonContent;
    reasonTitle: string;
    reasonDetail: string;
    pillarId: string;
    priority: number;
}

export const getAcademyRecommendations = (
    healthReport?: FinancialHealthEngineReport
): PersonalizedRecommendation[] => {
    const recommendations: PersonalizedRecommendation[] = [];

    if (!healthReport || healthReport.activeTransactionCount === 0) {
        const defaultLesson = LAUNCH_LESSONS.find(l => l.id === "l-1-1") || LAUNCH_LESSONS[0];
        return [{
            lesson: defaultLesson,
            reasonTitle: "Start Your Financial Foundations",
            reasonDetail: "Import your bank statement to unlock recommendations tailored to your actual money patterns.",
            pillarId: "savings",
            priority: 1
        }];
    }

    // Rule 1: High Discretionary Spending / Weak Balance
    if (healthReport.actualVsTarget.wants.actualPct > 30 || healthReport.discretionarySpend > healthReport.monthlyExpenses * 0.35) {
        const lesson = LAUNCH_LESSONS.find(l => l.id === "l-10-1") || LAUNCH_LESSONS.find(l => l.id === "l-1-3");
        if (lesson) {
            recommendations.push({
                lesson,
                reasonTitle: "Because your Discretionary Wants are above 30%",
                reasonDetail: `Discretionary lifestyle spending is at ${healthReport.actualVsTarget.wants.actualPct}% of income (Recommended: ≤30%).`,
                pillarId: "spending_balance",
                priority: 1
            });
        }
    }

    // Rule 2: Low Savings Rate
    if (healthReport.savingsRate < 20) {
        const lesson = LAUNCH_LESSONS.find(l => l.id === "l-3-3") || LAUNCH_LESSONS.find(l => l.id === "l-7-1");
        if (lesson) {
            recommendations.push({
                lesson,
                reasonTitle: "Because your Savings Rate is below target",
                reasonDetail: `Your current savings rate is ${healthReport.savingsRate}% (Target: ≥20%). Learn Pay Yourself First payday automation.`,
                pillarId: "savings",
                priority: 2
            });
        }
    }

    // Rule 3: Weak Emergency Buffer / Runway
    if (healthReport.runwayMonths < 3) {
        const lesson = LAUNCH_LESSONS.find(l => l.id === "l-5-1") || LAUNCH_LESSONS.find(l => l.id === "l-5-2");
        if (lesson) {
            recommendations.push({
                lesson,
                reasonTitle: "Because your Emergency Runway needs strengthening",
                reasonDetail: `Current liquid runway covers ${healthReport.runwayMonths} months (Recommended: 3 to 6 months safety net).`,
                pillarId: "liquidity",
                priority: 3
            });
        }
    }

    // Rule 4: High Recurring Payments / Subscriptions
    if (healthReport.transactionIntelligence.recurring.length >= 2) {
        const lesson = LAUNCH_LESSONS.find(l => l.id === "l-4-2");
        if (lesson) {
            recommendations.push({
                lesson,
                reasonTitle: "Because recurring subscriptions were detected",
                reasonDetail: `We detected ${healthReport.transactionIntelligence.recurring.length} recurring merchants. Audit subscription creep to free up surplus.`,
                pillarId: "spending_balance",
                priority: 4
            });
        }
    }

    // Rule 5: Debt / EMI Burden
    if (healthReport.resilience.debtBurdenPct > 20) {
        const lesson = LAUNCH_LESSONS.find(l => l.id === "l-6-1") || LAUNCH_LESSONS.find(l => l.id === "l-6-2");
        if (lesson) {
            recommendations.push({
                lesson,
                reasonTitle: "Because loan EMIs take over 20% of income",
                reasonDetail: `Debt service represents ${healthReport.resilience.debtBurdenPct}% of your earnings. Learn DTI limits and Debt Avalanche payoff.`,
                pillarId: "debt",
                priority: 5
            });
        }
    }

    // Fallback if no specific rule triggered
    if (recommendations.length === 0) {
        const lesson = LAUNCH_LESSONS.find(l => l.id === "l-8-2") || LAUNCH_LESSONS[0];
        recommendations.push({
            lesson,
            reasonTitle: "Recommended Next Step in Wealth Compounding",
            reasonDetail: "Your cashflow foundation is solid! Master Compound Interest and the Rule of 72.",
            pillarId: "goal_alignment",
            priority: 10
        });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
};
