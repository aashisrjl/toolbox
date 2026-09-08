import logging
from pathlib import Path
from typing import Tuple, Optional
from PIL import Image, ImageOps
from backend.app.core.errors import ProcessingError

logger = logging.getLogger(__name__)

# Register HEIF/AVIF opener if available
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    pass

FORMAT_MAP = {
    "png": ("PNG", "image/png", ".png"),
    "jpg": ("JPEG", "image/jpeg", ".jpg"),
    "jpeg": ("JPEG", "image/jpeg", ".jpg"),
    "webp": ("WEBP", "image/webp", ".webp"),
    "avif": ("AVIF", "image/avif", ".avif"),
}


def prepare_for_format(img: Image.Image, target_pil_format: str) -> Image.Image:
    """Prepares image mode (e.g. RGBA to RGB for JPEG) before saving."""
    if target_pil_format == "JPEG":
        if img.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            rgba_img = img.convert("RGBA")
            background.paste(rgba_img, mask=rgba_img.split()[-1])
            return background
        elif img.mode != "RGB":
            return img.convert("RGB")
    return img


class ImageService:
    @staticmethod
    def remove_background(input_path: Path, output_path: Path) -> Path:
        try:
            import rembg

            with Image.open(input_path) as img:
                img = ImageOps.exif_transpose(img)
                logger.info(f"Removing background from image {input_path}")
                try:
                    output_image = rembg.remove(img, post_process_mask=True, alpha_matting=True)
                except Exception:
                    output_image = rembg.remove(img, post_process_mask=True)
                output_image.save(output_path, format="PNG", optimize=True)

            return output_path
        except Exception as e:
            logger.exception(f"Error removing background from {input_path}: {e}")
            raise ProcessingError(f"Failed to remove background: {str(e)}")

    @staticmethod
    def compress(
        input_path: Path,
        output_path: Path,
        quality: int = 75,
        target_format: str = "auto",
    ) -> Tuple[Path, str]:
        """
        Compresses an image file to reduce size while preserving visual quality.
        Returns (output_path, mime_type).
        """
        try:
            quality = max(10, min(quality, 95))
            with Image.open(input_path) as img:
                img = ImageOps.exif_transpose(img)
                orig_format = (img.format or "JPEG").lower()

                if target_format == "auto" or not target_format:
                    fmt_key = "jpg" if orig_format in ("jpeg", "jpg") else orig_format
                else:
                    fmt_key = target_format.lower()

                pil_format, mime_type, ext = FORMAT_MAP.get(fmt_key, ("JPEG", "image/jpeg", ".jpg"))
                img = prepare_for_format(img, pil_format)

                save_kwargs = {"optimize": True}
                if pil_format in ("JPEG", "WEBP", "AVIF"):
                    save_kwargs["quality"] = quality
                    if pil_format == "JPEG":
                        save_kwargs["progressive"] = True
                elif pil_format == "PNG":
                    save_kwargs["compress_level"] = 9
                    if quality < 80 and img.mode in ("RGB", "RGBA"):
                        img = img.convert("P", palette=Image.Palette.ADAPTIVE, colors=128 if quality < 60 else 256)

                img.save(output_path, format=pil_format, **save_kwargs)

            return output_path, mime_type
        except Exception as e:
            logger.exception(f"Error compressing image {input_path}: {e}")
            raise ProcessingError(f"Failed to compress image: {str(e)}")

    @staticmethod
    def convert(
        input_path: Path,
        output_path: Path,
        target_format: str,
    ) -> Tuple[Path, str]:
        """
        Converts an image to another format (PNG, JPEG, WEBP, AVIF).
        Returns (output_path, mime_type).
        """
        try:
            fmt_key = target_format.lower()
            pil_format, mime_type, _ = FORMAT_MAP.get(fmt_key, ("WEBP", "image/webp", ".webp"))

            with Image.open(input_path) as img:
                img = ImageOps.exif_transpose(img)
                img = prepare_for_format(img, pil_format)
                img.save(output_path, format=pil_format, optimize=True)

            return output_path, mime_type
        except Exception as e:
            logger.exception(f"Error converting image {input_path} to {target_format}: {e}")
            raise ProcessingError(f"Failed to convert image: {str(e)}")

    @staticmethod
    def resize(
        input_path: Path,
        output_path: Path,
        mode: str = "resize",
        width: int = 1280,
        height: int = 720,
        keep_aspect: bool = True,
    ) -> Tuple[Path, str]:
        """
        Resizes or crops an image.
        Returns (output_path, mime_type).
        """
        try:
            width = max(1, min(width, 10000))
            height = max(1, min(height, 10000))

            with Image.open(input_path) as img:
                img = ImageOps.exif_transpose(img)
                orig_format = img.format or "PNG"
                mime_type = Image.MIME.get(orig_format, "image/png")

                if mode == "crop":
                    # Crop to exact dimensions centering the subject
                    result = ImageOps.fit(img, (width, height), method=Image.Resampling.LANCZOS)
                else:
                    if keep_aspect:
                        # Scale down / up within box maintaining aspect ratio
                        img_copy = img.copy()
                        img_copy.thumbnail((width, height), Image.Resampling.LANCZOS)
                        result = img_copy
                    else:
                        result = img.resize((width, height), Image.Resampling.LANCZOS)

                result.save(output_path, format=orig_format, optimize=True)

            return output_path, mime_type
        except Exception as e:
            logger.exception(f"Error resizing image {input_path}: {e}")
            raise ProcessingError(f"Failed to resize image: {str(e)}")

    @staticmethod
    def create_collage(
        image_paths: list[Path],
        output_path: Path,
        layout: str = "auto",
        spacing: int = 16,
        border_radius: int = 0,
        bg_color: str = "#ffffff",
        aspect_ratio: str = "1:1",
        output_format: str = "png",
    ) -> Tuple[Path, str]:
        """
        Creates an aesthetic photo collage from strictly 2, 3, or 4 images.
        Returns (output_path, mime_type).
        """
        from PIL import ImageDraw

        num_photos = len(image_paths)
        if num_photos not in (2, 3, 4):
            raise ProcessingError(f"Image collage strictly requires 2, 3, or 4 photos. Received {num_photos}.")

        # Dimensions by aspect ratio
        ratio_map = {
            "1:1": (1200, 1200),
            "4:3": (1200, 900),
            "16:9": (1280, 720),
            "9:16": (720, 1280),
            "3:4": (900, 1200),
        }
        canvas_w, canvas_h = ratio_map.get(aspect_ratio, (1200, 1200))

        # Clamp parameters
        spacing = max(0, min(spacing, 80))
        border_radius = max(0, min(border_radius, 80))

        # Parse background color
        def _parse_color(c_str: str) -> tuple[int, int, int, int]:
            s = (c_str or "").strip().lower()
            if s in ("transparent", "none", "rgba(0,0,0,0)"):
                return (0, 0, 0, 0)
            s = s.lstrip("#")
            if len(s) == 3:
                s = "".join(c * 2 for c in s)
            if len(s) == 6:
                try:
                    return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16), 255)
                except ValueError:
                    pass
            return (255, 255, 255, 255)

        bg_rgba = _parse_color(bg_color)

        # Normalize layout
        layout = (layout or "auto").lower()
        if layout == "auto":
            if num_photos == 2:
                layout = "side_by_side"
            elif num_photos == 3:
                layout = "top1_bottom2"
            else:
                layout = "grid_2x2"

        # Calculate bounding boxes (x, y, w, h) for each photo slot
        boxes: list[tuple[int, int, int, int]] = []

        if num_photos == 2:
            if layout == "stacked":
                avail_h = canvas_h - 3 * spacing
                slot_h = avail_h // 2
                slot_w = canvas_w - 2 * spacing
                boxes = [
                    (spacing, spacing, slot_w, slot_h),
                    (spacing, spacing * 2 + slot_h, slot_w, canvas_h - spacing - (spacing * 2 + slot_h)),
                ]
            else:  # side_by_side
                avail_w = canvas_w - 3 * spacing
                slot_w = avail_w // 2
                slot_h = canvas_h - 2 * spacing
                boxes = [
                    (spacing, spacing, slot_w, slot_h),
                    (spacing * 2 + slot_w, spacing, canvas_w - spacing - (spacing * 2 + slot_w), slot_h),
                ]

        elif num_photos == 3:
            if layout == "top2_bottom1":
                avail_h = canvas_h - 3 * spacing
                top_h = avail_h // 2
                bot_h = avail_h - top_h
                avail_w = canvas_w - 3 * spacing
                col_w = avail_w // 2
                boxes = [
                    (spacing, spacing, col_w, top_h),
                    (spacing * 2 + col_w, spacing, canvas_w - spacing - (spacing * 2 + col_w), top_h),
                    (spacing, spacing * 2 + top_h, canvas_w - 2 * spacing, bot_h),
                ]
            elif layout == "columns_3":
                avail_w = canvas_w - 4 * spacing
                col_w = avail_w // 3
                slot_h = canvas_h - 2 * spacing
                boxes = [
                    (spacing, spacing, col_w, slot_h),
                    (spacing * 2 + col_w, spacing, col_w, slot_h),
                    (spacing * 3 + col_w * 2, spacing, canvas_w - spacing - (spacing * 3 + col_w * 2), slot_h),
                ]
            elif layout == "rows_3":
                avail_h = canvas_h - 4 * spacing
                row_h = avail_h // 3
                slot_w = canvas_w - 2 * spacing
                boxes = [
                    (spacing, spacing, slot_w, row_h),
                    (spacing, spacing * 2 + row_h, slot_w, row_h),
                    (spacing, spacing * 3 + row_h * 2, slot_w, canvas_h - spacing - (spacing * 3 + row_h * 2)),
                ]
            else:  # top1_bottom2
                avail_h = canvas_h - 3 * spacing
                top_h = avail_h // 2
                bot_h = avail_h - top_h
                avail_w = canvas_w - 3 * spacing
                col_w = avail_w // 2
                boxes = [
                    (spacing, spacing, canvas_w - 2 * spacing, top_h),
                    (spacing, spacing * 2 + top_h, col_w, bot_h),
                    (spacing * 2 + col_w, spacing * 2 + top_h, canvas_w - spacing - (spacing * 2 + col_w), bot_h),
                ]

        elif num_photos == 4:
            if layout == "featured_left":
                avail_w = canvas_w - 3 * spacing
                left_w = avail_w // 2
                right_w = avail_w - left_w
                avail_h = canvas_h - 4 * spacing
                right_h = avail_h // 3
                boxes = [
                    (spacing, spacing, left_w, canvas_h - 2 * spacing),
                    (spacing * 2 + left_w, spacing, right_w, right_h),
                    (spacing * 2 + left_w, spacing * 2 + right_h, right_w, right_h),
                    (spacing * 2 + left_w, spacing * 3 + right_h * 2, right_w, canvas_h - spacing - (spacing * 3 + right_h * 2)),
                ]
            elif layout == "columns_4":
                avail_w = canvas_w - 5 * spacing
                col_w = avail_w // 4
                slot_h = canvas_h - 2 * spacing
                boxes = [
                    (spacing + i * (col_w + spacing), spacing, col_w if i < 3 else canvas_w - spacing - (spacing + i * (col_w + spacing)), slot_h)
                    for i in range(4)
                ]
            elif layout == "rows_4":
                avail_h = canvas_h - 5 * spacing
                row_h = avail_h // 4
                slot_w = canvas_w - 2 * spacing
                boxes = [
                    (spacing, spacing + i * (row_h + spacing), slot_w, row_h if i < 3 else canvas_h - spacing - (spacing + i * (row_h + spacing)))
                    for i in range(4)
                ]
            else:  # grid_2x2
                avail_w = canvas_w - 3 * spacing
                col_w = avail_w // 2
                avail_h = canvas_h - 3 * spacing
                row_h = avail_h // 2
                boxes = [
                    (spacing, spacing, col_w, row_h),
                    (spacing * 2 + col_w, spacing, canvas_w - spacing - (spacing * 2 + col_w), row_h),
                    (spacing, spacing * 2 + row_h, col_w, canvas_h - spacing - (spacing * 2 + row_h)),
                    (spacing * 2 + col_w, spacing * 2 + row_h, canvas_w - spacing - (spacing * 2 + col_w), canvas_h - spacing - (spacing * 2 + row_h)),
                ]

        # Target format determination
        fmt_key = output_format.lower()
        pil_format, mime_type, _ = FORMAT_MAP.get(fmt_key, ("PNG", "image/png", ".png"))

        # Create canvas
        canvas = Image.new("RGBA", (canvas_w, canvas_h), bg_rgba)

        # Place each photo into its designated box
        for idx, p_path in enumerate(image_paths):
            if idx >= len(boxes):
                break
            bx, by, bw, bh = boxes[idx]
            if bw <= 0 or bh <= 0:
                continue

            with Image.open(p_path) as src_img:
                src_img = ImageOps.exif_transpose(src_img)
                # Crop and resize photo to fill the exact slot
                tile = ImageOps.fit(src_img, (bw, bh), method=Image.Resampling.LANCZOS).convert("RGBA")

                # Apply rounded corners mask if specified
                if border_radius > 0:
                    r = min(border_radius, bw // 2, bh // 2)
                    mask = Image.new("L", (bw, bh), 0)
                    draw = ImageDraw.Draw(mask)
                    draw.rounded_rectangle((0, 0, bw - 1, bh - 1), radius=r, fill=255)
                    tile.putalpha(mask)

                canvas.alpha_composite(tile, (bx, by))

        # Save canvas
        final_img = prepare_for_format(canvas, pil_format)
        save_kwargs = {"optimize": True}
        if pil_format in ("JPEG", "WEBP"):
            save_kwargs["quality"] = 92
        elif pil_format == "PNG":
            save_kwargs["compress_level"] = 6

        final_img.save(output_path, format=pil_format, **save_kwargs)
        return output_path, mime_type


image_service = ImageService()
