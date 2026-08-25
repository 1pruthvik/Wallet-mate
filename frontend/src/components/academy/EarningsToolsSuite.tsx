import React, { useState } from "react";
import {
    Calculator,
    TrendingUp,
    Clock,
    DollarSign,
    Percent,
    ShieldAlert,
    PieChart
} from "lucide-react";

interface EarningsToolsSuiteProps {
    userMonthlyIncome?: number;
    userMonthlyExpenses?: number;
    userSurplus?: number;
}

export const EarningsToolsSuite: React.FC<EarningsToolsSuiteProps> = ({
    userMonthlyIncome = 80000,
    userMonthlyExpenses = 52000,
    userSurplus = 28000
}) => {
    const [selectedTool, setSelectedTool] = useState<string>("pl-builder");

    // 1. Personal P&L Builder
    const [plGrossIncome, setPlGrossIncome] = useState<number>(userMonthlyIncome);
    const [plTaxes, setPlTaxes] = useState<number>(Math.round(userMonthlyIncome * 0.10));
    const [plFixedNeeds, setPlFixedNeeds] = useState<number>(Math.round(userMonthlyExpenses * 0.65));
    const [plDiscretionary, setPlDiscretionary] = useState<number>(Math.round(userMonthlyExpenses * 0.35));

    const plNetTakeHome = plGrossIncome - plTaxes;
    const plTotalExpenses = plFixedNeeds + plDiscretionary;
    const plPersonalProfit = plNetTakeHome - plTotalExpenses;
    const plProfitRate = plNetTakeHome > 0 ? Math.round((plPersonalProfit / plNetTakeHome) * 100) : 0;

    // 2. Margin & Markup Calculator
    const [calcSellingPrice, setCalcSellingPrice] = useState<number>(2500);
    const [calcUnitCost, setCalcUnitCost] = useState<number>(1500);
    const calcUnitProfit = calcSellingPrice - calcUnitCost;
    const calcGrossMargin = calcSellingPrice > 0 ? Math.round((calcUnitProfit / calcSellingPrice) * 100) : 0;
    const calcMarkup = calcUnitCost > 0 ? Math.round((calcUnitProfit / calcUnitCost) * 100) : 0;

    // 3. Break-Even Calculator
    const [beFixedCosts, setBeFixedCosts] = useState<number>(60000);
    const [bePricePerUnit, setBePricePerUnit] = useState<number>(1000);
    const [beVarCostPerUnit, setBeVarCostPerUnit] = useState<number>(400);
    const beContributionPerUnit = bePricePerUnit - beVarCostPerUnit;
    const beBreakEvenUnits = beContributionPerUnit > 0 ? Math.ceil(beFixedCosts / beContributionPerUnit) : 0;
    const beBreakEvenRevenue = beBreakEvenUnits * bePricePerUnit;

    // 4. Effective Hourly Rate (EHR) Calculator
    const [ehrProjectInflow, setEhrProjectInflow] = useState<number>(45000);
    const [ehrBillableHours, setEhrBillableHours] = useState<number>(20);
    const [ehrAdminHours, setEhrAdminHours] = useState<number>(10);
    const ehrTotalHours = ehrBillableHours + ehrAdminHours;
    const ehrEffectiveRate = ehrTotalHours > 0 ? Math.round(ehrProjectInflow / ehrTotalHours) : 0;
    const ehrNominalRate = ehrBillableHours > 0 ? Math.round(ehrProjectInflow / ehrBillableHours) : 0;

    // 5. Discount Impact Calculator
    const [discOriginalMargin, setDiscOriginalMargin] = useState<number>(40);
    const [discPercentage, setDiscPercentage] = useState<number>(15);
    const discVolumeIncreaseNeeded = (discOriginalMargin - discPercentage) > 0
        ? Math.round((discPercentage / (discOriginalMargin - discPercentage)) * 100)
        : 999;

    // 6. ROI & Payback Calculator
    const [roiInitialInvestment, setRoiInitialInvestment] = useState<number>(100000);
    const [roiAnnualCashflow, setRoiAnnualCashflow] = useState<number>(28000);
    const roiPaybackYears = roiAnnualCashflow > 0 ? (roiInitialInvestment / roiAnnualCashflow).toFixed(1) : "—";
    const roiAnnualReturnPct = roiInitialInvestment > 0 ? Math.round((roiAnnualCashflow / roiInitialInvestment) * 100) : 0;

    // 7. Surplus Allocator Tool
    const [allocSurplus, setAllocSurplus] = useState<number>(userSurplus > 0 ? userSurplus : 25000);
    const allocSecurityBuffer = Math.round(allocSurplus * 0.25);
    const allocCoreIndexSIP = Math.round(allocSurplus * 0.55);
    const allocGrowthAccelerator = Math.round(allocSurplus * 0.20);

    const toolsList = [
        { id: "pl-builder", name: "Personal P&L Builder", icon: <TrendingUp size={16} /> },
        { id: "margin-calc", name: "Margin & Markup Calculator", icon: <Percent size={16} /> },
        { id: "breakeven", name: "Break-Even Calculator", icon: <Calculator size={16} /> },
        { id: "ehr-calc", name: "Effective Hourly Rate (EHR)", icon: <Clock size={16} /> },
        { id: "discount-calc", name: "Discount Impact Calculator", icon: <ShieldAlert size={16} /> },
        { id: "roi-calc", name: "ROI & Payback Calculator", icon: <DollarSign size={16} /> },
        { id: "surplus-alloc", name: "Surplus Allocator Engine", icon: <PieChart size={16} /> }
    ];

    return (
        <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <div style={{ marginBottom: "20px" }}>
                <h2 style={{ margin: "0 0 4px 0", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
                    Earnings & Profit Interactive Tools Suite
                </h2>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#64748b" }}>
                    Institutional calculators to model personal cashflow, pricing power, unit economics, and capital yields.
                </p>
            </div>

            {/* TOOL SELECTOR PILLS */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "24px", borderBottom: "1px solid #f1f5f9" }}>
                {toolsList.map(t => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTool(t.id)}
                        className={`wm-tab-pill ${selectedTool === t.id ? 'active' : ''}`}
                        style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", padding: "8px 16px", whiteSpace: "nowrap" }}
                    >
                        {t.icon}
                        <span>{t.name}</span>
                    </button>
                ))}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* TOOL 1: PERSONAL P&L BUILDER */}
            {/* ------------------------------------------------------------- */}
            {selectedTool === "pl-builder" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
                    <div>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                            Monthly Income & Expense Inputs
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Gross Monthly Inflows (₹)</label>
                                <input
                                    type="number"
                                    value={plGrossIncome}
                                    onChange={(e) => setPlGrossIncome(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>TDS & Professional Taxes (₹)</label>
                                <input
                                    type="number"
                                    value={plTaxes}
                                    onChange={(e) => setPlTaxes(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Fixed Operating Needs (Rent, Bills, EMIs) (₹)</label>
                                <input
                                    type="number"
                                    value={plFixedNeeds}
                                    onChange={(e) => setPlFixedNeeds(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Discretionary Lifestyle Spend (₹)</label>
                                <input
                                    type="number"
                                    value={plDiscretionary}
                                    onChange={(e) => setPlDiscretionary(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Output P&L Card */}
                    <div style={{ background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6366f1", textTransform: "uppercase" }}>Monthly P&L Summary</span>
                            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#64748b" }}>Gross Revenue:</span>
                                    <strong>₹{plGrossIncome.toLocaleString("en-IN")}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#ef4444" }}>
                                    <span>Taxes & Deductions:</span>
                                    <span>-₹{plTaxes.toLocaleString("en-IN")}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "6px" }}>
                                    <span style={{ fontWeight: 700 }}>Net Take-Home Pay:</span>
                                    <strong style={{ color: "#10b981" }}>₹{plNetTakeHome.toLocaleString("en-IN")}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#ef4444" }}>
                                    <span>Total Living Costs:</span>
                                    <span>-₹{plTotalExpenses.toLocaleString("en-IN")}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #0f172a", paddingTop: "10px", fontSize: "1.05rem" }}>
                                    <span style={{ fontWeight: 800 }}>Retained Personal Profit:</span>
                                    <strong style={{ color: plPersonalProfit >= 0 ? "#10b981" : "#ef4444" }}>
                                        ₹{plPersonalProfit.toLocaleString("en-IN")}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: "rgba(99, 102, 241, 0.08)", padding: "12px 16px", borderRadius: "12px", marginTop: "16px", textAlign: "center" }}>
                            <span style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: 700 }}>Personal Profit Margin</span>
                            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: plProfitRate >= 25 ? "#10b981" : "#f59e0b" }}>
                                {plProfitRate}%
                            </div>
                            <span style={{ fontSize: "0.72rem", color: "#475569" }}>Target Benchmark: ≥ 30% of Net Income</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TOOL 2: MARGIN & MARKUP CALCULATOR */}
            {/* ------------------------------------------------------------- */}
            {selectedTool === "margin-calc" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                    <div>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                            Unit Pricing Inputs
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Selling Price per Unit (₹)</label>
                                <input
                                    type="number"
                                    value={calcSellingPrice}
                                    onChange={(e) => setCalcSellingPrice(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Total Direct Cost per Unit (₹)</label>
                                <input
                                    type="number"
                                    value={calcUnitCost}
                                    onChange={(e) => setCalcUnitCost(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
                        <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: 800, color: "#6366f1" }}>Calculated Profitability Ratios</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Unit Profit:</span>
                                <strong style={{ color: "#10b981" }}>₹{calcUnitProfit.toLocaleString("en-IN")}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Gross Margin on Selling Price:</span>
                                <strong style={{ color: "#6366f1" }}>{calcGrossMargin}%</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Markup on Cost:</span>
                                <strong>{calcMarkup}%</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TOOL 3: BREAK-EVEN CALCULATOR */}
            {/* ------------------------------------------------------------- */}
            {selectedTool === "breakeven" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                    <div>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                            Break-Even Parameters
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Total Monthly Fixed Overhead (₹)</label>
                                <input
                                    type="number"
                                    value={beFixedCosts}
                                    onChange={(e) => setBeFixedCosts(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Price per Unit (₹)</label>
                                <input
                                    type="number"
                                    value={bePricePerUnit}
                                    onChange={(e) => setBePricePerUnit(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Variable Cost per Unit (₹)</label>
                                <input
                                    type="number"
                                    value={beVarCostPerUnit}
                                    onChange={(e) => setBeVarCostPerUnit(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
                        <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: 800, color: "#6366f1" }}>Break-Even Results</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Contribution per Unit:</span>
                                <strong>₹{beContributionPerUnit.toLocaleString("en-IN")}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                                <span style={{ fontWeight: 800 }}>Break-Even Units:</span>
                                <strong style={{ color: "#d97706" }}>{beBreakEvenUnits} Units</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                                <span style={{ fontWeight: 800 }}>Break-Even Revenue:</span>
                                <strong style={{ color: "#6366f1" }}>₹{beBreakEvenRevenue.toLocaleString("en-IN")}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TOOL 4: EFFECTIVE HOURLY RATE (EHR) */}
            {/* ------------------------------------------------------------- */}
            {selectedTool === "ehr-calc" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                    <div>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                            Project Time & Fee Inputs
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Total Net Project Inflow (₹)</label>
                                <input
                                    type="number"
                                    value={ehrProjectInflow}
                                    onChange={(e) => setEhrProjectInflow(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Direct Billable Execution Hours</label>
                                <input
                                    type="number"
                                    value={ehrBillableHours}
                                    onChange={(e) => setEhrBillableHours(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Admin, Revision & Prospecting Hours</label>
                                <input
                                    type="number"
                                    value={ehrAdminHours}
                                    onChange={(e) => setEhrAdminHours(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
                        <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: 800, color: "#6366f1" }}>Effective vs Nominal Rate</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Nominal Billable Rate:</span>
                                <strong>₹{ehrNominalRate}/hr</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.15rem" }}>
                                <span style={{ fontWeight: 800 }}>True Effective Hourly Rate:</span>
                                <strong style={{ color: "#10b981" }}>₹{ehrEffectiveRate}/hr</strong>
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                Overhead drag reduced your realized hourly rate by {Math.round(((ehrNominalRate - ehrEffectiveRate) / (ehrNominalRate || 1)) * 100)}%.
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TOOL 5: DISCOUNT IMPACT CALCULATOR */}
            {/* ------------------------------------------------------------- */}
            {selectedTool === "discount-calc" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                    <div>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                            Discount Sensitivity Inputs
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Original Gross Margin %</label>
                                <input
                                    type="number"
                                    value={discOriginalMargin}
                                    onChange={(e) => setDiscOriginalMargin(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Proposed Discount %</label>
                                <input
                                    type="number"
                                    value={discPercentage}
                                    onChange={(e) => setDiscPercentage(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
                        <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: 800, color: "#ef4444" }}>Volume Required to Offset Discount</h4>
                        <div style={{ fontSize: "2rem", fontWeight: 900, color: "#ef4444", margin: "10px 0" }}>
                            +{discVolumeIncreaseNeeded}%
                        </div>
                        <p style={{ margin: 0, fontSize: "0.82rem", color: "#475569", lineHeight: "1.4" }}>
                            To maintain the exact same rupee profit after giving a <strong>{discPercentage}%</strong> discount on a {discOriginalMargin}% margin, you must sell <strong>{discVolumeIncreaseNeeded}% more units</strong>.
                        </p>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TOOL 6: ROI & PAYBACK CALCULATOR */}
            {/* ------------------------------------------------------------- */}
            {selectedTool === "roi-calc" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                    <div>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                            Capital Outlay & Cashflow
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Initial Investment Cost (₹)</label>
                                <input
                                    type="number"
                                    value={roiInitialInvestment}
                                    onChange={(e) => setRoiInitialInvestment(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Expected Annual Net Cash Inflow (₹)</label>
                                <input
                                    type="number"
                                    value={roiAnnualCashflow}
                                    onChange={(e) => setRoiAnnualCashflow(Number(e.target.value))}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
                        <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: 800, color: "#6366f1" }}>Investment Performance</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Simple Payback Period:</span>
                                <strong style={{ color: "#10b981" }}>{roiPaybackYears} Years</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Annual Return on Capital:</span>
                                <strong style={{ color: "#6366f1" }}>{roiAnnualReturnPct}%</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TOOL 7: SURPLUS ALLOCATOR */}
            {/* ------------------------------------------------------------- */}
            {selectedTool === "surplus-alloc" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                    <div>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                            Retained Monthly Surplus
                        </h3>
                        <div>
                            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Available Monthly Surplus to Deploy (₹)</label>
                            <input
                                type="number"
                                value={allocSurplus}
                                onChange={(e) => setAllocSurplus(Number(e.target.value))}
                                style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                            />
                        </div>
                    </div>

                    <div style={{ background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
                        <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: 800, color: "#6366f1" }}>Recommended Surplus Deployment</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Security Buffer (25% Flexi FD):</span>
                                <strong style={{ color: "#f59e0b" }}>₹{allocSecurityBuffer.toLocaleString("en-IN")}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Core Wealth (55% Broad Index SIP):</span>
                                <strong style={{ color: "#10b981" }}>₹{allocCoreIndexSIP.toLocaleString("en-IN")}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Growth Accelerator (20% Discretionary Capital):</span>
                                <strong style={{ color: "#6366f1" }}>₹{allocGrowthAccelerator.toLocaleString("en-IN")}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
