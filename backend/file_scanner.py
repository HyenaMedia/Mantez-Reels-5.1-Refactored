"""
File Scanner Utility using ClamAV

This module provides virus/malware scanning for uploaded files.
Uses clamscan command-line tool for reliable scanning without daemon dependency.
"""

import logging
import os
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)

class FileScanner:
    """
    File scanner using ClamAV for virus/malware detection.
    Falls back gracefully if ClamAV is not available.
    """

    def __init__(self):
        self.clamscan_path = self._find_clamscan()
        self.is_available = self.clamscan_path is not None

        if self.is_available:
            logger.info(f"ClamAV scanner initialized: {self.clamscan_path}")
        else:
            logger.warning("ClamAV not available - file scanning disabled")

    def _find_clamscan(self) -> str | None:
        """Find the clamscan executable"""
        possible_paths = [
            '/usr/bin/clamscan',
            '/usr/local/bin/clamscan',
            'clamscan'  # Let PATH resolve it
        ]

        for path in possible_paths:
            try:
                result = subprocess.run(
                    [path, '--version'],
                    capture_output=True,
                    timeout=10
                )
                if result.returncode == 0:
                    return path
            except (subprocess.SubprocessError, FileNotFoundError):
                continue

        return None

    def scan_file(self, file_path: str) -> tuple[bool, str]:
        """
        Scan a file for viruses/malware.
        
        Args:
            file_path: Path to the file to scan
            
        Returns:
            Tuple of (is_safe, message)
            - is_safe: True if file is clean, False if infected or error
            - message: Description of the result
        """
        if not self.is_available:
            logger.warning(f"Skipping scan for {file_path} - ClamAV not available")
            return True, "Scan skipped - ClamAV not available"

        if not os.path.exists(file_path):
            return False, f"File not found: {file_path}"

        try:
            # Run clamscan with options:
            # --no-summary: Don't print summary
            # --infected: Only print infected files
            # --stdout: Print to stdout
            result = subprocess.run(
                [self.clamscan_path, '--no-summary', '--infected', file_path],
                capture_output=True,
                text=True,
                timeout=60  # 60 second timeout for large files
            )

            # Return codes:
            # 0 = No virus found
            # 1 = Virus(es) found
            # 2 = Some error(s) occurred

            if result.returncode == 0:
                logger.info(f"File scan passed: {file_path}")
                return True, "File is clean"

            elif result.returncode == 1:
                # Virus found - extract the virus name from output
                virus_info = result.stdout.strip() if result.stdout else "Unknown threat"
                logger.warning(f"VIRUS DETECTED in {file_path}: {virus_info}")
                return False, f"Malware detected: {virus_info}"

            else:
                # Error occurred
                error_msg = result.stderr.strip() if result.stderr else "Unknown error"
                logger.error(f"Scan error for {file_path}: {error_msg}")
                # Fail safe - reject file if scan errors
                return False, f"Scan error: {error_msg}"

        except subprocess.TimeoutExpired:
            logger.error(f"Scan timeout for {file_path}")
            return False, "Scan timeout - file too large or complex"

        except Exception as e:
            logger.error(f"Scan exception for {file_path}: {str(e)}")
            return False, f"Scan failed: {str(e)}"

    def scan_bytes(self, data: bytes, filename: str = "upload") -> tuple[bool, str]:
        """
        Scan bytes data for viruses (writes to temp file then scans).
        
        Args:
            data: File content as bytes
            filename: Original filename (for logging)
            
        Returns:
            Tuple of (is_safe, message)
        """
        import tempfile

        try:
            # Write to temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix=Path(filename).suffix) as tmp:
                tmp.write(data)
                tmp_path = tmp.name

            # Scan the temp file
            result = self.scan_file(tmp_path)

            # Clean up
            try:
                os.unlink(tmp_path)
            except Exception as e:
                logger.debug(f"Failed to remove temp file {tmp_path}: {e}")

            return result

        except Exception as e:
            logger.error(f"Error scanning bytes for {filename}: {str(e)}")
            return False, f"Scan failed: {str(e)}"

    def get_status(self) -> dict:
        """Get scanner status information"""
        status = {
            "available": self.is_available,
            "scanner": "ClamAV",
            "path": self.clamscan_path
        }

        if self.is_available:
            try:
                result = subprocess.run(
                    [self.clamscan_path, '--version'],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                status["version"] = result.stdout.strip().split('\n')[0]
            except Exception as e:
                logger.debug(f"Failed to get ClamAV version: {e}")
                status["version"] = "Unknown"

        return status


# Global scanner instance
file_scanner = FileScanner()


def scan_uploaded_file(file_path: str) -> tuple[bool, str]:
    """
    Convenience function to scan an uploaded file.
    
    Args:
        file_path: Path to the uploaded file
        
    Returns:
        Tuple of (is_safe, message)
    """
    return file_scanner.scan_file(file_path)


def scan_uploaded_bytes(data: bytes, filename: str = "upload") -> tuple[bool, str]:
    """
    Convenience function to scan uploaded bytes.
    
    Args:
        data: File content as bytes
        filename: Original filename
        
    Returns:
        Tuple of (is_safe, message)
    """
    return file_scanner.scan_bytes(data, filename)


def get_scanner_status() -> dict:
    """Get the status of the file scanner"""
    return file_scanner.get_status()
