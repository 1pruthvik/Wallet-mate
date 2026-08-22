interface StatCardProps {
    title: string;
    value: string;
    subtitle: string;
}

function StatCard({
    title,
    value,
    subtitle,
}: StatCardProps) {
    return (
        <div className="stat-card">
            <p className="stat-title">{title}</p>

            <h2 className="stat-value">{value}</h2>

            <p className="stat-subtitle">{subtitle}</p>
        </div>
    );
}

export default StatCard;