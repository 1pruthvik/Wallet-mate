from ml.financial_health import (
    calculate_financial_health_score
)


def test_excellent_financial_health():

    budget_results = {
        "Food": {
            "status": "WITHIN_BUDGET"
        },

        "Shopping": {
            "status": "WITHIN_BUDGET"
        }
    }

    result = calculate_financial_health_score(
        savings_rate=30,
        budget_results=budget_results,
        recurring_count=1,
        total_transactions=10
    )

    assert result["score"] == 100
    assert result["status"] == "Excellent"


def test_good_financial_health():

    budget_results = {
        "Food": {
            "status": "WITHIN_BUDGET"
        },
        "Shopping": {
            "status": "OVER_BUDGET"
        }
    }

    result = calculate_financial_health_score(
        savings_rate=20,
        budget_results=budget_results,
        recurring_count=3,
        total_transactions=10
    )

    assert result["status"] == "Good"
    assert 65 <= result["score"] < 80


def test_low_savings():

    budget_results = {
        "Food": {
            "status": "OVER_BUDGET"
        }
    }

    result = calculate_financial_health_score(
        savings_rate=0,
        budget_results=budget_results,
        recurring_count=5,
        total_transactions=10
    )

    assert result["score"] == 10
    assert result["status"] == "Needs Attention"


def test_no_transactions():

    result = calculate_financial_health_score(
        savings_rate=0,
        budget_results={},
        recurring_count=0,
        total_transactions=0
    )

    assert result["score"] == 35
    assert result["status"] == "Needs Attention"