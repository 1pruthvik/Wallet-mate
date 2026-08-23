import React from "react";
import { Link } from "react-router-dom";

interface FinancialHealthCardProps {
    score?: number;
    grade?: string;
    verdict?: string;
}

const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({
    score = 78,
    grade,
    verdict,
}) => {
    const roundedScore = Math.min(100, Math.max(0, Math.round(score)));

    let message = verdict || "Your financial health is looking good.";

    if (!verdict) {
        if (roundedScore < 40) {
            message = "Your financial health needs attention. Outflow is high.";
        } else if (roundedScore < 70) {
            message = "Your financial health is stable. Keep growing your savings.";
        } else if (roundedScore < 85) {
            message = "Your financial health is looking good. Strong cashflow control.";
        } else {
            message = "Excellent financial stamina and savings rate!";
        }
    }

    const deg = Math.round((roundedScore / 100) * 360);
    const gradient = `conic-gradient(#278c65 0deg ${deg}deg, #dfece6 ${deg}deg 360deg)`;

    return (
        <div className="financial-health-card">
            <div>
                <p>Financial Health {grade ? `• ${grade}` : ""}</p>
                <h2>{roundedScore}/100</h2>
                <span>{message}</span>
                <Link to="/financial-health" className="health-card-link">
                    View Full Diagnostics →
                </Link>
            </div>

            <div className="health-score-circle" style={{ background: gradient }}>
                <span>{roundedScore}</span>
            </div>
        </div>
    );
};

export default FinancialHealthCard;