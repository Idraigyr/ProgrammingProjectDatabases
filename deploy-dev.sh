#!/bin/bash
# Stop the running service
sudo systemctl stop webapp-dev

# Copy .env file to a safe place
mkdir dev-temp
cp PPDB-Dev/.env dev-temp/.env
# Nuke everything in our way
rm -rf PPDB-Dev

# Clone the repo
git clone -b dev git@github.com:Idraigyr/ProgrammingProjectDatabases.git PPDB-Dev
# Restore env file
cp dev-temp/.env PPDB-Dev/

# Setup the app
cd PPDB-Dev
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start the service
sudo systemctl start webapp-dev

# Finally, test if the service succesfully started
echo "Testing if the service is running"
sudo systemctl is-active --quiet webapp-dev || exit 1

echo "Testing if the site is reachable"
curl -s -o /dev/null https://team2.ua-ppdb.me:8081 || exit 1

echo "Done"
