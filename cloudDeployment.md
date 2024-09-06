Explanation: run_db.sh
Variables: Defined necessary variables for the script.
AWS CLI Installation: Checks if the AWS CLI is installed, and installs it if not.
Download File: Downloads the SQL file from S3.
PostgreSQL Client Installation: Checks if the PostgreSQL client is installed, and installs it if not.
Create Database: Adds a check to see if the database exists. If it doesn't, it creates the database.
Restore Database: Restores the database using the SQL file.
Clean Up: Removes the local SQL file after the operation.