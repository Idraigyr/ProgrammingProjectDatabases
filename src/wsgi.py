from app import app
from os import environ

"""
WSGI entry point for the application.
Only use with production WSGI server, such as Gunicorn.
"""

if __name__ == "__main__":
    print("Booting WSGI server")
    app.run(environ.get('APP_BIND') or '0.0.0.0', debug=False) # WSGI should only be in production, so no debugging here
