import React from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight } from "lucide-react";

interface FinancialHealthCardProps {
    score?: number;
    grade?: string;
    verdict?: string;
}

const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({
    score = 0,
    grade,
    verdict,
}) => {
    const roundedScore = Math.min(100, Math.max(0, Math.round(score)));

    let message = verdict;
    if (!message) {
        if (roundedScore === 0) {
            message = "No transactions recorded yet. Import your bank statement to calculate your score.";
        } else if (roundedScore < 40) {
            message = "Your financial health needs attention. Monthly outflow is high relative to income.";
        } else if (roundedScore < 70) {
            message = "Your financial health is stable. Maintain steady cashflow and build your savings buffer.";
        } else if (roundedScore < 85) {
            message = "Your financial health is strong with disciplined spending and good savings.";
        } else {
            message = "Excellent financial stamina and optimal asset accumulation!";
        }
    }

    const deg = Math.round((roundedScore / 100) * 360);
    const ringColor = roundedScore >= 75 ? "#10b981" : roundedScore >= 45 ? "#635bff" : roundedScore > 0 ? "#f59e0b" : "#94a3b8";
    const gradient = `conic-gradient(${ringColor} 0deg ${deg}deg, #f1f5f9 ${deg}deg 360deg)`;

    return (
        <div className="wm-health-widget">
            <div className="wm-health-widget-content">
                <div className="wm-health-widget-badge">
                    <Activity size={14} />
                    <span>Financial Health {grade ? `• ${grade}` : ""}</span>
                </div>
                <div className="wm-health-widget-score">
                    <span className="wm-health-number">{roundedScore}</span>
                    <span className="wm-health-total">/100</span>
                </div>
                <p className="wm-health-widget-desc">{message}</p>
                <Link to="/financial-health" className="wm-health-widget-link">
                    <span>View Health Diagnostics</span>
                    <ArrowRight size={14} />
                </Link>
            </div>

            <div className="wm-health-gauge" style={{ background: gradient }}>
                <div className="wm-health-gauge-inner">
                    <span className="wm-health-gauge-val">{roundedScore}</span>
                    <span className="wm-health-gauge-label">PTS</span>
                </div>
            </div>
        </div>
    );
};

export default FinancialHealthCard;