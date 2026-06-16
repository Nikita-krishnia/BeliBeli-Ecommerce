from whitenoise.storage import StaticFilesStorage
import logging

logger = logging.getLogger(__name__)

class CustomWhiteNoiseStorage(StaticFilesStorage):
    """
    WhiteNoise static files storage without compression.
    Handles missing Django admin SVG icons gracefully.
    For production compression, configure on the server side (Render/CDN).
    """
    
    def hashed_name(self, name, content=None, filename=None):
        try:
            return super().hashed_name(name, content, filename)
        except Exception as e:
            logger.warning(f"Skipping missing file '{name}': {e}")
            return name