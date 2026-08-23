import { Link } from "react-router-dom";
import type { Transaction } from "../api/transactions";
import {
    ShoppingBag,
    Utensils,
    Car,
    Briefcase,
    Zap,
    Film,
    HeartPulse,
    HelpCircle,
    ArrowRight,
    FileText
} from "lucide-react";

interface RecentTransactionsProps {
    transactions?: Transaction[];
    onOpenStatementModal?: () => void;
}

const getCategoryIcon = (category: string, type: string) => {
    const cat = category.toLowerCase();
    if (type === "income" || cat.includes("salary") || cat.includes("freelance") || cat.includes("dividend")) {
        return <Briefcase size={16} />;
    }
    if (cat.includes("food") || cat.includes("dining") || cat.includes("swiggy") || cat.includes("zomato")) {
        return <Utensils size={16} />;
    }
    if (cat.includes("shop") || cat.includes("amazon") || cat.includes("flipkart") || cat.includes("clothing")) {
        return <ShoppingBag size={16} />;
    }
    if (cat.includes("transport") || cat.includes("fuel") || cat.includes("uber") || cat.includes("ola") || cat.includes("travel")) {
        return <Car size={16} />;
    }
    if (cat.includes("bill") || cat.includes("utility") || cat.includes("electricity") || cat.includes("recharge")) {
        return <Zap size={16} />;
    }
    if (cat.includes("entertain") || cat.includes("movie") || cat.includes("netflix") || cat.includes("spotify")) {
        return <Film size={16} />;
    }
    if (cat.includes("health") || cat.includes("medical") || cat.includes("gym") || cat.includes("fitness")) {
        return <HeartPulse size={16} />;
    }
    return <HelpCircle size={16} />;
};

function RecentTransactions({
    transactions = [],
    onOpenStatementModal,
}: RecentTransactionsProps) {
    const recentTransactions = [...transactions]
        .sort((a, b) => {
            const dateA = new Date(a.date || a.transactionDate || 0).getTime();
            const dateB = new Date(b.date || b.transactionDate || 0).getTime();
            return dateB - dateA;
        })
        .slice(0, 5);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Recent";
        const parsedDate = new Date(dateString);
        if (Number.isNaN(parsedDate.getTime())) return dateString;
        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatAmount = (amount: number) => {
        return amount.toLocaleString("en-IN");
    };

    return (
        <div className="wm-card wm-recent-card">
            <div className="wm-card-header">
                <div>
                    <h3 className="wm-card-title">Recent Transactions</h3>
                    <p className="wm-card-subtitle">Your latest cash inflows and outflows</p>
                </div>

                <Link to="/transactions" className="wm-card-action-link">
                    <span>View all</span>
                    <ArrowRight size={14} />
                </Link>
            </div>

            <div className="wm-recent-list">
                {recentTransactions.length === 0 ? (
                    <div className="wm-empty-state-sm">
                        <div className="wm-empty-icon">
                            <FileText size={24} />
                        </div>
                        <h4>No transactions recorded</h4>
                        <p>Import your bank statement PDF to populate your activity feed.</p>
                        {onOpenStatementModal && (
                            <button
                                type="button"
                                onClick={onOpenStatementModal}
                                className="wm-btn-secondary wm-btn-sm"
                                style={{ marginTop: "12px" }}
                            >
                                Import Statement
                            </button>
                        )}
                    </div>
                ) : (
                    recentTransactions.map((tx) => {
                        const isIncome = tx.type === "income";
                        return (
                            <div
                                className="wm-tx-item"
                                key={tx._id || `${tx.merchant}-${tx.date}-${tx.amount}`}
                            >
                                <div className={`wm-tx-icon ${isIncome ? 'income' : 'expense'}`}>
                                    {getCategoryIcon(tx.category || "Other", tx.type)}
                                </div>

                                <div className="wm-tx-details">
                                    <div className="wm-tx-merchant">{tx.merchant}</div>
                                    <div className="wm-tx-meta">
                                        <span className="wm-tx-cat">{tx.category || "General"}</span>
                                        <span className="wm-tx-dot">•</span>
                                        <span className="wm-tx-date">{formatDate(tx.date || tx.transactionDate)}</span>
                                    </div>
                                </div>

                                <div className={`wm-tx-amount ${isIncome ? 'income' : 'expense'}`}>
                                    <span className="wm-tx-sign">{isIncome ? '+' : '-'}</span>
                                    <span>₹{formatAmount(tx.amount)}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default RecentTransactions;