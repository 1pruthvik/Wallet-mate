import sys
import pytest
from unittest.mock import MagicMock, patch

# Ensure mock modules exist in sys.modules for testing when heavy torch dependencies are not installed locally
if "chronos" not in sys.modules:
    mock_chronos = MagicMock()
    mock_chronos.BaseChronosPipeline = MagicMock()
    sys.modules["chronos"] = mock_chronos

if "timesfm" not in sys.modules:
    mock_timesfm = MagicMock()
    mock_timesfm.TimesFM_2p5_200M_torch = MagicMock()
    sys.modules["timesfm"] = mock_timesfm

from ml.investment.models.chronos2_predictor import Chronos2Predictor
from ml.investment.models.timesfm_predictor import TimesFM25Predictor
from ml.investment.models.moirai_predictor import Moirai2Predictor
from ml.investment.models.foundation_predictor import FinancialFoundationPredictor
from ml.investment.download_models import download_and_cache_models
from ml.investment.model_status import check_model_status


def test_chronos2_import():
    """Verify Chronos-2 model adapter imports and initializes without error."""
    with patch("chronos.BaseChronosPipeline.from_pretrained", return_value=MagicMock()):
        predictor = Chronos2Predictor(model_id="amazon/chronos-2")
        meta = predictor.get_model_metadata()
        assert meta["model_version"] == "2.0.0"
        assert predictor.is_available is True


def test_timesfm_import():
    """Verify TimesFM 2.5 PyTorch adapter imports and initializes without error."""
    with patch("timesfm.TimesFM_2p5_200M_torch.from_pretrained", return_value=MagicMock()):
        predictor = TimesFM25Predictor(model_id="google/timesfm-2.5-200m-pytorch")
        meta = predictor.get_model_metadata()
        assert meta["model_version"] == "2.5.0"
        assert predictor.is_available is True


def test_moirai_import():
    """Verify Moirai 2.0 adapter degrades gracefully to FALLBACK/UNAVAILABLE."""
    predictor = Moirai2Predictor()
    meta = predictor.get_model_metadata()
    assert meta["status"] in ["FALLBACK", "UNAVAILABLE"]


def test_model_caching():
    """Verify process-level singleton caching for predictor instances."""
    mock_pipe = MagicMock()
    with patch("chronos.BaseChronosPipeline.from_pretrained", return_value=mock_pipe):
        p1 = Chronos2Predictor(model_id="amazon/chronos-2-cache-test")
        p2 = Chronos2Predictor(model_id="amazon/chronos-2-cache-test")
        assert p1.pipeline is p2.pipeline


def test_model_download_manager(capsys):
    """Verify download manager script runs fast without errors."""
    with patch("chronos.BaseChronosPipeline.from_pretrained", return_value=MagicMock()), \
         patch("timesfm.TimesFM_2p5_200M_torch.from_pretrained", return_value=MagicMock()):
        download_and_cache_models()
        captured = capsys.readouterr()
        assert "FINMITRA FOUNDATION MODEL SETUP" in captured.out
        assert "SETUP COMPLETE" in captured.out


def test_model_status(capsys):
    """Verify model status report generator prints table cleanly."""
    with patch("chronos.BaseChronosPipeline.from_pretrained", return_value=MagicMock()), \
         patch("timesfm.TimesFM_2p5_200M_torch.from_pretrained", return_value=MagicMock()):
        check_model_status()
        captured = capsys.readouterr()
        assert "Import" in captured.out
        assert "Weights" in captured.out
        assert "Inference" in captured.out
