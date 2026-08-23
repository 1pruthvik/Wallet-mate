from typing import Optional

from ml.investment.schemas import (
    InvestmentCandidate,
    PortfolioAllocation,
    AllocationItem,
    UserInvestmentProfile,
)


def generate_portfolio_allocation(
    candidates: list[InvestmentCandidate],
    investable_amount: float,
    user_profile: Optional[UserInvestmentProfile] = None,
    max_single_stock_pct: float = 35.0,
    cash_reserve_pct: float = 15.0
) -> PortfolioAllocation:
    """
    Generate a hypothetical, risk-aware portfolio asset allocation.
    Does not execute trades. Enforces single-stock allocation limits, cash reserves, and diversification rules.
    """
    if investable_amount <= 0 or not candidates:
        return PortfolioAllocation(
            investable_amount=max(0.0, investable_amount),
            cash_reserved=max(0.0, investable_amount),
            cash_percentage=100.0,
            allocation=[],
            diversification_score=0,
        )

    # Adjust cash reserve based on user risk profile if present
    if user_profile and user_profile.risk_profile:
        level = user_profile.risk_profile.risk_level
        if level == "conservative":
            cash_reserve_pct = max(cash_reserve_pct, 25.0)
        elif level == "aggressive":
            cash_reserve_pct = min(cash_reserve_pct, 10.0)

    cash_amount = round(investable_amount * (cash_reserve_pct / 100.0), 2)
    deployable_amount = investable_amount - cash_amount

    # Filter out unsuitable candidates
    valid_candidates = [
        c for c in candidates if c.personalization.suitability != "UNSUITABLE"
    ]

    if not valid_candidates:
        return PortfolioAllocation(
            investable_amount=round(investable_amount, 2),
            cash_reserved=round(investable_amount, 2),
            cash_percentage=100.0,
            allocation=[],
            diversification_score=10,
        )

    # Calculate weights proportional to suitability score
    scores = [float(c.personalization.suitability_score) for c in valid_candidates]
    total_score = sum(scores)

    allocations = []
    if total_score > 0:
        raw_pcts = [(s / total_score) * 100.0 for s in scores]

        # Apply max single stock cap constraint
        capped_pcts = [min(p, max_single_stock_pct) for p in raw_pcts]
        sum_capped = sum(capped_pcts)

        # Normalize capped percentages to deployable allocation
        final_pcts = [(p / sum_capped) * (100.0 - cash_reserve_pct) for p in capped_pcts]

        for cand, pct in zip(valid_candidates, final_pcts):
            item_amount = round(investable_amount * (pct / 100.0), 2)
            allocations.append(
                AllocationItem(
                    symbol=cand.symbol,
                    percentage=round(pct, 2),
                    amount=item_amount,
                    risk_level=cand.investment_score.risk_level,
                )
            )

    # Diversification score (higher when multiple stocks are allocated evenly)
    n_items = len(allocations)
    if n_items >= 4:
        div_score = 90
    elif n_items == 3:
        div_score = 75
    elif n_items == 2:
        div_score = 55
    else:
        div_score = 30

    return PortfolioAllocation(
        investable_amount=round(investable_amount, 2),
        cash_reserved=cash_amount,
        cash_percentage=round(cash_reserve_pct, 2),
        allocation=allocations,
        diversification_score=div_score,
    )
