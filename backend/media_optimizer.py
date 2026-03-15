import os
from pathlib import Path

from PIL import Image

# Prevent decompression bomb attacks — limit to 50 megapixels
Image.MAX_IMAGE_PIXELS = 50_000_000


class MediaOptimizer:
    """Handles image optimization and format conversion"""

    # Image size presets
    SIZES = {
        'thumbnail': (400, 300),
        'medium': (800, 600),
        'large': (1920, 1080),
        'original': None  # Keep original size
    }

    # Quality settings
    WEBP_QUALITY = 85
    JPEG_QUALITY = 90

    @staticmethod
    def optimize_image(image_file, output_dir: str, filename: str) -> dict:
        """Optimize image and create multiple sizes in WebP and JPEG formats
        
        Args:
            image_file: Uploaded file object
            output_dir: Directory to save optimized images
            filename: Base filename (without extension)
            
        Returns:
            dict: Dictionary containing URLs for different sizes and formats
        """
        # Ensure output directory exists
        Path(output_dir).mkdir(parents=True, exist_ok=True)

        # Open image
        img = Image.open(image_file)

        # Convert RGBA to RGB if necessary (for JPEG compatibility)
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background

        # Get original dimensions
        original_width, original_height = img.size

        result = {
            'original_size': {'width': original_width, 'height': original_height},
            'sizes': {}
        }

        # Generate different sizes
        for size_name, dimensions in MediaOptimizer.SIZES.items():
            if dimensions is None:
                # Use original size
                resized_img = img
            else:
                # Calculate aspect ratio
                max_width, max_height = dimensions
                ratio = min(max_width / original_width, max_height / original_height)

                # Only resize if image is larger than target
                if ratio < 1:
                    new_size = (int(original_width * ratio), int(original_height * ratio))
                    resized_img = img.resize(new_size, Image.Resampling.LANCZOS)
                else:
                    resized_img = img

            # Save as WebP
            webp_filename = f"{filename}_{size_name}.webp"
            webp_path = os.path.join(output_dir, webp_filename)
            resized_img.save(webp_path, 'WEBP', quality=MediaOptimizer.WEBP_QUALITY, method=6)

            # Save as JPEG (fallback)
            jpeg_filename = f"{filename}_{size_name}.jpg"
            jpeg_path = os.path.join(output_dir, jpeg_filename)
            resized_img.save(jpeg_path, 'JPEG', quality=MediaOptimizer.JPEG_QUALITY, optimize=True)

            # Get file sizes
            webp_size = os.path.getsize(webp_path)
            jpeg_size = os.path.getsize(jpeg_path)

            result['sizes'][size_name] = {
                'webp': f"/media/{webp_filename}",
                'jpeg': f"/media/{jpeg_filename}",
                'width': resized_img.width,
                'height': resized_img.height,
                'webp_size': webp_size,
                'jpeg_size': jpeg_size,
                'compression_ratio': f"{((1 - webp_size / jpeg_size) * 100):.1f}%" if jpeg_size > 0 else 'N/A'
            }

        return result

    @staticmethod
    def get_image_info(image_file) -> dict:
        """Get information about uploaded image"""
        img = Image.open(image_file)
        return {
            'format': img.format,
            'mode': img.mode,
            'size': img.size,
            'width': img.width,
            'height': img.height
        }

    @staticmethod
    def validate_image(image_file) -> tuple[bool, str]:
        """Validate if file is a valid image
        
        Returns:
            Tuple[bool, str]: (is_valid, error_message)
        """
        try:
            img = Image.open(image_file)
            img.verify()

            # Check file size (max 10MB)
            image_file.seek(0, 2)  # Seek to end
            size = image_file.tell()
            image_file.seek(0)  # Reset

            if size > 10 * 1024 * 1024:  # 10MB
                return False, "Image file too large (max 10MB)"

            # Check format
            allowed_formats = ['JPEG', 'PNG', 'WEBP', 'GIF', 'BMP', 'TIFF']
            if img.format not in allowed_formats:
                return False, f"Unsupported image format: {img.format}"

            return True, "Valid image"
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"


