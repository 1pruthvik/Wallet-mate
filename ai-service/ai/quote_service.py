import re
from datetime import datetime, timezone
from typing import Dict, Optional, Any
from ml.investment.market_data.base import MarketDataProvider
from ml.investment.resolver import InstrumentResolver


class MarketQuoteService:
    """
    Market Quote Service orchestrating natural-language intent parsing,
    InstrumentResolver, and MarketDataProvider live/historical price fetching.
    Guarantees NO FABRICATION of prices or tickers.
    """

    def __init__(self, provider: MarketDataProvider):
        self.provider = provider
        self.resolver = InstrumentResolver(provider)

    def extract_intent_and_entity(self, query: str) -> Dict[str, str]:
        """Extract intent and target asset entity from natural language query."""
        clean_q = query.strip()

        # Check for historical timestamp patterns
        is_historical = bool(re.search(r'yesterday|last month|at \d+|on \w+ \d+', clean_q, re.IGNORECASE))
        intent = "HISTORICAL_QUOTE" if is_historical else "MARKET_QUOTE"

        # Remove historical temporal qualifiers first for clean entity extraction
        clean_entity_source = re.sub(r'at \d+ ?(?:pm|am)?|yesterday|last month|on [a-zA-Z]+ \d+', '', clean_q, flags=re.IGNORECASE).strip()

        patterns = [
            r'what is (.+?)(?: trading at| price| current value|\?|$)',
            r'current price of (.+?)(?:\?|$)',
            r'show me (.+?)(?:\?|$)',
            r'how much is (.+?)(?:\?|$)',
            r'price of (.+?)(?:\?|$)',
            r'what was (.+?)(?: price|\?|$)',
            r'(.+?) price',
            r'(.+?) current value'
        ]

        entity = clean_entity_source
        for pat in patterns:
            match = re.search(pat, clean_entity_source, re.IGNORECASE)
            if match:
                extracted = match.group(1).strip()
                if extracted:
                    entity = extracted
                    break

        return {"intent": intent, "entity": entity}


    def process_quote_query(self, query: str) -> Dict[str, Any]:
        """Process natural language quote query without fabrication."""
        intent_info = self.extract_intent_and_entity(query)
        intent = intent_info["intent"]
        entity = intent_info["entity"]

        # Resolve instrument dynamically
        resolved = self.resolver.resolve_query(entity)

        if resolved["status"] == "AMBIGUOUS":
            return {
                "status": "AMBIGUOUS",
                "message": resolved["message"],
                "matches": resolved["matches"]
            }

        if resolved["status"] != "SUCCESS":
            return {
                "status": "INSTRUMENT_NOT_FOUND",
                "message": f"Could not find or resolve stock/asset for query '{entity}'."
            }

        instrument = resolved["instrument"]
        symbol = instrument["symbol"]
        exchange = instrument.get("exchange", "UNKNOWN")

        # Provider capability check
        if not self.provider.supports_market(exchange):
            return {
                "status": "UNSUPPORTED_ASSET",
                "message": f"Market '{exchange}' is not supported by the configured market data provider.",
                "instrument": instrument
            }

        if intent == "HISTORICAL_QUOTE":
            # Historical intraday lookup fallback
            return {
                "status": "HISTORICAL_DATA_UNAVAILABLE",
                "message": f"Exact intraday timestamp data for '{symbol}' is unavailable from configured market data provider.",
                "instrument": instrument
            }

        # Fetch current quote from provider
        try:
            snapshot = self.provider.get_latest_price(symbol)
            if not snapshot or snapshot.latest_price is None or snapshot.latest_price <= 0:
                return {
                    "status": "LIVE_DATA_UNAVAILABLE",
                    "message": f"Real-time market quote is currently unavailable for '{symbol}'.",
                    "instrument": instrument
                }

            return {
                "status": "SUCCESS",
                "symbol": symbol,
                "company": instrument.get("company", symbol),
                "exchange": exchange,
                "price": snapshot.latest_price,
                "current_price": snapshot.latest_price,
                "change": snapshot.price_change_24h,
                "change_percent": snapshot.price_change_pct_24h,
                "timestamp": snapshot.last_updated.isoformat() if hasattr(snapshot.last_updated, "isoformat") else str(snapshot.last_updated),
                "data_source": self.provider.__class__.__name__,
                "data_quality": getattr(snapshot, "data_quality", "LIVE")
            }
        except Exception as e:
            return {
                "status": "LIVE_DATA_UNAVAILABLE",
                "message": f"Failed to fetch market quote for '{symbol}': {str(e)}",
                "instrument": instrument
            }
