import secrets

with open('jwtRS256.key', 'wb') as f:
    f.write(secrets.token_bytes(256))