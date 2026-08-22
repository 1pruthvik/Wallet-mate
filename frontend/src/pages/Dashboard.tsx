import StatCard from "../components/StatCard";
import SpendingChart from "../components/SpendingChart";
import RecentTransactions from "../components/RecentTransactions";
import FinancialHealthCard from "../components/FinancialHealthCard";

function Dashboard() {
    return (
        <div className="dashboard">

            <div className="dashboard-header">
                <div>
                    <h1>Good afternoon, Nivish 👋</h1>

                    <p>
                        Here's your financial overview.
                    </p>
                </div>
            </div>

            <div className="stats-grid">

                <StatCard
                    title="Total Balance"
                    value="₹1,25,000"
                    subtitle="Across all accounts"
                />

                <StatCard
                    title="Monthly Income"
                    value="₹75,000"
                    subtitle="This month"
                />

                <StatCard
                    title="Monthly Expenses"
                    value="₹24,500"
                    subtitle="This month"
                />

                <StatCard
                    title="Monthly Savings"
                    value="₹50,500"
                    subtitle="67% savings rate"
                />

            </div>

            <FinancialHealthCard />

            <SpendingChart />

            <RecentTransactions />

        </div>
    );
}

export default Dashboard;