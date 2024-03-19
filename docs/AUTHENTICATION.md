# Authentication
### For all api endpoints and their specific documentation, please refer to the Swagger documentation

### Sitemap (excluding API)
- `/` - Index page: this is the main game application page. It is only accessible when the user is logged in. When the user is not logged in (no JWT token), the user is redirected to the landing page.
- `/register` - Register page: this is the registration page. It is only accessible when the user is not logged in. When the user is logged in, the user is redirected to the index page.
- `/login` - Login page: this is the login page. It is only accessible when the user is not logged in. When the user is logged in, the user is redirected to the index page.
- `/logout` - Logout page: this is the logout page. It simply unsets the `access_token_cookie` cookie.
- `/landing` - Landing page: this is the landing page. It is always accessible and is the first page the user sees when accessing the application. It contains a brief description of the application and a link to the register page.

### JSON-Web-Tokens (JWT)
The application uses the stateless JSON-Web-Tokens for user authentication. The inner functions are primarly managed by the `flask_jwt_extended` package. 
The `JWTManager` instance can be accessed after initialisation through the `app.jwt` or `current_app.jwt` property.
Protected endpoints are marked with the `@jwt_required` decorator. The invoking user identity can be accessed through the `get_jwt_identity()` function.
Please refer to the [flask_jwt_extended documentation](https://flask-jwt-extended.readthedocs.io/en/stable/) for more information.

The JWT tokens are signed using the binary contents of the file in the `APP_JWT_SECRET_KEY` environment variable.
A secure key can be generated using the [keygen.py](../keygen.py) script. 
The JWT tokens are used to authenticate users and to authorize them to access certain resources.

There are currently 2 roles. An `admin` role and a `user` role. The `admin` role has the ability to open developer tools on the frontend, see/modify other user (protected) data and promote another user to admin.
The `user` role is the default and has access to all api endpoints, but is limited to read-only unless the user owns the entity.

The tokens are stored as a `http-only` `access_token_cookie` cookie. The cookie is only valid for the domain of the site (as per default cookie behaviour).
A token is valid for 1 hour by default, but can be changed through the `APP_JWT_TOKEN_EXPIRE` env variable.
The token is automatically refreshed if the user makes a new request 30 minutes before the token is about to expire.  

### Password-based authentication
#### Registration
The app supports registration of new users. The registration endpoint is `/api/auth/register` and accepts a `POST` request.
Registration can be enabled/disabled through the `APP_REGISTER_ENABLED` environment variable. A frontend is available at `/register`.

On registration, the user is required to provide a unique username, firstname, lastname and password. The password is hashed with a salt using the `bcrypt` package. Both the password hash and the salt are stored in the database. The password is never stored in plaintext.
There is currently no email verification or captcha required for registration. 
There is also no possibility to reset a forgotten password.

Once a new user is created, the user is automatically logged in and a JWT token is both returned in the response and as a `http-only` cookie.
When using the frontend, the user is automatically redirected to the index page, which is now accessable.
On creation, a new Player and Island object are created among the UserProfile object. This is because these 3 entities all have a weak, one-to-one relationship with each other (see ER-diagram).

#### Login
Login is onde through the `/api/auth/login` endpoint. The endpoint accepts a `POST` request with the username and password in the request body.
Login can be enabled/disabled through the `APP_LOGIN_ENABLED` environment variable. A frontend is available at `/login`.

On login, the user is required to provide a username and password. The password is hashed and compared to the stored hash in the database. This comparisation uses the `bcrypt.checkpw()` function, which is safe from timing attacks.
If the hashes match, the user is logged in and a JWT token is both returned in the response and as a `http-only` cookie.
When using the frontend, the user is automatically redirected to the index page, which is now accessable.


**Note**: There is NO CSRF protection in the entire application. This would otherwise complicate the use of the application even more and is beyond the scope of this project.
When implementing CSRF protection for the JWT cookie, please refer to [this page](https://flask-jwt-extended.readthedocs.io/en/stable/token_locations.html#cookies).

### OAuth2
The app currently supports the OAuth2 protocol for external authentication. The current design works for Google login, but should be usable for any OAuth2 complient provider (slight modifications may or may not be required).
For more information about the workings of the OAuth2 protocol & implementation, see the [oauthlib documentation](https://oauthlib.readthedocs.io/en/latest/).

To enable OAuth2, set the following environment variables in the `.env` file (see [env.md](ENV.md) for a complete list):
```bash
APP_OAUTH_ENABLED=true
APP_OAUTH_CLIENT_ID=<client_id>
APP_OAUTH_CLIENT_SECRET=<client_secret>
APP_OAUTH_DISCOVERY_URL=<discovery_url> # for Google, this is https://accounts.google.com/.well-known/openid-configuration
```

To start a new OAuth2 procedure, call the `/api/auth/oauth/login` `GET` endpoint. This endpoint will redirect the user to the OAuth2 provider's login page for this application.
When the user has successfully authenticated, the OAuth2 provider should redirect the user to the `/api/auth/oauth/callback` `GET` endpoint with the `state` and `code` query parameters set in order to complete the authentication process.

OAuth login with Google is possible through the frontend by using the 'continue with Google' button on the login page.
When a user has no account associated with its Google account (identified by the SSO id), a new account is created like the password-based registration. 
In either case is the user is automatically logged in on succesful authentication.

**Note**: The `APP_DEBUG` environment variable can be set to `true` to enable insecure oauthlib transport (so you can host your site over http instead of https). This is useful for development purposes, but should never be enabled in production (and is therefore disabled by default in oauthlib).