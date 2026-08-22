import re


MERCHANT_ALIASES = {
    "SWIGGY": [
        "swiggy",
        "swiggy india",
        "swiggy online",
        "swiggy pvt ltd"
    ],

    "ZOMATO": [
        "zomato",
        "zomato ltd",
        "zomato limited"
    ],

    "AMAZON": [
        "amazon",
        "amazon india",
        "amazon.in",
        "amazon seller"
    ],

    "FLIPKART": [
        "flipkart",
        "flipkart india",
        "flipkart pvt ltd"
    ],

    "MYNTRA": [
        "myntra",
        "myntra designs"
    ],

    "UBER": [
        "uber",
        "uber india",
        "uber trip"
    ],

    "OLA": [
        "ola",
        "ola cabs",
        "olacabs"
    ]
}


def clean_merchant_name(name: str) -> str:
    """
    Basic cleaning before merchant matching.
    """

    name = name.upper().strip()

    # Replace special characters with spaces
    name = re.sub(r"[^A-Z0-9 ]", " ", name)

    # Remove extra spaces
    name = re.sub(r"\s+", " ", name)

    return name.strip()


def normalize_merchant(name: str | None) -> str | None:
    """
    Convert different merchant names
    into a standard FinMitra merchant name.
    """

    if not name:
        return None

    cleaned_name = clean_merchant_name(name)

    for standard_name, aliases in MERCHANT_ALIASES.items():

        for alias in aliases:

            cleaned_alias = clean_merchant_name(alias)

            if cleaned_alias in cleaned_name:
                return standard_name

    return cleaned_name