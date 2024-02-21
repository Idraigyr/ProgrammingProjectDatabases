"""
WSGI entry point for the application.
Only use with production WSGI server, such as Gunicorn.
"""

from src.app import app

if __name__ == "__main__":
    print("Booting WSGI server")
    app.run()
