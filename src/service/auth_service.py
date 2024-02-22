import logging
from typing import Optional

from src.model.user_profile import UserProfile


class AuthService:
    """
    This class is responsible for managing & authenticating users
    """
    def __init__(self):
        self._log = logging.getLogger(__name__)
        pass


    def get_user(self, username=None, user_id=None) -> Optional[UserProfile]:
        """
        Get user by username or user_id
        :param username: The username of the user
        :param user_id: The user_id of the user
        :return: The userProfile object, or None if not found
        """
        # TODO
        pass

    def authenticate(self, username, password) -> Optional[UserProfile]:
        """
        Authenticate the user using username and password
        :param username: The username of the user
        :param password: The password of the user
        :return: The userProfile object, or None if not found
        """
        user: Optional[UserProfile] = self.get_user(username=username)
        if user is None:
            self._log.debug(f'User {username} not found, cannot authenticate')
            return None

        user.credentials.authenticate({'username': username, 'password': password})


        # TODO
        pass


AUTH_SERVICE = AuthService()