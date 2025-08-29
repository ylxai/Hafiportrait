#!/usr/bin/env python3
"""
Modal Client Library - Robust integration untuk auto.py
Menangani komunikasi dengan Modal API yang sudah diperbaiki
"""

import requests
import time
import os
import io
from typing import Optional, Dict, Any, Tuple
import urllib3
from PIL import Image
import logging

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModalEnhanceClient:
    """
    Client untuk berkomunikasi dengan Modal API yang robust
    """

    def __init__(self,
                 api_url: str,
                 timeout: int = 300,
                 max_retries: int = 3,
                 verify_ssl: bool = False):
        """
        Initialize Modal client

        Args:
            api_url: Base URL Modal API (tanpa trailing slash)
            timeout: Timeout per request (seconds)
            max_retries: Maximum retry attempts
            verify_ssl: Enable SSL verification
        """
        self.api_url = api_url.rstrip('/')
        self.timeout = timeout
        self.max_retries = max_retries
        self.verify_ssl = verify_ssl

        # Setup session
        self.session = requests.Session()
        self.session.verify = verify_ssl

        # Test connection
        self._test_connection()

    def _test_connection(self) -> bool:
        """Test koneksi ke Modal API"""
        try:
            logger.info(f"🔍 Testing connection to {self.api_url}")
            response = self.session.get(
                f"{self.api_url}/health",
                timeout=10
            )

            if response.status_code == 200:
                health_data = response.json()
                logger.info(f"✅ Modal API healthy: {health_data.get('status', 'unknown')}")
                return True
            else:
                logger.warning(f"⚠️ Modal API health check returned {response.status_code}")
                return False

        except Exception as e:
            logger.warning(f"⚠️ Health check failed: {e}")
            return False

    def enhance_image(self,
                     image_path: str,
                     method: str = "auto",
                     scale: int = 2,
                     quality: int = 95) -> Tuple[bool, Optional[bytes], Optional[str]]:
        """
        Enhance image menggunakan Modal API

        Args:
            image_path: Path ke file gambar
            method: Enhancement method (auto, swinir, basic)
            scale: Upscaling factor (1-4)
            quality: Output quality (50-100)

        Returns:
            Tuple of (success, image_bytes, error_message)
        """

        if not os.path.exists(image_path):
            return False, None, f"File not found: {image_path}"

        filename = os.path.basename(image_path)

        for attempt in range(self.max_retries):
            try:
                logger.info(f"🔄 Attempt {attempt + 1}/{self.max_retries} - Enhancing {filename}")

                # Prepare file
                with open(image_path, 'rb') as f:
                    files = {
                        'file': (filename, f, 'image/jpeg')
                    }

                    # Use enhanced endpoint dengan parameters
                    params = {
                        'scale': scale,
                        'quality': quality,
                        'method': method
                    }

                    # Try enhanced endpoint first
                    response = self.session.post(
                        f"{self.api_url}/enhance",
                        files=files,
                        params=params,
                        timeout=self.timeout,
                        stream=True
                    )

                # Check response
                if response.status_code == 200:
                    logger.info(f"✅ Enhancement successful on attempt {attempt + 1}")

                    # Get metadata from headers
                    original_size = response.headers.get('X-Original-Size', 'unknown')
                    enhanced_size = response.headers.get('X-Enhanced-Size', 'unknown')
                    method_used = response.headers.get('X-Enhancement-Method', method)

                    logger.info(f"📏 Size: {original_size} → {enhanced_size} (method: {method_used})")

                    return True, response.content, None

                elif response.status_code == 422:
                    # Validation error, try fallback method
                    logger.warning(f"⚠️ Validation error, trying fallback method")
                    return self._enhance_fallback(image_path, filename, attempt)

                else:
                    error_msg = f"API returned {response.status_code}: {response.text[:200]}"
                    logger.warning(f"⚠️ {error_msg}")

                    if attempt == self.max_retries - 1:
                        return False, None, error_msg

                    time.sleep(2 ** attempt)  # Exponential backoff

            except requests.exceptions.SSLError as e:
                logger.warning(f"🔒 SSL Error on attempt {attempt + 1}: {e}")
                if attempt == self.max_retries - 1:
                    return False, None, f"SSL connection failed: {e}"
                time.sleep(2)

            except requests.exceptions.ConnectionError as e:
                logger.warning(f"🌐 Connection Error on attempt {attempt + 1}: {e}")
                if attempt == self.max_retries - 1:
                    return False, None, f"Connection failed: {e}"
                time.sleep(5)

            except requests.exceptions.Timeout as e:
                logger.warning(f"⏰ Timeout on attempt {attempt + 1}: {e}")
                if attempt == self.max_retries - 1:
                    return False, None, f"Request timeout: {e}"
                time.sleep(3)

            except Exception as e:
                logger.warning(f"❌ Unexpected error on attempt {attempt + 1}: {e}")
                if attempt == self.max_retries - 1:
                    return False, None, f"Unexpected error: {e}"
                time.sleep(2)

        return False, None, "All retry attempts failed"

    def _enhance_fallback(self, image_path: str, filename: str, attempt: int) -> Tuple[bool, Optional[bytes], Optional[str]]:
        """
        Fallback method menggunakan direct endpoint (kompatibilitas dengan auto.py lama)
        """
        try:
            logger.info(f"🔄 Trying fallback method for {filename}")

            with open(image_path, 'rb') as f:
                files = {
                    'file': (filename, f, 'image/jpeg')
                }

                # Use direct endpoint dengan query parameter
                params = {'file': filename}

                response = self.session.post(
                    f"{self.api_url}/",
                    files=files,
                    params=params,
                    timeout=self.timeout,
                    stream=True
                )

            if response.status_code == 200:
                logger.info(f"✅ Fallback method successful")
                return True, response.content, None
            else:
                error_msg = f"Fallback failed: {response.status_code} - {response.text[:200]}"
                logger.warning(f"⚠️ {error_msg}")
                return False, None, error_msg

        except Exception as e:
            error_msg = f"Fallback method error: {e}"
            logger.warning(f"❌ {error_msg}")
            return False, None, error_msg

    def enhance_with_local_fallback(self, image_path: str) -> Tuple[bool, Optional[bytes], Optional[str]]:
        """
        Enhance dengan local fallback jika Modal API gagal
        """
        # Try Modal API first
        success, image_bytes, error = self.enhance_image(image_path)

        if success:
            return success, image_bytes, error

        # Local fallback
        logger.info(f"🔧 Using local fallback for {os.path.basename(image_path)}")
        try:
            return self._local_enhance(image_path)
        except Exception as e:
            return False, None, f"Local fallback failed: {e}"

    def _local_enhance(self, image_path: str, scale: int = 2) -> Tuple[bool, Optional[bytes], Optional[str]]:
        """
        Local image enhancement sebagai fallback terakhir
        """
        from PIL import Image, ImageEnhance

        try:
            # Load image
            with Image.open(image_path) as img:
                if img.mode != 'RGB':
                    img = img.convert('RGB')

                # Calculate new size
                new_size = (img.size[0] * scale, img.size[1] * scale)

                # High-quality upscaling
                enhanced = img.resize(new_size, Image.Resampling.LANCZOS)

                # Apply enhancements
                enhancer = ImageEnhance.Sharpness(enhanced)
                enhanced = enhancer.enhance(1.2)

                enhancer = ImageEnhance.Contrast(enhanced)
                enhanced = enhancer.enhance(1.1)

                # Convert to bytes
                buf = io.BytesIO()
                enhanced.save(buf, format='JPEG', quality=95, optimize=True)

                logger.info(f"✅ Local enhancement: {img.size} → {enhanced.size}")
                return True, buf.getvalue(), None

        except Exception as e:
            return False, None, f"Local enhancement error: {e}"

