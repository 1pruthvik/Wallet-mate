import re
from typing import Dict, List, Optional, Any
from ml.investment.market_data.base import MarketDataProvider


# Small non-exclusive alias helper dictionary for common naming variations
COMMON_ALIASES = {
    "APPLE": "AAPL",
    "APPLE INC": "AAPL",
    "NVIDIA": "NVDA",
    "NVIDIA CORP": "NVDA",
    "MICROSOFT": "MSFT",
    "TESLA": "TSLA",
    "AMAZON": "AMZN",
    "GOOGLE": "GOOGL",
    "ALPHABET": "GOOGL",
    "INFOSYS": "INFY.NS",
    "INFY": "INFY.NS",
    "RELIANCE": "RELIANCE.NS",
    "RELIANCE INDUSTRIES": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "TATA CONSULTANCY SERVICES": "TCS.NS",
    "TATA MOTORS": "TATAMOTORS.NS",
    "HDFC BANK": "HDFCBANK.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "ICICI BANK": "ICICIBANK.NS",
    "ICICIBANK": "ICICIBANK.NS",
}


class InstrumentResolver:
    """
    Dynamic Instrument Resolver using Market Data Provider capabilities.
    Resolves company names, symbols, and tickers to provider-backed instrument details.
    Does NOT maintain a hard-coded list as the source of truth.
    """

    def __init__(self, provider: MarketDataProvider):
        self.provider = provider

    def search_instruments(self, query: str) -> List[Dict[str, Any]]:
        """Search instruments dynamically via configured provider."""
        if not query or not query.strip():
            return []
        return self.provider.search_instruments(query.strip())

    def get_instrument_details(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch instrument details for specified symbol."""
        clean_symbol = symbol.upper().strip()
        matches = self.search_instruments(clean_symbol)
        for item in matches:
            if item["symbol"].upper() == clean_symbol or item["symbol"].upper().startswith(clean_symbol + "."):
                return item
        if matches:
            return matches[0]
        return None

    def resolve_symbol(self, query: str) -> Dict[str, Any]:
        """Resolve a stock ticker symbol (e.g. AAPL, NVDA, INFY.NS)."""
        clean_q = query.upper().strip()
        matches = self.search_instruments(clean_q)

        for item in matches:
            if item["symbol"].upper() == clean_q:
                return {"status": "SUCCESS", "instrument": item}

        if matches:
            return {"status": "SUCCESS", "instrument": matches[0]}

        return {"status": "INSTRUMENT_NOT_FOUND", "message": f"No instrument found for symbol '{query}'."}

    def resolve_company_name(self, query: str) -> Dict[str, Any]:
        """Resolve a company name (e.g. Apple, Nvidia, Infosys, Tata Motors)."""
        clean_q = query.upper().strip()

        # Check alias helper map
        alias_sym = COMMON_ALIASES.get(clean_q)
        if alias_sym:
            details = self.get_instrument_details(alias_sym)
            if details:
                return {"status": "SUCCESS", "instrument": details}

        matches = self.search_instruments(clean_q)

        if not matches:
            return {"status": "INSTRUMENT_NOT_FOUND", "message": f"No instrument found matching '{query}'."}

        # Check for exact company match
        exact_matches = [m for m in matches if m["company"].upper() == clean_q or m["symbol"].upper() == clean_q]
        if len(exact_matches) == 1:
            return {"status": "SUCCESS", "instrument": exact_matches[0]}

        # If multiple ambiguous matches found
        if len(matches) > 1 and not alias_sym:
            return {
                "status": "AMBIGUOUS",
                "message": f"Multiple instruments match '{query}'. Please select the intended asset.",
                "matches": matches
            }

        return {"status": "SUCCESS", "instrument": matches[0]}

    def resolve_query(self, query: str) -> Dict[str, Any]:
        """
        Universal query resolver handling symbol, company name, exchange-qualified queries, and ambiguous matches.
        """
        clean_q = query.strip()
        if not clean_q:
            return {"status": "INSTRUMENT_NOT_FOUND", "message": "Query string is empty."}

        # Handle exchange prefix/suffix (e.g. NASDAQ:AAPL or INFY.NS)
        if ":" in clean_q:
            parts = clean_q.split(":")
            clean_q = parts[1]
        elif "." in clean_q and clean_q.split(".")[-1].upper() in ["NS", "BO"]:
            clean_q = clean_q

        # First try symbol resolution
        sym_res = self.resolve_symbol(clean_q)
        if sym_res["status"] == "SUCCESS":
            return sym_res

        # Fallback to company name resolution
        return self.resolve_company_name(clean_q)
