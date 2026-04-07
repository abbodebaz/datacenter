"""
Log utility functions for creating audit trail entries.
"""
from apps.logs.models import AuditLog


def log_action(user, action: str, obj=None, details: str = '', request=None):
    """
    Create an audit log entry.

    Usage:
        log_action(user, 'publish_product', product, 'نشر المنتج SKU-123')
        log_action(user, 'user_login', user, request=request)
    """
    kwargs = {
        'user': user,
        'action': action,
        'details': details,
    }

    if obj is not None:
        kwargs['content_type'] = type(obj).__name__.lower()
        kwargs['object_id'] = getattr(obj, 'pk', None)
        kwargs['object_repr'] = str(obj)[:200]

    if request is not None:
        kwargs['ip_address'] = (
            request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
            or request.META.get('REMOTE_ADDR')
        )

    try:
        AuditLog.objects.create(**kwargs)
    except Exception:
        pass  # Never block a request because of logging failure
