class User:
    def __init__(self, email=None):
        self.email = email

def find_user(user_id):
    users = {
        1: User(email="alice@example.com"),
        2: User(email="bob@example.com"),
    }
    return users.get(user_id)

def get_checkout_email(user_id):
    user = find_user(user_id)
    email = user.email  # BUG: no null check -> crashes if user not found
    return email