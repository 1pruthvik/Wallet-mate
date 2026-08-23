from ml.budget_analyzer import analyze_budget


def test_within_budget():

    spending = {
        "Food": 1000
    }

    budgets = {
        "Food": 3000
    }

    result = analyze_budget(
        spending,
        budgets
    )

    assert result["Food"]["status"] == "WITHIN_BUDGET"
    assert result["Food"]["usage_percent"] == 33.33
    assert result["Food"]["remaining"] == 2000


def test_near_budget_limit():

    spending = {
        "Food": 2500
    }

    budgets = {
        "Food": 3000
    }

    result = analyze_budget(
        spending,
        budgets
    )

    assert result["Food"]["status"] == "NEAR_LIMIT"
    assert result["Food"]["usage_percent"] == 83.33


def test_over_budget():

    spending = {
        "Food": 4500
    }

    budgets = {
        "Food": 3000
    }

    result = analyze_budget(
        spending,
        budgets
    )

    assert result["Food"]["status"] == "OVER_BUDGET"
    assert result["Food"]["usage_percent"] == 150.0
    assert result["Food"]["remaining"] == -1500


def test_category_without_budget():

    spending = {
        "Food": 2000
    }

    budgets = {}

    result = analyze_budget(
        spending,
        budgets
    )

    assert result["Food"]["status"] == "NO_BUDGET"
    assert result["Food"]["budget"] == 0.0


def test_budget_without_spending():

    spending = {}

    budgets = {
        "Food": 3000
    }

    result = analyze_budget(
        spending,
        budgets
    )

    assert result["Food"]["spent"] == 0.0
    assert result["Food"]["remaining"] == 3000
    assert result["Food"]["status"] == "WITHIN_BUDGET"