class VideoOptimizer:
    """Handles video optimization using ffmpeg when available, with graceful fallback"""

    # Max video dimensions for web delivery
    MAX_WIDTH = 1920
    MAX_HEIGHT = 1080
    # CRF quality (lower = better quality, larger file; 23 is ffmpeg default)
    CRF = 23

    @staticmethod
    def _ffmpeg_available() -> bool:
        """Check if ffmpeg is available on the system"""
        import shutil
        return shutil.which('ffmpeg') is not None

    @staticmethod
    def optimize_video(video_file, output_dir: str, filename: str) -> dict:
        """Optimize video file using ffmpeg if available, otherwise save original

        Args:
            video_file: Uploaded file object
            output_dir: Directory to save optimized video
            filename: Base filename (without extension)

        Returns:
            dict: Dictionary containing URL and optimization metadata
        """
        import logging
        logger = logging.getLogger(__name__)

        Path(output_dir).mkdir(parents=True, exist_ok=True)

        # Save the original file first
        original_path = os.path.join(output_dir, f"{filename}_original.mp4")
        with open(original_path, 'wb') as f:
            video_file.seek(0)
            f.write(video_file.read())

        original_size = os.path.getsize(original_path)

        if not VideoOptimizer._ffmpeg_available():
            # No ffmpeg — rename original and return
            output_path = os.path.join(output_dir, f"{filename}.mp4")
            os.rename(original_path, output_path)
            return {
                'url': f"/media/{filename}.mp4",
                'original_size': original_size,
                'optimized': False,
                'note': 'ffmpeg not installed — serving original file. Install ffmpeg for automatic compression.'
            }

        import subprocess

        output_path = os.path.join(output_dir, f"{filename}.mp4")

        try:
            # Build ffmpeg command:
            # - Re-encode with H.264 for max compatibility
            # - Scale down if larger than MAX dimensions (preserving aspect ratio)
            # - Use CRF for quality-based encoding
            # - Fast-start for web streaming (moov atom at beginning)
            cmd = [
                'ffmpeg', '-y', '-i', original_path,
                '-c:v', 'libx264',
                '-crf', str(VideoOptimizer.CRF),
                '-preset', 'medium',
                '-c:a', 'aac', '-b:a', '128k',
                '-vf', f'scale=min({VideoOptimizer.MAX_WIDTH}\\,iw):min({VideoOptimizer.MAX_HEIGHT}\\,ih):force_original_aspect_ratio=decrease',
                '-movflags', '+faststart',
                '-threads', '0',
                output_path,
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
            )

            if result.returncode != 0:
                logger.warning(f"ffmpeg failed (exit {result.returncode}): {result.stderr[:500]}")
                # Fall back to original
                os.rename(original_path, output_path)
                return {
                    'url': f"/media/{filename}.mp4",
                    'original_size': original_size,
                    'optimized': False,
                    'note': f'ffmpeg encoding failed — serving original file.'
                }

            optimized_size = os.path.getsize(output_path)

            # If optimized is larger, use original instead
            if optimized_size >= original_size:
                os.remove(output_path)
                os.rename(original_path, output_path)
                return {
                    'url': f"/media/{filename}.mp4",
                    'original_size': original_size,
                    'optimized_size': original_size,
                    'optimized': False,
                    'note': 'Original was already optimal — no further compression needed.'
                }

            # Clean up original
            os.remove(original_path)

            compression = ((1 - optimized_size / original_size) * 100)
            return {
                'url': f"/media/{filename}.mp4",
                'original_size': original_size,
                'optimized_size': optimized_size,
                'compression_ratio': f"{compression:.1f}%",
                'optimized': True,
            }

        except subprocess.TimeoutExpired:
            logger.warning("ffmpeg timed out after 5 minutes")
            os.rename(original_path, output_path)
            return {
                'url': f"/media/{filename}.mp4",
                'original_size': original_size,
                'optimized': False,
                'note': 'Video optimization timed out — serving original file.'
            }
        except Exception as e:
            logger.error(f"Video optimization error: {e}")
            if os.path.exists(original_path):
                os.rename(original_path, output_path)
            return {
                'url': f"/media/{filename}.mp4",
                'original_size': original_size,
                'optimized': False,
                'note': f'Optimization error — serving original file.'
            }
