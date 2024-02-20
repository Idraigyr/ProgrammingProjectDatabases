"""
WSGI entry point for the application.
Only use with production WSGI server, such as Gunicorn.
"""

if __name__ == "__main__":
    from app import setup
    app = setup()
    print("Booting WSGI server")
    app.run(app.config['APP_BIND'], debug=False) # WSGI should only be in production, so no debugging here
