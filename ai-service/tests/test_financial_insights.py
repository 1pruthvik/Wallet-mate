from ml.financial_insights import generate_budget_insights


def test_over_budget_insight():

    budget_results = {
        "Food": {
            "spent": 4500,
            "budget": 3000,
            "remaining": -1500,
            "usage_percent": 150.0,
            "status": "OVER_BUDGET"
        }
    }

    insights = generate_budget_insights(
        budget_results
    )

    assert len(insights) == 1

    assert (
        "exceeded your Food budget"
        in insights[0]
    )

    assert "1500.00" in insights[0]


def test_near_limit_insight():

    budget_results = {
        "Travel": {
            "spent": 2500,
            "budget": 3000,
            "remaining": 500,
            "usage_percent": 83.33,
            "status": "NEAR_LIMIT"
        }
    }

    insights = generate_budget_insights(
        budget_results
    )

    assert len(insights) == 1

    assert "Travel spending" in insights[0]
    assert "83%" in insights[0]
    assert "500.00 remains" in insights[0]


def test_within_budget_insight():

    budget_results = {
        "Shopping": {
            "spent": 1000,
            "budget": 5000,
            "remaining": 4000,
            "usage_percent": 20.0,
            "status": "WITHIN_BUDGET"
        }
    }

    insights = generate_budget_insights(
        budget_results
    )

    assert len(insights) == 1

    assert "Shopping spending" in insights[0]
    assert "4000.00 remaining" in insights[0]


def test_no_budget_insight():

    budget_results = {
        "Entertainment": {
            "spent": 1500,
            "budget": 0,
            "remaining": 0,
            "usage_percent": None,
            "status": "NO_BUDGET"
        }
    }

    insights = generate_budget_insights(
        budget_results
    )

    assert len(insights) == 1

    assert "no budget set" in insights[0]
    assert "Entertainment" in insights[0]


def test_multiple_insights():

    budget_results = {
        "Food": {
            "spent": 4500,
            "budget": 3000,
            "remaining": -1500,
            "usage_percent": 150.0,
            "status": "OVER_BUDGET"
        },
        "Travel": {
            "spent": 2500,
            "budget": 3000,
            "remaining": 500,
            "usage_percent": 83.33,
            "status": "NEAR_LIMIT"
        },
        "Shopping": {
            "spent": 1000,
            "budget": 5000,
            "remaining": 4000,
            "usage_percent": 20.0,
            "status": "WITHIN_BUDGET"
        }
    }

    insights = generate_budget_insights(
        budget_results
    )

    assert len(insights) == 3