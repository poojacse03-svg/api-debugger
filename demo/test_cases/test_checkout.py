import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'vulnerable_app'))

from checkout import get_checkout_email

def test_get_checkout_email_valid_user():
    assert get_checkout_email(1) == "alice@example.com"

def test_get_checkout_email_missing_user():
    email = get_checkout_email(999)
    assert email is None