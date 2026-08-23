import React, { useState, useEffect, useRef, useCallback } from "react";
import { getTransactions } from "../api/transactions";
import type { Transaction } from "../api/transactions";
import { calculateFinancialHealth } from "../utils/financialHealth";
import { queryAIMentor } from "../api/ai";

interface ChatMessage {
    id: string;
    sender: "user" | "mentor";
    text: string;
    timestamp: string;
    verdict?: "BUY" | "WAIT" | "AVOID" | "SCAM_ALERT" | "SAFE";
    scenarioData?: {
        title: string;
        metrics: { label: string; value: string }[];
    };
}

const QUICK_PROMPTS = [
    {
        title: "Can I Afford This?",
        prompt: "Can I buy a ₹35,000 phone right now?",
        icon: "📱",
    },
    {
        title: "Salary Plan",
        prompt: "Generate a personalized monthly plan for a ₹60,000 salary.",
        icon: "💼",
    },
    {
        title: "Spending Leaks",
        prompt: "Where am I spending too much money this month?",
        icon: "🔍",
    },
    {
        title: "Scam Detector",
        prompt: "Analyze this message: 'Congratulations! You won ₹25 lakh. Pay ₹4,999 processing fee to claim.'",
        icon: "🛡️",
    },
    {
        title: "Start Investing",
        prompt: "How should I allocate ₹5,000 monthly SIP as a beginner?",
        icon: "📈",
    },
];

let messageSequence = 1;

