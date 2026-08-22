from ml.evaluator import evaluate_classifier


def test_classifier_accuracy():

    results = evaluate_classifier()

    assert results["accuracy"] >= 0.80


def test_classifier_precision():

    results = evaluate_classifier()

    assert results["precision"] >= 0.80


def test_classifier_recall():

    results = evaluate_classifier()

    assert results["recall"] >= 0.80


def test_classifier_f1():

    results = evaluate_classifier()

    assert results["f1_score"] >= 0.80