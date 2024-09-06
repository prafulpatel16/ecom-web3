#!/bin/bash

# Variables
S3_BUCKET="ecom-db2024"
S3_FILE_PATH="initdb.sql"
LOCAL_FILE_PATH="/tmp/initdb.sql"
RDS_ENDPOINT="ecom-db.craikm8oia4j.us-west-1.rds.amazonaws.com"
RDS_PORT="5432"
RDS_DB="ecomm"
RDS_USER="postgres"
RDS_PASSWORD="postgrestest"

# Install AWS CLI if not present
if ! command -v aws &> /dev/null
then
    echo "AWS CLI not found. Installing..."
    sudo yum install -y aws-cli
fi

# Download file from S3
aws s3 cp s3://$S3_BUCKET/$S3_FILE_PATH $LOCAL_FILE_PATH

# Install PostgreSQL client if not present
if ! command -v psql &> /dev/null
then
    echo "PostgreSQL client not found. Installing..."
    sudo yum install -y postgresql
fi

# Create the database if it doesn't exist
PGPASSWORD=$RDS_PASSWORD psql -h $RDS_ENDPOINT -U $RDS_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$RDS_DB'" | grep -q 1 || PGPASSWORD=$RDS_PASSWORD psql -h $RDS_ENDPOINT -U $RDS_USER -c "CREATE DATABASE \"$RDS_DB\""

# Restore the database
PGPASSWORD=$RDS_PASSWORD psql -h $RDS_ENDPOINT -U $RDS_USER -d $RDS_DB -f $LOCAL_FILE_PATH

# Clean up
rm $LOCAL_FILE_PATH
