import React from "react";

interface StatCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon?: React.ReactNode;
    trend?: {
        value: string;
        isPositive?: boolean;
        neutral?: boolean;
    };
    variant?: "default" | "income" | "expense" | "balance" | "savings";
}

function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    variant = "default",
}: StatCardProps) {
    return (
        <div className={`wm-stat-card wm-stat-${variant}`}>
            <div className="wm-stat-header">
                <span className="wm-stat-title">{title}</span>
                {icon && <div className="wm-stat-icon-wrapper">{icon}</div>}
            </div>

            <div className="wm-stat-body">
                <h3 className="wm-stat-value">{value}</h3>
                {trend && (
                    <div className={`wm-stat-badge ${trend.neutral ? 'neutral' : trend.isPositive ? 'positive' : 'negative'}`}>
                        {trend.value}
                    </div>
                )}
            </div>

            <p className="wm-stat-subtitle">{subtitle}</p>
        </div>
    );
}

export default StatCard;