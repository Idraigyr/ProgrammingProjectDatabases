#!/bin/bash
# Stop the running service
sudo systemctl stop webapp-prod

# Copy .env file and keys to a safe place
mkdir -p prod-temp
cp PPDB-Prod/.env prod-temp/.env
cp PPDB-Prod/jwtRS256.key prod-temp/jwtRS256.key
# Nuke everything in our way
rm -rf PPDB-Prod

# Clone the repo
git clone -b main git@github.com:Idraigyr/ProgrammingProjectDatabases.git PPDB-Prod
# Restore env file
cp prod-temp/.env PPDB-Prod/
cp prod-temp/jwtRS256.key PPDB-Prod/jwtRS256.key

# Setup the app
cd PPDB-Prod || exit 1
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

echo "Running migrations"
# Run database migrations, if any
flask --app src.app db upgrade

# Start the service
sudo systemctl start webapp-prod

# Finally, test if the service succesfully started
echo "Testing if the service is running"
sudo systemctl is-active --quiet webapp-prod || exit 1

echo "Testing if the site is reachable"
curl -s -o /dev/null https://team2.ua-ppdb.me || exit 1

echo "Done"