# Convenience function untuk auto.py
def enhance_image_robust(image_path: str,
                        api_url: str,
                        use_local_fallback: bool = True,
                        scale: int = 2,
                        method: str = "auto",
                        quality: int = 95) -> Tuple[bool, Optional[bytes], Optional[str]]:
    """
    Convenience function untuk enhance image dengan semua fallback

    Args:
        image_path: Path ke file gambar
        api_url: Modal API URL
        use_local_fallback: Enable local fallback jika API gagal
        scale: Upscaling factor (1-4x)
        method: Enhancement method (auto, swinir, basic)
        quality: Output quality (50-100)

    Returns:
        Tuple of (success, image_bytes, error_message)
    """
    client = ModalEnhanceClient(api_url)

    if use_local_fallback:
        # Try Modal API first with custom parameters
        success, image_bytes, error = client.enhance_image(image_path, method, scale, quality)
        if success:
            return success, image_bytes, error
        # Fallback to local with scale parameter
        return client._local_enhance(image_path, scale)
    else:
        return client.enhance_image(image_path, method, scale, quality)

if __name__ == "__main__":
    # Test client
    print("🧪 Testing Modal Client...")

    # Example usage
    api_url = "https://khzmh--swinir-enhance-fastapi-app.modal.run"
    test_image = "work/IMG_9272_5R.jpg"

    if os.path.exists(test_image):
        success, image_bytes, error = enhance_image_robust(test_image, api_url)

        if success:
            print(f"✅ Enhancement successful! Image size: {len(image_bytes)} bytes")
        else:
            print(f"❌ Enhancement failed: {error}")
    else:
        print(f"⚠️ Test image not found: {test_image}")
