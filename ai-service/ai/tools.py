import json
import logging
from typing import Optional, Any, Dict, List
from datetime import datetime

logger = logging.getLogger(__name__)

# Function definitions metadata for Gemini Function Calling Tools
MARKET_DATA_TOOLS_SCHEMA = [
    {
        "name": "get_live_quote",
        "description": "Fetch live real-time or latest market quote for a stock symbol or company name (e.g. Apple, AAPL, ICICI Bank, ICICIBANK.NS, Reliance, NVDA). Returns price, change, volume, timestamp, and data quality.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "symbol_or_query": {
                    "type": "STRING",
                    "description": "Stock ticker symbol or company name (e.g., Apple, AAPL, ICICI Bank, ICICIBANK.NS, Reliance)"
                }
            },
            "required": ["symbol_or_query"]
        }
    },
    {
        "name": "get_live_quotes",
        "description": "Fetch live market quotes for multiple stock symbols simultaneously.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "symbols": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": "List of stock ticker symbols"
                }
            },
            "required": ["symbols"]
        }
    },
    {
        "name": "search_instruments",
        "description": "Dynamically search for supported stocks, equities, ETFs, or securities by query string or company name.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "query": {
                    "type": "STRING",
                    "description": "Search query for asset or company name (e.g. Nvidia, Tesla, Infosys)"
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "get_historical_quote",
        "description": "Fetch historical or intraday price point for a stock symbol at a specific time or date range.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "symbol_or_query": {
                    "type": "STRING",
                    "description": "Stock symbol or company name"
                },
                "timestamp": {
                    "type": "STRING",
                    "description": "Historical date or timestamp description (e.g., '2 PM yesterday', '2026-08-23')"
                }
            },
            "required": ["symbol_or_query"]
        }
    },
    {
        "name": "get_market_status",
        "description": "Check real-time market data service connection, exchange open/closed status, and streaming feeds.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "symbol_or_market": {
                    "type": "STRING",
                    "description": "Optional market name or exchange symbol (e.g. NSE, NASDAQ, NIFTY50)"
                }
            },
            "required": []
        }
    },
    {
        "name": "get_stock_ranking",
        "description": "Get current ML model quantitative predictions, expected return percentages, confidence scores, and rankings for top stocks in the investment universe.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "sector": {
                    "type": "STRING",
                    "description": "Optional sector filter, e.g. Information Tech, Banking & Financials, Energy & Retail"
                }
            },
            "required": []
        }
    }
]


