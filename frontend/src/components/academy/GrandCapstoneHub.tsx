import React from "react";
import {
    Award,
    Sparkles,
    Lock
} from "lucide-react";
import { type UserGrandCapstoneState } from "../../hooks/useEarningsAcademy";

interface GrandCapstoneHubProps {
    totalCertified: number;
    capstoneState: UserGrandCapstoneState;
    onStartCapstoneExam: () => void;
}

export const GrandCapstoneHub: React.FC<GrandCapstoneHubProps> = ({
    totalCertified,
    capstoneState,
    onStartCapstoneExam
}) => {
    const isUnlocked = totalCertified >= 50 || capstoneState.unlocked;
    const isPassed = capstoneState.passed;

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 0" }}>
            <div style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
                color: "#ffffff",
                borderRadius: "24px",
                padding: "40px",
                border: "2px solid rgba(99, 102, 241, 0.4)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{
                    width: "88px",
                    height: "88px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #f59e0b 0%, #d97706 100%)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px auto",
                    boxShadow: "0 10px 25px rgba(217, 119, 6, 0.4)"
                }}>
                    <Award size={46} />
                </div>

                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                    Highest Academic Credential
                </span>

                <h1 style={{ margin: "8px 0 12px 0", fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
                    Master of Financial Earnings (MFE)
                </h1>

                <p style={{ margin: "0 auto 28px auto", fontSize: "0.95rem", color: "#cbd5e1", maxWidth: "600px", lineHeight: "1.55" }}>
                    The definitive capstone certification validating mastery across all 10 financial pathways: Income Foundations, Personal Profit, Pricing, Business Operations, Capital Yield, and Long-Term Wealth Architecture.
                </p>

                {/* Progress Requirements Box */}
                <div style={{ background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "16px", padding: "20px", marginBottom: "32px", textAlign: "left" }}>
                    <h4 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>
                        MFE Graduation Prerequisites
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>1. Complete and certify all 50 courses:</span>
                            <strong style={{ color: totalCertified >= 50 ? "#10b981" : "#f59e0b" }}>
                                {totalCertified} / 50 Completed {totalCertified >= 50 && "✓"}
                            </strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>2. Earn all 10 Pathway Diplomas:</span>
                            <strong style={{ color: totalCertified >= 50 ? "#10b981" : "#f59e0b" }}>
                                {Math.floor(totalCertified / 5)} / 10 Diplomas
                            </strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>3. Pass Comprehensive 100-Q Grand Capstone Exam (Pass: 80%):</span>
                            <strong style={{ color: isPassed ? "#10b981" : "#cbd5e1" }}>
                                {isPassed ? `Passed (${capstoneState.score}%) ✓` : "Pending"}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* Action CTA */}
                {isPassed ? (
                    <div style={{ background: "rgba(16, 185, 129, 0.2)", border: "1px solid #10b981", borderRadius: "14px", padding: "18px" }}>
                        <h3 style={{ margin: "0 0 6px 0", fontSize: "1.2rem", fontWeight: 800, color: "#10b981" }}>
                            🎉 MFE Credential Conferred!
                        </h3>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#ffffff" }}>
                            Certificate ID: <strong>{capstoneState.certificateId}</strong> • Diamond Tier Conferred
                        </p>
                    </div>
                ) : !isUnlocked ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.08)", padding: "12px 24px", borderRadius: "12px", color: "#94a3b8", fontSize: "0.9rem", fontWeight: 700 }}>
                        <Lock size={18} /> Complete all 50 courses to unlock the MFE Grand Capstone Exam
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onStartCapstoneExam}
                        className="wm-btn-primary"
                        style={{ padding: "14px 36px", fontSize: "1.05rem", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 8px 25px rgba(217, 119, 6, 0.4)" }}
                    >
                        <Sparkles size={20} /> Launch MFE 100-Question Grand Capstone Exam
                    </button>
                )}
            </div>
        </div>
    );
};
