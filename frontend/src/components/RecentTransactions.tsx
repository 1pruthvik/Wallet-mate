import type {
    Transaction,
} from "../api/transactions";


interface RecentTransactionsProps {
    transactions?: Transaction[];
}


function RecentTransactions({
    transactions = [],
}: RecentTransactionsProps) {


    /* =========================
       GET RECENT TRANSACTIONS
    ========================= */

    const recentTransactions =
        [...transactions]
            .sort(
                (a, b) => {

                    const dateA =
                        new Date(a.date).getTime();

                    const dateB =
                        new Date(b.date).getTime();

                    return dateB - dateA;
                }
            )
            .slice(0, 5);


    /* =========================
       FORMAT DATE
    ========================= */

    const formatDate = (
        date: string
    ) => {

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    /* =========================
       FORMAT AMOUNT
    ========================= */

    const formatAmount = (
        amount: number
    ) => {

        return amount.toLocaleString(
            "en-IN"
        );
    };


    return (

        <div className="recent-transactions">


            {/* HEADER */}

            <div className="recent-transactions-header">

                <div>

                    <h2>
                        Recent Transactions
                    </h2>

                    <p>
                        Your latest financial activity
                    </p>

                </div>


                <a
                    href="/transactions"
                    className="view-all-link"
                >
                    View all →
                </a>

            </div>


            {/* TRANSACTIONS */}

            <div className="recent-transactions-list">


                {recentTransactions.length === 0 ? (

                    <div className="empty-transactions">

                        <p>
                            No transactions available.
                        </p>

                    </div>

                ) : (

                    recentTransactions.map(
                        (transaction) => (

                            <div
                                className="recent-transaction-item"
                                key={
                                    transaction._id ||
                                    `${transaction.merchant}-${transaction.date}-${transaction.amount}`
                                }
                            >


                                {/* LEFT */}

                                <div className="recent-transaction-info">

                                    <h3>
                                        {
                                            transaction.merchant
                                        }
                                    </h3>

                                    <p>
                                        {
                                            transaction.category
                                        }

                                        {" • "}

                                        {
                                            formatDate(
                                                transaction.date
                                            )
                                        }
                                    </p>

                                </div>


                                {/* RIGHT */}

                                <div
                                    className={
                                        transaction.type ===
                                            "income"
                                            ? "recent-transaction-amount income"
                                            : "recent-transaction-amount expense"
                                    }
                                >

                                    {
                                        transaction.type ===
                                            "income"
                                            ? "+"
                                            : "-"
                                    }

                                    ₹
                                    {
                                        formatAmount(
                                            transaction.amount
                                        )
                                    }

                                </div>

                            </div>

                        )
                    )

                )}

            </div>

        </div>
    );
}


export default RecentTransactions;