class MarketDataTools:
    """
    Function calling executor that bridges Gemini tool calls directly to MarketDataProvider
    and ML Stock Predictor models.
    """

    def __init__(self, market_service: Any, predictor: Any):
        self.market_service = market_service
        self.market_provider = getattr(market_service, "provider", None)
        self.predictor = predictor
        from ml.investment.resolver import InstrumentResolver
        self.resolver = InstrumentResolver(self.market_provider) if self.market_provider else None

    def execute_tool(self, name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        """Dynamically invokes registered function tool by name."""
        logger.info(f"Executing MarketDataTool '{name}' with arguments: {args}")
        try:
            if name in ["get_live_quote", "get_live_market_quote"]:
                target = args.get("symbol_or_query") or args.get("symbol", "RELIANCE.NS")
                resolved_symbol = target.upper().strip()
                company_name = f"{resolved_symbol} Corp"
                exchange = "NSE" if resolved_symbol.endswith(".NS") else "NASDAQ"

                if self.resolver:
                    res = self.resolver.resolve_query(target)
                    if res["status"] == "SUCCESS":
                        inst = res["instrument"]
                        resolved_symbol = inst["symbol"]
                        company_name = inst.get("company", company_name)
                        exchange = inst.get("exchange", exchange)
                    elif res["status"] == "AMBIGUOUS":
                        return {
                            "status": "AMBIGUOUS",
                            "message": res["message"],
                            "matches": res["matches"]
                        }
                    elif res["status"] == "INSTRUMENT_NOT_FOUND":
                        return {
                            "status": "INSTRUMENT_NOT_FOUND",
                            "message": f"Instrument '{target}' not found in market provider."
                        }

                quote = self.market_service.fetch_live_quote(resolved_symbol)
                if quote:
                    data = quote.model_dump()
                    data["company"] = company_name
                    data["exchange"] = exchange
                    data["price"] = quote.last_price
                    return data

                return {
                    "symbol": resolved_symbol,
                    "company": company_name,
                    "exchange": exchange,
                    "status": "LIVE_DATA_UNAVAILABLE",
                    "data_quality": "UNAVAILABLE",
                    "message": f"Real-time quote unavailable for symbol '{resolved_symbol}'."
                }

            elif name == "get_live_quotes":
                symbols = args.get("symbols", [])
                quotes = self.market_service.get_all_live_quotes(symbols)
                return {
                    "count": len(quotes),
                    "quotes": [q.model_dump() for q in quotes]
                }

            elif name == "search_instruments":
                query = args.get("query", "")
                if self.resolver:
                    matches = self.resolver.search_instruments(query)
                    return {"query": query, "count": len(matches), "matches": matches}
                return {"query": query, "count": 0, "matches": []}

            elif name == "get_historical_quote":
                target = args.get("symbol_or_query") or args.get("symbol", "")
                timestamp_desc = args.get("timestamp", "")
                resolved_symbol = target.upper().strip()
                if self.resolver:
                    res = self.resolver.resolve_query(target)
                    if res["status"] == "SUCCESS":
                        resolved_symbol = res["instrument"]["symbol"]

                return {
                    "status": "HISTORICAL_DATA_UNAVAILABLE",
                    "symbol": resolved_symbol,
                    "requested_timestamp": timestamp_desc,
                    "message": f"Exact historical intraday point at '{timestamp_desc}' for '{resolved_symbol}' is currently unavailable from provider feed."
                }

            elif name == "get_market_status":
                status = self.market_service.get_market_status()
                return status.model_dump()

            elif name == "get_stock_ranking":
                sector = args.get("sector")
                symbols = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]
                rankings = []

                for sym in symbols:
                    try:
                        res = self.predictor.predict(sym)
                        quote = self.market_service.fetch_live_quote(sym)
                        rankings.append({
                            "symbol": sym.replace(".NS", ""),
                            "full_symbol": sym,
                            "current_price": quote.last_price if quote else res.current_price,
                            "change_percent": quote.change_percent if quote else 0.0,
                            "predicted_price_30d": res.predicted_price_30d,
                            "expected_return_pct": round(res.expected_return_pct, 2),
                            "probability_up": round(res.probability_up * 100, 1),
                            "confidence": res.confidence
                        })
                    except Exception as e_pred:
                        logger.warning(f"Error predicting symbol {sym}: {e_pred}")

                rankings.sort(key=lambda x: x["expected_return_pct"], reverse=True)
                return {"universe": "NIFTY_TOP_5", "total_evaluated": len(rankings), "rankings": rankings}

            elif name == "get_historical_stock_prices":
                symbol = args.get("symbol", "RELIANCE.NS")
                days = args.get("days", 30)
                end_date = datetime.now()
                start_date = end_date - timedelta(days=days)
                if self.market_provider:
                    history = self.market_provider.get_historical_prices(symbol, start_date, end_date)
                    prices = [
                        {"date": p.date.strftime("%Y-%m-%d"), "close": round(p.close, 2), "volume": p.volume}
                        for p in history
                    ]
                    return {"symbol": symbol, "days": len(prices), "history": prices[-15:]}
                return {"symbol": symbol, "status": "PROVIDER_UNAVAILABLE"}

            else:
                return {"error": f"Unknown tool: {name}"}
        except Exception as e:
            logger.error(f"Error executing tool {name}: {e}")
            return {"error": str(e), "tool": name}

    def parse_intent_and_execute(self, message: str) -> Optional[Dict[str, Any]]:
        """
        Intent classifier and tool executor bridging natural-language queries
        to real market data tools.
        """
        msg_upper = message.upper().strip()

        # Check for symbol / quote questions
        quote_keywords = ["PRICE", "QUOTE", "TRADING AT", "HOW MUCH IS", "VALUE OF", "SHOW ME", "WHAT IS"]
        if any(k in msg_upper for k in quote_keywords) or any(c in msg_upper for c in ["AAPL", "NVDA", "RELIANCE", "TCS", "INFY", "HDFC", "ICICI", "APPLE", "NVIDIA", "TESLA", "MICROSOFT"]):
            # Extract target company or symbol
            target = message
            for kw in quote_keywords:
                if kw in msg_upper:
                    idx = msg_upper.find(kw)
                    target = message[idx + len(kw):].strip(" ?.")
                    break
            if not target:
                target = message

            result = self.execute_tool("get_live_quote", {"symbol_or_query": target or "RELIANCE.NS"})
            return {
                "tool_called": "get_live_quote",
                "args": {"symbol_or_query": target},
                "result": result
            }

        elif any(k in msg_upper for k in ["RANK", "TOP STOCK", "BEST STOCK", "PREDICTION", "PREDICT"]):
            result = self.execute_tool("get_stock_ranking", {})
            return {
                "tool_called": "get_stock_ranking",
                "args": {},
                "result": result
            }

        elif any(k in msg_upper for k in ["STATUS", "MARKET OPEN", "STREAMING", "DATA QUALITY"]):
            result = self.execute_tool("get_market_status", {})
            return {
                "tool_called": "get_market_status",
                "args": {},
                "result": result
            }

        return None

