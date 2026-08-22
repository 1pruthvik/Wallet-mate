from datetime import datetime
from typing import Optional

from ml.investment.schemas import NewsSignal


class SentimentProvider:
    """
    Market News & Sentiment Signal Provider.
    Extracts sentiment from market headlines and financial news signals.
    """

    MOCK_SENTIMENTS = {
        "RELIANCE": NewsSignal(
            symbol="RELIANCE",
            headline="Reliance expands green energy investment portfolio with new solar initiative",
            sentiment="positive",
            sentiment_score=0.65,
            source="Financial Express",
            published_at=datetime.now(),
        ),
        "TCS": NewsSignal(
            symbol="TCS",
            headline="TCS signs multi-year digital transformation deal with European enterprise",
            sentiment="positive",
            sentiment_score=0.72,
            source="Economic Times",
            published_at=datetime.now(),
        ),
        "INFY": NewsSignal(
            symbol="INFY",
            headline="Infosys reports steady quarter with expanding cloud services margin",
            sentiment="neutral",
            sentiment_score=0.15,
            source="Mint",
            published_at=datetime.now(),
        ),
    }

    def get_sentiment(self, symbol: str) -> NewsSignal:
        clean_symbol = symbol.upper().strip()
        if clean_symbol in self.MOCK_SENTIMENTS:
            return self.MOCK_SENTIMENTS[clean_symbol]

        return NewsSignal(
            symbol=clean_symbol,
            headline=f"No recent news signals recorded for {clean_symbol}",
            sentiment="neutral",
            sentiment_score=0.0,
            source="FinMitra Market Monitor",
            published_at=datetime.now(),
        )
