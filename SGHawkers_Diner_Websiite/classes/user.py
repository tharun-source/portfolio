import shelve

class User:
    def __init__(self, username, password):
        self.username = username
        self.password = password

    def to_dict(self):
        return {
            'username': self.username,
            'password': self.password
        }

    @staticmethod
    def store_user(username, password):
        with shelve.open('users.db', 'c') as db:
            user = User(username,password)
            db[username] = user

    @staticmethod
    def get_users():
        with shelve.open('users.db', 'r') as db:
            return [User(**data) for data in db.values()]