const Mentor: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "msg-welcome",
            sender: "mentor",
            text: "Hello Nivish! I am **FinMitra AI Mentor**, your personal financial intelligence companion.\n\nI can analyze your spending patterns, evaluate purchase affordability (*Can I afford this?*), detect financial scams, and build personalized wealth plans. How can I assist you today?",
            timestamp: "Just now",
        },
    ]);
    const [inputQuery, setInputQuery] = useState<string>("");
    const [isTyping, setIsTyping] = useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getTransactions();
                setTransactions(data);
            } catch (err) {
                console.error("Mentor failed to load transactions:", err);
            }
        };
        load();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Financial intelligence context builder
    const generateMentorResponse = useCallback((query: string, responseId: string, timestamp: string): ChatMessage => {
        const report = calculateFinancialHealth(transactions);
        const lower = query.toLowerCase();

        // 1. Can I Afford This? (Section 31)
        if (lower.includes("afford") || lower.includes("buy a") || lower.includes("phone") || lower.includes("laptop")) {
            const amountMatch = query.match(/₹?\s*(\d+[\d,]*)/);
            const itemPrice = amountMatch ? parseInt(amountMatch[1].replace(/,/g, ""), 10) : 35000;

            const monthlySurplus = report.monthlySavings;
            let verdict: "BUY" | "WAIT" | "AVOID" = "WAIT";
            let reason = "";

            if (monthlySurplus >= itemPrice * 1.5 && report.score >= 70) {
                verdict = "BUY";
                reason = `Your current monthly surplus is **₹${monthlySurplus.toLocaleString("en-IN")}** with a healthy financial score of **${report.score}/100**. You can afford this purchase upfront without compromising emergency reserves.`;
            } else if (monthlySurplus >= itemPrice * 0.4 && monthlySurplus > 0) {
                verdict = "WAIT";
                const monthsToSave = Math.ceil(itemPrice / (monthlySurplus * 0.6));
                reason = `Purchasing this ₹${itemPrice.toLocaleString("en-IN")} item right now will deplete your liquid surplus. By setting aside ₹${Math.round(monthlySurplus * 0.6).toLocaleString("en-IN")}/month, you can purchase it comfortably in **${monthsToSave} months** without taking on debt.`;
            } else {
                verdict = "AVOID";
                reason = `Your monthly living expenses are currently absorbing most of your inflow. Adding an unplanned ₹${itemPrice.toLocaleString("en-IN")} expense will trigger a cashflow deficit. Focus on stabilizing your baseline emergency reserve first.`;
            }

            return {
                id: responseId,
                sender: "mentor",
                text: `### Purchase Affordability Assessment\n\n**Verdict:** ${verdict}\n\n${reason}`,
                verdict,
                scenarioData: {
                    title: "Affordability Breakdown",
                    metrics: [
                        { label: "Item Price", value: `₹${itemPrice.toLocaleString("en-IN")}` },
                        { label: "Monthly Surplus", value: `₹${monthlySurplus.toLocaleString("en-IN")}` },
                        { label: "Financial Health", value: `${report.score}/100` },
                        { label: "Safety Impact", value: verdict === "BUY" ? "Low Risk" : "High Strain" },
                    ],
                },
                timestamp,
            };
        }

        // 2. Salary Plan (Section 32)
        if (lower.includes("salary") || lower.includes("60,000") || lower.includes("plan")) {
            return {
                id: responseId,
                sender: "mentor",
                text: `### Personalized ₹60,000 Salary Financial Blueprint\n\nBased on prudent wealth-building principles adapted for India:\n\n* **🏠 Necessities (50% — ₹30,000):** Rent/EMI, groceries, utility bills, health insurance, commute.\n* **📈 Investments & Wealth (25% — ₹15,000):**\n  * ₹8,000 in Nifty 50 Index Fund\n  * ₹4,000 in Flexi-Cap / Mid-Cap Fund\n  * ₹3,000 in PPF / Debt / Emergency Fund\n* **🎯 Wants & Lifestyle (15% — ₹9,000):** Weekend dining, shopping, OTT subscriptions, leisure.\n* **🛡️ Emergency Reserve (10% — ₹6,000):** Automated liquid fund parking until 3 months expenses (₹90,000) is reached.`,
                scenarioData: {
                    title: "Recommended Allocation",
                    metrics: [
                        { label: "Essentials", value: "₹30,000 (50%)" },
                        { label: "Investments", value: "₹15,000 (25%)" },
                        { label: "Wants", value: "₹9,000 (15%)" },
                        { label: "Emergency Fund", value: "₹6,000 (10%)" },
                    ],
                },
                timestamp,
            };
        }

        // 3. Scam Detection (Section 29)
        if (lower.includes("scam") || lower.includes("won") || lower.includes("lakh") || lower.includes("fee") || lower.includes("lottery")) {
            return {
                id: responseId,
                sender: "mentor",
                text: `### 🚨 Security Alert: High Probability Financial Scam\n\n**Classification:** LIKELY SCAM (99.8% Confidence)\n\n**Warning Indicators Detected:**\n1. **Upfront Fee Fraud:** Legitimate lotteries and awards never demand an advance "processing fee" or "tax clearance" before disbursement.\n2. **Unsolicited Prize:** You cannot win a competition or lottery you never entered.\n3. **Urgency & Pressure:** Scammers use artificial excitement to bypass logical scrutiny.\n\n**Recommended Action:** Do **NOT** pay any amount, do not click links or share bank OTPs. Report the sender number on the national cyber crime portal (cybercrime.gov.in).`,
                verdict: "SCAM_ALERT",
                timestamp,
            };
        }

        // 4. Spending Leaks
        if (lower.includes("spending") || lower.includes("leak") || lower.includes("too much")) {
            return {
                id: responseId,
                sender: "mentor",
                text: `### Spending Analytics & Outflow Diagnosis\n\nBased on your synchronized transaction records:\n\n* **Total Monthly Outflow:** ₹${report.monthlyExpenses.toLocaleString("en-IN")}\n* **Discretionary Purchases:** ₹${report.discretionarySpend.toLocaleString("en-IN")}\n* **Savings Rate:** ${report.savingsRate}%\n\n**Optimization Opportunities:**\n1. **Food & Delivery Apps:** Cap weekend food delivery frequency to save an estimated ₹3,500/month.\n2. **Discretionary Shopping:** Implement a 48-hour cooling-off rule on shopping orders above ₹1,500.\n3. **Recurring Subscriptions:** Review automated card mandates to eliminate unused streaming or app fees.`,
                timestamp,
            };
        }

        // 5. Default General Financial Intelligence
        return {
            id: responseId,
            sender: "mentor",
            text: `### Financial Guidance\n\nRegarding your question: *"**${query}**"*\n\nHere is what you should consider based on your current financial health score of **${report.score}/100**:\n\n* Maintain consistent monthly cashflow surplus.\n* Prioritize building 3 months of emergency reserves (Target: ₹${Math.round(report.monthlyExpenses * 3).toLocaleString("en-IN")}).\n* Automate long-term equity index SIPs to outpace inflation.\n* Avoid taking high-interest personal or consumer gadget debt.`,
            timestamp,
        };
    }, [transactions]);

    const handleSendMessage = async (textToSend?: string) => {
        const query = (textToSend || inputQuery).trim();
        if (!query || isTyping) return;

        const currentTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const userMsg: ChatMessage = {
            id: `user-msg-${++messageSequence}`,
            sender: "user",
            text: query,
            timestamp: currentTimestamp,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputQuery("");
        setIsTyping(true);

        const botResponseId = `mentor-msg-${++messageSequence}`;
        const botTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        try {
            const report = calculateFinancialHealth(transactions);
            const aiRes = await queryAIMentor(query, {
                healthScore: report.score,
                monthlyIncome: report.monthlyIncome,
                monthlyExpenses: report.monthlyExpenses,
                savingsRate: report.savingsRate,
            });

            if (aiRes && aiRes.answer) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: botResponseId,
                        sender: "mentor",
                        text: aiRes.answer,
                        timestamp: botTimestamp,
                    },
                ]);
                setIsTyping(false);
                return;
            }
        } catch {
            // Graceful fallback to client-side financial rules engine
        }

        // Local financial rules engine
        const botResponse = generateMentorResponse(query, botResponseId, botTimestamp);
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
    };

    return (
        <div className="mentor-page">
            {/* PAGE HEADER */}
            <div className="page-header">
                <div>
                    <h1>AI Money Mentor</h1>
                    <p>Explainable, personalized financial intelligence powered by your real-time cashflow.</p>
                </div>
                <div className="mentor-status-pill">
                    <span className="online-dot" />
                    <span>Grounded in Your Transactions</span>
                </div>
            </div>

            {/* MAIN CHAT WRAPPER */}
            <div className="mentor-chat-wrapper">
                {/* QUICK PROMPTS BAR */}
                <div className="quick-prompts-bar">
                    <span className="quick-prompts-title">💡 Suggested Topics:</span>
                    <div className="quick-prompts-scroll">
                        {QUICK_PROMPTS.map((item, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className="quick-prompt-btn"
                                onClick={() => handleSendMessage(item.prompt)}
                            >
                                <span className="prompt-icon">{item.icon}</span>
                                <span className="prompt-text">{item.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* MESSAGES SCROLL CONTAINER */}
                <div className="mentor-messages-box">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`chat-message-row message-${msg.sender}`}>
                            <div className="message-avatar">
                                {msg.sender === "mentor" ? "🤖" : "👤"}
                            </div>

                            <div className="message-bubble">
                                <div className="message-meta">
                                    <span className="message-sender-name">
                                        {msg.sender === "mentor" ? "FinMitra Mentor" : "You"}
                                    </span>
                                    <span className="message-time">{msg.timestamp}</span>
                                </div>

                                {msg.verdict && (
                                    <div className={`verdict-banner verdict-${msg.verdict.toLowerCase()}`}>
                                        <span className="verdict-tag">Decision Signal:</span>
                                        <strong>{msg.verdict.replace("_", " ")}</strong>
                                    </div>
                                )}

                                <div className="message-body-text">
                                    {msg.text.split("\n\n").map((para, pIdx) => (
                                        <p key={pIdx}>
                                            {para.split("\n").map((line, lIdx) => (
                                                <React.Fragment key={lIdx}>
                                                    {line}
                                                    {lIdx < para.split("\n").length - 1 && <br />}
                                                </React.Fragment>
                                            ))}
                                        </p>
                                    ))}
                                </div>

                                {msg.scenarioData && (
                                    <div className="scenario-data-box">
                                        <span className="scenario-box-title">{msg.scenarioData.title}</span>
                                        <div className="scenario-metrics-grid">
                                            {msg.scenarioData.metrics.map((m, mIdx) => (
                                                <div key={mIdx} className="scenario-metric-chip">
                                                    <span className="metric-chip-label">{m.label}</span>
                                                    <span className="metric-chip-value">{m.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="chat-message-row message-mentor">
                            <div className="message-avatar">🤖</div>
                            <div className="message-bubble typing-bubble">
                                <div className="typing-indicator">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                <span className="typing-text">Analyzing your financial context...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* CHAT INPUT FORM */}
                <form
                    className="mentor-input-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                >
                    <input
                        type="text"
                        className="mentor-input-field"
                        placeholder="Ask anything (e.g. Can I afford a ₹45,000 trip?, How to start investing?)..."
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="mentor-send-btn"
                        disabled={!inputQuery.trim() || isTyping}
                    >
                        Send →
                    </button>
                </form>

                <div className="mentor-disclaimer-note">
                    🔒 FinMitra AI Mentor provides analytical financial intelligence, not guaranteed legal or tax advice. Never share bank passwords or OTPs.
                </div>
            </div>
        </div>
    );
};

export default Mentor;