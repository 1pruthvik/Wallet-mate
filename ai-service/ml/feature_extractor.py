from sklearn.feature_extraction.text import TfidfVectorizer


class TransactionFeatureExtractor:
    """
    Converts transaction text into numerical TF-IDF features.
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            ngram_range=(1, 2)
        )

    def build_text(
        self,
        merchant: str | None,
        description: str | None
    ) -> str:
        """
        Combine merchant and description into
        one text string for ML processing.
        """

        merchant_text = merchant or ""
        description_text = description or ""

        return f"{merchant_text} {description_text}".strip()

    def fit_transform(
        self,
        merchants: list[str | None],
        descriptions: list[str | None]
    ):
        """
        Learn vocabulary from transactions and
        convert them into numerical TF-IDF features.
        """

        texts = [
            self.build_text(merchant, description)
            for merchant, description
            in zip(merchants, descriptions)
        ]

        return self.vectorizer.fit_transform(texts)

    def transform(
        self,
        merchants: list[str | None],
        descriptions: list[str | None]
    ):
        """
        Convert new transactions using the
        vocabulary already learned during training.
        """

        texts = [
            self.build_text(merchant, description)
            for merchant, description
            in zip(merchants, descriptions)
        ]

        return self.vectorizer.transform(texts)