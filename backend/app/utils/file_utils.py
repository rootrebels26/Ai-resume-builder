import tempfile
import os
import shutil
from contextlib import contextmanager
from typing import Generator

@contextmanager
def temporary_upload_file(content: bytes, suffix: str) -> Generator[str, None, None]:
    """
    Safely creates a temporary file on disk with the given content,
    yields the path, and guarantees deletion after use even if an error occurs.
    """
    fd, path = tempfile.mkstemp(suffix=suffix)
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(content)
        yield path
    finally:
        try:
            if os.path.exists(path):
                os.remove(path)
        except Exception:
            pass
