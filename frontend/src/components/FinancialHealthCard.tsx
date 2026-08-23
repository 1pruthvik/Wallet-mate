interface FinancialHealthCardProps {
    score?: number;
}

function FinancialHealthCard({
    score = 78,
}: FinancialHealthCardProps) {

    const roundedScore =
        Math.round(score);


    let message =
        "Your financial health is looking good.";


    if (roundedScore < 40) {

        message =
            "Your financial health needs attention.";

    } else if (roundedScore < 70) {

        message =
            "Your financial health is improving.";

    } else if (roundedScore < 85) {

        message =
            "Your financial health is looking good.";

    } else {

        message =
            "Excellent financial health!";
    }


    return (

        <div className="financial-health-card">

            <div>

                <p>
                    Financial Health
                </p>

                <h2>
                    {roundedScore}/100
                </h2>

                <span>
                    {message}
                </span>

            </div>


            <div className="health-score-circle">

                <span>
                    {roundedScore}
                </span>

            </div>

        </div>
    );
}


export default FinancialHealthCard;