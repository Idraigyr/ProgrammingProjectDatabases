from abc import abstractmethod
from flask import current_app


class Credentials(current_app.db.Model):

    @abstractmethod
    def authenticate(self, loginData: dict) -> bool:
        pass


class PasswordCredentials(Credentials):
    password_hash = current_app.db.Column(current_app.db.String(255), nullable=False)
    password_salt = current_app.db.Column(current_app.db.String(255), nullable=False)

    def __init__(self, password_hash, password_salt):
        self.password_hash = password_hash
        self.password_salt = password_salt


    def authenticate(self, loginData: dict):
        # TODO - hash pwd, salt it, and compare with stored hash
        pass


    @classmethod
    def create_from_password(cls, password: str):
        # TODO - hash pwd, salt it, and return a new PasswordCredentials object
        pass


# class OAuthCredentials(Credentials):
#     sso_id = current_app.db.Column(current_app.db.String(255), nullable=False)