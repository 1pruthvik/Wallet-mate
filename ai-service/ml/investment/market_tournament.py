import argparse
import logging
from datetime import datetime, timedelta
import numpy as np

from ml.investment.tournament import ModelTournament

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("market_tournament")


DEFAULT_UNIVERSE = [
    "RELIANCE.NS",
    "ICICIBANK.NS",
    "HDFCBANK.NS",
    "TCS.NS",
    "INFY.NS",
    "SBIN.NS",
    "LT.NS",
    "AXISBANK.NS",
    "MARUTI.NS",
    "SUNPHARMA.NS"
]


class MarketTournament:
    """
    Market-Wide Multi-Stock Tournament Engine across Indian Equity Universe.
    Evaluates candidate models across equities, market regimes, and transaction friction.
    """

    def __init__(
        self,
        symbols: list[str] = DEFAULT_UNIVERSE,
        years: int = 10,
        horizon: int = 20,
        friction_bps: float = 0.0
    ):
        self.symbols = [s.upper() for s in symbols]
        self.years = years
        self.horizon = horizon
        self.friction_bps = friction_bps

    def run_market_tournament(self) -> dict:
        logger.info(f"=== Starting Market-Wide Tournament Across {len(self.symbols)} Equities ({self.years} Years, Horizon={self.horizon}d) ===")
        symbol_results = {}
        wins = {}

        for sym in self.symbols:
            logger.info(f"\n---> Running Model Tournament for Stock: {sym}")
            try:
                tourney = ModelTournament(symbol=sym, years=self.years, horizon=self.horizon, friction_bps=self.friction_bps)
                res = tourney.run_tournament()
                symbol_results[sym] = res
                winner = res["winning_model"]
                wins[winner] = wins.get(winner, 0) + 1
            except Exception as e:
                logger.error(f"Market Tournament failed for {sym}: {e}")

        # Consolidated Master Table Output
        print("\n" + "=" * 120)
        print(f"MASTER MARKET-WIDE TOURNAMENT SUMMARY - {len(symbol_results)} NIFTY EQUITIES ({self.years} YEARS, Horizon: {self.horizon}d)")
        print("=" * 120)
        header = f"{'Symbol':<14} | {'Best Model':<20} | {'Ensemble DirAcc':<16} | {'Best DirAcc':<14} | {'Best Sharpe':<12} | {'Score':<8}"
        print(header)
        print("-" * 120)

        for sym, res in symbol_results.items():
            best_m = res["winning_model"]
            best_score = res["scores"][best_m]
            ens_acc = res["results"]["Ensemble"].directional_accuracy * 100.0
            best_acc = res["results"][best_m].directional_accuracy * 100.0
            best_sharpe = res["results"][best_m].sharpe_ratio

            print(f"{sym:<14} | {best_m:<20} | {ens_acc:<15.2f}% | {best_acc:<13.2f}% | {best_sharpe:<12.2f} | {best_score:<8.2f}")
        print("=" * 120)

        # Cross-Stock Model Performance Analysis
        print("\nCROSS-STOCK MODEL PERFORMANCE STABILITY:")
        print("-" * 80)
        model_names = ["GradientBoosting", "Chronos-Bolt", "Chronos-2", "TimesFM-2.5", "Moirai-2.0", "Ensemble"]
        for mname in model_names:
            m_accs = [res["results"][mname].directional_accuracy * 100.0 for res in symbol_results.values() if mname in res["results"]]
            m_sharpes = [res["results"][mname].sharpe_ratio for res in symbol_results.values() if mname in res["results"]]
            if m_accs:
                mean_acc = np.mean(m_accs)
                std_acc = np.std(m_accs)
                mean_sharpe = np.mean(m_sharpes)
                n_won = wins.get(mname, 0)
                print(f"{mname:<20} | Mean Accuracy: {mean_acc:5.2f}% (±{std_acc:4.2f}%) | Mean Sharpe: {mean_sharpe:5.2f} | Wins: {n_won}/{len(symbol_results)}")
        print("=" * 80 + "\n")

        return {
            "symbol_results": symbol_results,
            "wins": wins
        }


def main():
    parser = argparse.ArgumentParser(description="Run FinMitra Market-Wide Tournament Across NIFTY Equities")
    parser.add_argument("--years", type=int, default=10, help="Historical evaluation years")
    parser.add_argument("--horizon", type=int, default=20, help="Forecast horizon in trading days")
    parser.add_argument("--friction", type=float, default=0.0, help="Transaction friction cost in bps")
    args = parser.parse_args()

    tournament = MarketTournament(years=args.years, horizon=args.horizon, friction_bps=args.friction)
    tournament.run_market_tournament()


if __name__ == "__main__":
    main()
