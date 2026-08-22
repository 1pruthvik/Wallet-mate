interface Transaction {
    id: number;
    merchant: string;
    category: string;
    date: string;
    amount: number;
    type: "income" | "expense";
}

const transactions: Transaction[] = [
    {
        id: 1,
        merchant: "Swiggy",
        category: "Food",
        date: "22 Aug 2026",
        amount: 450,
        type: "expense",
    },
    {
        id: 2,
        merchant: "Amazon",
        category: "Shopping",
        date: "21 Aug 2026",
        amount: 1299,
        type: "expense",
    },
    {
        id: 3,
        merchant: "Salary",
        category: "Income",
        date: "20 Aug 2026",
        amount: 75000,
        type: "income",
    },
    {
        id: 4,
        merchant: "Uber",
        category: "Transport",
        date: "19 Aug 2026",
        amount: 320,
        type: "expense",
    },
];

function RecentTransactions() {
    return (
        <div className="transactions-card">
            <div className="section-header">
                <div>
                    <h2>Recent Transactions</h2>
                    <p>Your latest financial activity</p>
                </div>
            </div>

            <div className="transaction-list">
                {transactions.map((transaction) => (
                    <div
                        className="transaction-row"
                        key={transaction.id}
                    >
                        <div>
                            <h3>{transaction.merchant}</h3>

                            <p>
                                {transaction.category} · {transaction.date}
                            </p>
                        </div>

                        <strong>
                            {transaction.type === "expense" ? "-" : "+"}
                            ₹{transaction.amount.toLocaleString("en-IN")}
                        </strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecentTransactions;