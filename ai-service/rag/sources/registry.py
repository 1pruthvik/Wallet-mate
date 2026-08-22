class SourceTrustRegistry:
    """
    Registry for source authority weighting and priority.
    Prioritizes regulatory, official filings, and trusted educational sources over general web text.
    """

    SOURCE_WEIGHTS = {
        "regulatory": 1.5,
        "government": 1.4,
        "exchange": 1.3,
        "company_filing": 1.3,
        "financial_education": 1.1,
        "research": 1.0,
        "user_document": 0.9,
        "general_web": 0.8,
    }

    @classmethod
    def get_weight(cls, source_type: str) -> float:
        clean = source_type.lower().strip() if source_type else ""
        return cls.SOURCE_WEIGHTS.get(clean, 1.0)
