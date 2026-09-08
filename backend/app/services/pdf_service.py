import logging
import shutil
import subprocess
from pathlib import Path
from typing import List, Tuple
from PIL import Image, ImageOps
from backend.app.core.errors import ProcessingError

logger = logging.getLogger(__name__)

# Standard paper sizes in points (72 points/inch)
PAGE_SIZES = {
    "a4": (595, 842),
    "letter": (612, 792),
}


class PdfService:
    @staticmethod
    def images_to_pdf(
        image_paths: List[Path],
        output_path: Path,
        page_size: str = "fit",  # "fit", "a4", "letter"
        orientation: str = "auto",  # "auto", "portrait", "landscape"
        margin: int = 0,
    ) -> Tuple[Path, str]:
        """
        Converts a list of image files into a single unified PDF file.
        """
        if not image_paths:
            raise ProcessingError("No image files provided for PDF creation.")

        output_path.parent.mkdir(parents=True, exist_ok=True)
        converted_images: List[Image.Image] = []

        try:
            for p in image_paths:
                with Image.open(p) as raw_img:
                    raw_img = ImageOps.exif_transpose(raw_img)
                    if raw_img.mode in ("RGBA", "LA", "P"):
                        # Flatten transparency to white background
                        bg = Image.new("RGB", raw_img.size, (255, 255, 255))
                        rgba = raw_img.convert("RGBA")
                        bg.paste(rgba, mask=rgba.split()[-1])
                        img = bg
                    elif raw_img.mode != "RGB":
                        img = raw_img.convert("RGB")
                    else:
                        img = raw_img.copy()

                # Handle page sizing if A4 or Letter requested
                page_key = page_size.lower().strip()
                if page_key in PAGE_SIZES:
                    target_w, target_h = PAGE_SIZES[page_key]
                    if orientation == "landscape" or (
                        orientation == "auto" and img.width > img.height
                    ):
                        if target_w < target_h:
                            target_w, target_h = target_h, target_w
                    elif orientation == "portrait":
                        if target_w > target_h:
                            target_w, target_h = target_h, target_w

                    # Calculate scaled size inside margins
                    avail_w = max(10, target_w - (margin * 2))
                    avail_h = max(10, target_h - (margin * 2))

                    scale = min(avail_w / img.width, avail_h / img.height)
                    new_w = max(1, int(img.width * scale))
                    new_h = max(1, int(img.height * scale))

                    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                    canvas = Image.new("RGB", (target_w, target_h), (255, 255, 255))
                    offset_x = (target_w - new_w) // 2
                    offset_y = (target_h - new_h) // 2
                    canvas.paste(resized, (offset_x, offset_y))
                    converted_images.append(canvas)
                else:
                    converted_images.append(img)

            first = converted_images[0]
            rest = converted_images[1:] if len(converted_images) > 1 else []

            first.save(
                output_path,
                "PDF",
                resolution=100.0,
                save_all=True,
                append_images=rest,
            )

            logger.info(f"Generated PDF with {len(converted_images)} pages at {output_path}")
            return output_path, "application/pdf"

        except Exception as e:
            logger.exception(f"PDF creation failed: {e}")
            raise ProcessingError(f"Failed to generate PDF: {str(e)}")

    @staticmethod
    def merge_pdfs(pdf_paths: List[Path], output_path: Path) -> Tuple[Path, str]:
        """
        Merges multiple PDF files in order into a single PDF document.
        """
        if not pdf_paths or len(pdf_paths) < 2:
            raise ProcessingError("Please provide at least two PDF files to merge.")

        output_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            from pypdf import PdfWriter

            writer = PdfWriter()
            for p in pdf_paths:
                writer.append(str(p))
            with open(output_path, "wb") as f_out:
                writer.write(f_out)
            writer.close()
            logger.info(f"Merged {len(pdf_paths)} PDFs into {output_path}")
            return output_path, "application/pdf"
        except Exception as e:
            logger.exception(f"PDF merge failed: {e}")
            raise ProcessingError(f"Failed to merge PDFs: {str(e)}")

    @staticmethod
    def pdf_to_word(pdf_path: Path, output_path: Path) -> Tuple[Path, str]:
        """
        Converts a PDF file into an editable Microsoft Word (.docx) document.
        """
        output_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            from pdf2docx import Converter

            cv = Converter(str(pdf_path))
            cv.convert(str(output_path), start=0, end=None)
            cv.close()
            logger.info(f"Converted PDF {pdf_path} to Word document {output_path}")
            return output_path, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        except Exception as e:
            logger.exception(f"PDF to Word conversion failed: {e}")
            raise ProcessingError(f"Failed to convert PDF to Word: {str(e)}")

    @staticmethod
    def word_to_pdf(word_path: Path, output_path: Path) -> Tuple[Path, str]:
        """
        Converts a Word document (.docx, .doc) into a PDF using headless LibreOffice.
        """
        output_path.parent.mkdir(parents=True, exist_ok=True)
        binary = shutil.which("libreoffice") or shutil.which("soffice")
        if not binary:
            raise ProcessingError("LibreOffice binary not found on the system.")

        try:
            outdir = output_path.parent
            profile_dir = outdir / "lo_profile"
            profile_dir.mkdir(parents=True, exist_ok=True)
            cmd = [
                binary,
                f"-env:UserInstallation=file://{profile_dir.resolve().as_posix()}",
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                str(outdir),
                str(word_path),
            ]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            if proc.returncode != 0:
                raise ProcessingError(f"LibreOffice conversion failed: {proc.stderr or proc.stdout}")

            expected_pdf = outdir / f"{word_path.stem}.pdf"
            if not expected_pdf.exists():
                raise ProcessingError("Expected PDF output was not created by LibreOffice.")

            if expected_pdf != output_path:
                expected_pdf.replace(output_path)

            shutil.rmtree(profile_dir, ignore_errors=True)

            logger.info(f"Converted Word {word_path} to PDF {output_path}")
            return output_path, "application/pdf"

        except Exception as e:
            logger.exception(f"Word to PDF conversion failed: {e}")
            raise ProcessingError(f"Failed to convert Word to PDF: {str(e)}")

    @staticmethod
    def protect_pdf(pdf_path: Path, output_path: Path, password: str) -> Tuple[Path, str]:
        """
        Encrypts and password-protects a PDF file using AES-256 encryption.
        """
        clean_password = (password or "").strip()
        if not clean_password:
            raise ProcessingError("Password cannot be empty.")

        output_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            from pypdf import PdfReader, PdfWriter

            reader = PdfReader(str(pdf_path))
            writer = PdfWriter()

            for page in reader.pages:
                writer.add_page(page)

            writer.encrypt(user_password=clean_password, owner_password=None, algorithm="AES-256")

            with open(output_path, "wb") as f_out:
                writer.write(f_out)

            logger.info(f"Protected PDF {pdf_path} saved to {output_path}")
            return output_path, "application/pdf"

        except Exception as e:
            logger.exception(f"PDF protection failed: {e}")
            raise ProcessingError(f"Failed to protect PDF: {str(e)}")


pdf_service = PdfService()
