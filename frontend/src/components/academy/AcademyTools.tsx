import React, { useState } from "react";
import { Calculator } from "lucide-react";

export const AcademyToolsSuite: React.FC<{ userMonthlyIncome?: number; userMonthlyExpenses?: number }> = ({
    userMonthlyIncome = 60000,
    userMonthlyExpenses = 42000
}) => {
    const [activeTool, setActiveTool] = useState<string>("503020");

    // 1. 50/30/20 Calculator State
    const [income503020, setIncome503020] = useState<number>(userMonthlyIncome);
    const needsTarget = Math.round(income503020 * 0.50);
    const wantsTarget = Math.round(income503020 * 0.30);
    const savingsTarget = Math.round(income503020 * 0.20);

    // 2. Emergency Fund State
    const [monthlyEssentials, setMonthlyEssentials] = useState<number>(Math.round(userMonthlyExpenses * 0.65));
    const [targetMonths, setTargetMonths] = useState<number>(3);
    const emergencyTotal = monthlyEssentials * targetMonths;

    // 3. SIP Calculator State
    const [monthlySIP, setMonthlySIP] = useState<number>(5000);
    const [investmentYears, setInvestmentYears] = useState<number>(10);
    const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12);

    const calculateSIPFutureValue = () => {
        const i = expectedReturnRate / 12 / 100;
        const n = investmentYears * 12;
        const totalInvested = monthlySIP * n;
        const futureValue = monthlySIP * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
        return { totalInvested: Math.round(totalInvested), futureValue: Math.round(futureValue), wealthGain: Math.round(futureValue - totalInvested) };
    };

    const sipResults = calculateSIPFutureValue();

    // 4. DTI Calculator State
    const [monthlyGrossIncome, setMonthlyGrossIncome] = useState<number>(userMonthlyIncome);
    const [monthlyDebtEMIs, setMonthlyDebtEMIs] = useState<number>(15000);
    const dtiRatio = monthlyGrossIncome > 0 ? Math.round((monthlyDebtEMIs / monthlyGrossIncome) * 100) : 0;

    // 5. 48-Hour Cooling Off Tool State
    const [coolingItems, setCoolingItems] = useState<{ id: string; name: string; price: number; addedDate: string }[]>([
        { id: "cool-1", name: "Wireless Noise Canceling Headphones", price: 4500, addedDate: new Date().toLocaleDateString("en-IN") }
    ]);
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");

    const addCoolingItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName || !newItemPrice) return;
        setCoolingItems(prev => [
            ...prev,
            { id: `cool-${Date.now()}`, name: newItemName, price: Number(newItemPrice), addedDate: new Date().toLocaleDateString("en-IN") }
        ]);
        setNewItemName("");
        setNewItemPrice("");
    };

    return (
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "28px" }}>
            <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Calculator size={20} color="#6366f1" />
                    <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
                        Interactive Financial Calculators & Tools
                    </h3>
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Apply core personal finance formulas to your own numbers instantly.
                </p>
            </div>

            {/* Tool Category Tabs */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                {[
                    { id: "503020", label: "50/30/20 Rule" },
                    { id: "emergency", label: "Emergency Fund" },
                    { id: "sip", label: "SIP & Compound Interest" },
                    { id: "dti", label: "DTI Ratio" },
                    { id: "cooling", label: "48-Hour Cooling Off" }
                ].map(tool => (
                    <button
                        key={tool.id}
                        type="button"
                        onClick={() => setActiveTool(tool.id)}
                        style={{
                            padding: "8px 14px",
                            borderRadius: "10px",
                            border: `1px solid ${activeTool === tool.id ? "#6366f1" : "#cbd5e1"}`,
                            backgroundColor: activeTool === tool.id ? "rgba(99, 102, 241, 0.1)" : "#ffffff",
                            color: activeTool === tool.id ? "#6366f1" : "#475569",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: "pointer"
                        }}
                    >
                        {tool.label}
                    </button>
                ))}
            </div>

            {/* 1. 50/30/20 TOOL */}
            {activeTool === "503020" && (
                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>50/30/20 Allocation Calculator</h4>
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                            Net Monthly Income (₹):
                        </label>
                        <input
                            type="number"
                            value={income503020}
                            onChange={(e) => setIncome503020(Number(e.target.value))}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "200px", fontWeight: 700 }}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
                        <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "0.75rem", color: "#3b82f6", fontWeight: 700 }}>50% Needs Target</span>
                            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                                ₹{needsTarget.toLocaleString("en-IN")}
                            </div>
                            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Housing, Food, Utilities</span>
                        </div>

                        <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: 700 }}>30% Wants Target</span>
                            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                                ₹{wantsTarget.toLocaleString("en-IN")}
                            </div>
                            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Dining, Travel, Shopping</span>
                        </div>

                        <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 700 }}>20% Savings Target</span>
                            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#10b981", marginTop: "4px" }}>
                                ₹{savingsTarget.toLocaleString("en-IN")}
                            </div>
                            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>SIPs, Emergency Fund</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. EMERGENCY FUND TOOL */}
            {activeTool === "emergency" && (
                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Emergency Safety Net Calculator</h4>
                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "16px" }}>
                        <div>
                            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                                Lean Essential Monthly Expenses (₹):
                            </label>
                            <input
                                type="number"
                                value={monthlyEssentials}
                                onChange={(e) => setMonthlyEssentials(Number(e.target.value))}
                                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "200px", fontWeight: 700 }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                                Security Duration:
                            </label>
                            <select
                                value={targetMonths}
                                onChange={(e) => setTargetMonths(Number(e.target.value))}
                                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: 700 }}
                            >
                                <option value={3}>3 Months (Baseline)</option>
                                <option value={6}>6 Months (Recommended)</option>
                                <option value={12}>12 Months (Maximum)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Total Liquid Safety Net Target</span>
                            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#6366f1" }}>
                                ₹{emergencyTotal.toLocaleString("en-IN")}
                            </div>
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "4px 12px", borderRadius: "12px" }}>
                            Store in Liquid Bank Account
                        </span>
                    </div>
                </div>
            )}

            {/* 3. SIP COMPOUND TOOL */}
            {activeTool === "sip" && (
                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>SIP & Compound Wealth Simulator</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "16px" }}>
                        <div>
                            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>Monthly SIP (₹):</label>
                            <input type="number" value={monthlySIP} onChange={(e) => setMonthlySIP(Number(e.target.value))} style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", fontWeight: 700 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>Years:</label>
                            <input type="number" value={investmentYears} onChange={(e) => setInvestmentYears(Number(e.target.value))} style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", fontWeight: 700 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>Expected Return (% CAGR):</label>
                            <input type="number" value={expectedReturnRate} onChange={(e) => setExpectedReturnRate(Number(e.target.value))} style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", fontWeight: 700 }} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                        <div style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Total Out-of-Pocket Invested</span>
                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>₹{sipResults.totalInvested.toLocaleString("en-IN")}</div>
                        </div>
                        <div style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "0.72rem", color: "#10b981" }}>Compound Wealth Gain</span>
                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#10b981" }}>+₹{sipResults.wealthGain.toLocaleString("en-IN")}</div>
                        </div>
                        <div style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "0.72rem", color: "#6366f1" }}>Future Portfolio Value</span>
                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6366f1" }}>₹{sipResults.futureValue.toLocaleString("en-IN")}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. DTI RATIO TOOL */}
            {activeTool === "dti" && (
                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Debt-to-Income (DTI) Calculator</h4>
                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "16px" }}>
                        <div>
                            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Gross Monthly Income (₹):</label>
                            <input type="number" value={monthlyGrossIncome} onChange={(e) => setMonthlyGrossIncome(Number(e.target.value))} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "180px", fontWeight: 700 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Total Monthly EMIs (₹):</label>
                            <input type="number" value={monthlyDebtEMIs} onChange={(e) => setMonthlyDebtEMIs(Number(e.target.value))} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "180px", fontWeight: 700 }} />
                        </div>
                    </div>

                    <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Debt-to-Income Ratio</span>
                            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: dtiRatio <= 35 ? "#10b981" : "#ef4444" }}>
                                {dtiRatio}% {dtiRatio <= 35 ? "(Healthy DTI)" : "(High Debt Risk)"}
                            </div>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Safety Limit: ≤ 35%</span>
                    </div>
                </div>
            )}

            {/* 5. 48-HOUR COOLING OFF TOOL */}
            {activeTool === "cooling" && (
                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>48-Hour Impulse Purchase Delay Recorder</h4>
                    <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0 0 14px 0" }}>
                        Insert a mandatory 48-hour delay on unplanned non-essential shopping above ₹2,000 to conquer present bias.
                    </p>

                    <form onSubmit={addCoolingItem} style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                        <input
                            type="text"
                            placeholder="Item Name (e.g. Headphones)"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", flex: 1, minWidth: "160px" }}
                        />
                        <input
                            type="number"
                            placeholder="Price (₹)"
                            value={newItemPrice}
                            onChange={(e) => setNewItemPrice(e.target.value)}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "120px" }}
                        />
                        <button type="submit" className="wm-btn-primary" style={{ padding: "8px 16px" }}>
                            Add to 48-Hr Delay
                        </button>
                    </form>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {coolingItems.map(item => (
                            <div key={item.id} style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>{item.name}</span>
                                    <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: "10px" }}>Added: {item.addedDate}</span>
                                </div>
                                <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#6366f1" }}>₹{item.price.toLocaleString("en-IN")}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
