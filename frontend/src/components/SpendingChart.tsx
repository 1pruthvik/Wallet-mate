import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const spendingData = [
    { month: "Jan", spending: 18000 },
    { month: "Feb", spending: 22000 },
    { month: "Mar", spending: 19500 },
    { month: "Apr", spending: 24000 },
    { month: "May", spending: 21000 },
    { month: "Jun", spending: 17500 },
];

function SpendingChart() {
    return (
        <div className="chart-card">
            <div className="section-header">
                <div>
                    <h2>Spending Overview</h2>
                    <p>Monthly spending trend</p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={spendingData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="month" />

                    <YAxis />

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="spending"
                        strokeWidth={3}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default SpendingChart;