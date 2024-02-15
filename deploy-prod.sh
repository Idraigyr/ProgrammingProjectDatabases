#!/bin/bash
# TODO: check if user app is able to perform sudo in a non interactive environement

sudo systemctl stop webapp-prod

# Copy .env file to a safe place
mkdir prod-temp
cp PPDB-Prod/.env prod-temp/.env
# Nuke everything in our way
rm -rf PPDB-Prod

# Clone the repo
git clone git@github.com:Idraigyr/ProgrammingProjectDatabases.git PPDB-Prod
# Restore env file
cp prod-temp/.env PPDB-Prod/

cd PPDB-Prod
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

sudo systemctl start webapp-prod

sudo systemctl status webapp-prod | exit 1
