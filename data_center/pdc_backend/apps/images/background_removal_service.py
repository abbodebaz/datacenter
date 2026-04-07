import io
import logging
import urllib.request
import urllib.parse

from PIL import Image

logger = logging.getLogger(__name__)


def remove_background(image_bytes: bytes, removebg_api_key: str = None) -> bytes:
    """
    Remove the background from image bytes.

    Attempts to use rembg if installed. If rembg is not available,
    falls back to the Remove.bg API (requires REMOVEBG_API_KEY).

    Args:
        image_bytes: Raw image bytes to process.
        removebg_api_key: Remove.bg API key. If not provided, the function
                          will try to read it from Django settings or the
                          REMOVEBG_API_KEY environment variable.

    Returns:
        Processed image bytes (PNG with transparent background).

    Raises:
        RuntimeError: If neither rembg nor the Remove.bg API is available.
    """
    try:
        from rembg import remove as rembg_remove
        logger.info("Using rembg for background removal.")
        result = rembg_remove(image_bytes)
        return result
    except ImportError:
        logger.info("rembg is not installed; falling back to Remove.bg API.")
        return _remove_background_via_api(image_bytes, removebg_api_key)


def _remove_background_via_api(image_bytes: bytes, api_key: str = None) -> bytes:
    """
    Remove the background using the Remove.bg REST API.

    Args:
        image_bytes: Raw image bytes to process.
        api_key: Remove.bg API key.

    Returns:
        Processed image bytes (PNG with transparent background).

    Raises:
        RuntimeError: If the API key is missing or the API call fails.
    """
    if api_key is None:
        api_key = _get_api_key_from_settings()

    if not api_key:
        raise RuntimeError(
            "Background removal is unavailable: rembg is not installed and no "
            "REMOVEBG_API_KEY is configured. Either install rembg manually "
            "(pip install rembg==2.0.57) or provide a Remove.bg API key."
        )

    url = "https://api.remove.bg/v1.0/removebg"
    data = urllib.parse.urlencode({"size": "auto"}).encode()

    request = urllib.request.Request(url, data=data)
    request.add_header("X-Api-Key", api_key)
    request.add_header("Content-Type", "application/x-www-form-urlencoded")

    # Upload raw image bytes as multipart/form-data
    boundary = b"----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = (
        b"--" + boundary + b"\r\n"
        b'Content-Disposition: form-data; name="image_file"; filename="image.png"\r\n'
        b"Content-Type: image/png\r\n\r\n"
        + image_bytes
        + b"\r\n--" + boundary + b"--\r\n"
    )

    multipart_request = urllib.request.Request(url, data=body)
    multipart_request.add_header("X-Api-Key", api_key)
    multipart_request.add_header(
        "Content-Type", f"multipart/form-data; boundary={boundary.decode()}"
    )

    try:
        with urllib.request.urlopen(multipart_request) as response:
            if response.status == 200:
                result_bytes = response.read()
                logger.info("Background removed successfully via Remove.bg API.")
                return result_bytes
            else:
                raise RuntimeError(
                    f"Remove.bg API returned unexpected status {response.status}."
                )
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode(errors="replace")
        raise RuntimeError(
            f"Remove.bg API error {exc.code}: {error_body}"
        ) from exc


def _get_api_key_from_settings() -> str:
    """
    Retrieve the Remove.bg API key from Django settings or environment variables.
    """
    import os

    try:
        from django.conf import settings
        key = getattr(settings, "REMOVEBG_API_KEY", None)
        if key:
            return key
    except Exception:
        pass

    return os.environ.get("REMOVEBG_API_KEY", "")
