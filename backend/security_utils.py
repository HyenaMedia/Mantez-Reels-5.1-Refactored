"""
Security utilities for input sanitization and validation
"""
import re
from typing import Any

from html.parser import HTMLParser
from html import escape as html_escape

# Allowed HTML tags for rich text content (blog, about section)
ALLOWED_TAGS = {
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span', 'div'
}

# Allowed HTML attributes
ALLOWED_ATTRIBUTES = {
    'a': {'href', 'title', 'target', 'rel'},
    'span': {'class'},
    'div': {'class'},
}

# Allowed protocols for links
ALLOWED_PROTOCOLS = {'http', 'https', 'mailto'}


class _HTMLSanitizer(HTMLParser):
    """Lightweight HTML sanitizer replacing deprecated bleach library."""

    def __init__(self, allowed_tags, allowed_attrs, allowed_protocols, strip=True):
        super().__init__(convert_charrefs=False)
        self._allowed_tags = allowed_tags
        self._allowed_attrs = allowed_attrs
        self._allowed_protocols = allowed_protocols
        self._strip = strip
        self._result: list[str] = []

    def reset_output(self):
        self._result = []

    @property
    def output(self) -> str:
        return ''.join(self._result)

    # -- parser callbacks --
    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]):
        if tag in self._allowed_tags:
            safe_attrs = self._filter_attrs(tag, attrs)
            attr_str = ''.join(f' {k}="{html_escape(v or "", quote=True)}"' for k, v in safe_attrs)
            self._result.append(f'<{tag}{attr_str}>')
        elif not self._strip:
            self._result.append(html_escape(self.get_starttag_text() or ''))

    def handle_endtag(self, tag: str):
        if tag in self._allowed_tags:
            self._result.append(f'</{tag}>')

    def handle_data(self, data: str):
        self._result.append(html_escape(data))

    def handle_entityref(self, name: str):
        self._result.append(f'&{name};')

    def handle_charref(self, name: str):
        self._result.append(f'&#{name};')

    def _filter_attrs(self, tag: str, attrs: list[tuple[str, str | None]]) -> list[tuple[str, str | None]]:
        allowed = self._allowed_attrs.get(tag, set())
        safe: list[tuple[str, str | None]] = []
        for name, value in attrs:
            if name not in allowed:
                continue
            # Validate href protocols
            if name == 'href' and value:
                protocol = value.split(':', 1)[0].lower().strip() if ':' in value else ''
                if protocol and protocol not in self._allowed_protocols:
                    continue
            safe.append((name, value))
        return safe


def sanitize_html(text: str, allow_html: bool = True) -> str:
    """
    Sanitize HTML content to prevent XSS attacks

    Args:
        text: Input text that may contain HTML
        allow_html: If True, allow safe HTML tags. If False, strip all HTML

    Returns:
        Sanitized text
    """
    if not text:
        return text

    tags = ALLOWED_TAGS if allow_html else set()
    attrs = ALLOWED_ATTRIBUTES if allow_html else {}

    parser = _HTMLSanitizer(tags, attrs, ALLOWED_PROTOCOLS, strip=True)
    parser.reset_output()
    parser.feed(text)
    return parser.output


def sanitize_text(text: str) -> str:
    """
    Sanitize plain text by removing all HTML
    """
    if not text:
        return text
    return sanitize_html(text, allow_html=False)


def validate_email(email: str) -> bool:
    """
    Validate email format
    """
    if not email:
        return False

    # RFC 5322 compliant email regex (simplified)
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """
    Validate phone number format (international format)
    """
    if not phone:
        return False

    # Allow numbers, spaces, dashes, parentheses, and plus sign
    pattern = r'^[\d\s\-\+\(\)]+$'
    return bool(re.match(pattern, phone))


def validate_url(url: str) -> bool:
    """
    Validate URL format
    """
    if not url:
        return False

    # Basic URL validation
    pattern = r'^https?://[^\s]+$'
    return bool(re.match(pattern, url))


def sanitize_dict(data: dict[str, Any], allow_html_fields: list[str] | None = None) -> dict[str, Any]:
    """
    Recursively sanitize all string values in a dictionary
    
    Args:
        data: Dictionary to sanitize
        allow_html_fields: List of field names that can contain safe HTML
    
    Returns:
        Sanitized dictionary
    """
    if allow_html_fields is None:
        allow_html_fields = []

    sanitized = {}
    for key, value in data.items():
        if isinstance(value, str):
            # Check if this field allows HTML
            allow_html = key in allow_html_fields
            sanitized[key] = sanitize_html(value, allow_html=allow_html)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_dict(value, allow_html_fields)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_dict(item, allow_html_fields) if isinstance(item, dict)
                else sanitize_html(item, allow_html=key in allow_html_fields) if isinstance(item, str)
                else item
                for item in value
            ]
        else:
            sanitized[key] = value

    return sanitized


def validate_content_length(text: str, max_length: int = 10000) -> bool:
    """
    Validate that content doesn't exceed maximum length
    """
    if not text:
        return True
    return len(text) <= max_length


DANGEROUS_EXTENSIONS = {
    '.php', '.phtml', '.php5', '.php7', '.phar',
    '.asp', '.aspx', '.jsp', '.jspx', '.cgi',
    '.exe', '.bat', '.cmd', '.sh', '.bash',
    '.py', '.rb', '.pl', '.ps1', '.vbs',
    '.htaccess', '.htpasswd', '.config',
}

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent directory traversal and double-extension attacks.
    """
    if not filename:
        return filename

    # Remove any path components
    filename = filename.split('/')[-1].split('\\')[-1]

    # Remove dangerous characters
    filename = re.sub(r'[^\w\s\-\.]', '', filename)

    # Check ALL extensions for dangerous ones (prevents evil.php.jpg)
    parts = filename.split('.')
    if len(parts) > 2:
        # File has multiple extensions — check each
        for part in parts[1:]:  # skip the base name
            if f'.{part.lower()}' in DANGEROUS_EXTENSIONS:
                # Strip the dangerous extension
                filename = parts[0] + '.' + parts[-1]
                break

    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:250] + ('.' + ext if ext else '')

    return filename
