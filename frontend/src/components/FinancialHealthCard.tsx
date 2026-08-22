function FinancialHealthCard() {
    const score = 78;

    return (
        <div className="health-card">
            <div>
                <p className="stat-title">
                    Financial Health
                </p>

                <h2>{score}/100</h2>

                <p>
                    Your financial health is looking good.
                </p>
            </div>

            <div className="health-score">
                {score}
            </div>
        </div>
    );
}

export default FinancialHealthCard;