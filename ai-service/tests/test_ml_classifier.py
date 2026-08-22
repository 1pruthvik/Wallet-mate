from ml.ml_classifier import TransactionMLClassifier


def test_ml_classifier_training():

    classifier = TransactionMLClassifier()

    classifier.train()

    assert classifier.trained is True


def test_food_prediction():

    classifier = TransactionMLClassifier()
    classifier.train()

    prediction = classifier.predict(
        "STARBUCKS",
        "Coffee purchase"
    )

    assert prediction == "Food"


def test_shopping_prediction():

    classifier = TransactionMLClassifier()
    classifier.train()

    prediction = classifier.predict(
        "DMART",
        "Grocery shopping"
    )

    assert prediction == "Shopping"


def test_travel_prediction():

    classifier = TransactionMLClassifier()
    classifier.train()

    prediction = classifier.predict(
        "UBER",
        "Cab ride"
    )

    assert prediction == "Travel"


def test_subscription_prediction():

    classifier = TransactionMLClassifier()
    classifier.train()

    prediction = classifier.predict(
        "NETFLIX",
        "Monthly streaming subscription"
    )

    assert prediction == "Subscription"