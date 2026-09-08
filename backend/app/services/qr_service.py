import logging
from pathlib import Path
from typing import Tuple
import qrcode
from backend.app.core.errors import ProcessingError

logger = logging.getLogger(__name__)

ERROR_CORRECTION_MAP = {
    "l": qrcode.constants.ERROR_CORRECT_L,
    "m": qrcode.constants.ERROR_CORRECT_M,
    "q": qrcode.constants.ERROR_CORRECT_Q,
    "h": qrcode.constants.ERROR_CORRECT_H,
}


class QrService:
    @staticmethod
    def generate_qr(
        data: str,
        output_path: Path,
        format_choice: str = "png",
        scale: int = 10,
        border: int = 4,
        foreground_color: str = "#000000",
        background_color: str = "#ffffff",
        error_correction: str = "m",
    ) -> Tuple[Path, str]:
        """
        Generates a custom QR code saved to output_path.
        """
        clean_data = (data or "").strip()
        if not clean_data:
            raise ProcessingError("No text or URL provided for QR code generation.")

        output_path.parent.mkdir(parents=True, exist_ok=True)
        ec_level = ERROR_CORRECTION_MAP.get(error_correction.lower().strip(), qrcode.constants.ERROR_CORRECT_M)

        try:
            qr = qrcode.QRCode(
                version=None,
                error_correction=ec_level,
                box_size=max(2, min(40, scale)),
                border=max(1, min(10, border)),
            )
            qr.add_data(clean_data)
            qr.make(fit=True)

            img = qr.make_image(
                fill_color=foreground_color or "#000000",
                back_color=background_color or "#ffffff",
            )

            img.save(str(output_path))
            mime = "image/png" if output_path.suffix.lower() == ".png" else "image/svg+xml"
            return output_path, mime
        except Exception as e:
            logger.exception(f"QR code generation failed: {e}")
            raise ProcessingError(f"Failed to generate QR code: {str(e)}")


qr_service = QrService()
