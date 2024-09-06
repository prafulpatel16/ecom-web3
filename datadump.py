import boto3
import os
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

def create_bucket(bucket_name, region=None):
    try:
        if region is None:
            s3_client = boto3.client('s3')
            s3_client.create_bucket(Bucket=bucket_name)
        else:
            s3_client = boto3.client('s3', region_name=region)
            location = {'LocationConstraint': region}
            s3_client.create_bucket(Bucket=bucket_name, CreateBucketConfiguration=location)
        print(f'Bucket {bucket_name} created successfully')
    except Exception as e:
        print(f'Error creating bucket: {e}')

def upload_file_to_bucket(file_name, bucket_name, object_name=None):
    try:
        s3_client = boto3.client('s3')
        if object_name is None:
            object_name = os.path.basename(file_name)
        s3_client.upload_file(file_name, bucket_name, object_name)
        print(f'File {file_name} uploaded to bucket {bucket_name} as {object_name}')
    except FileNotFoundError:
        print(f'The file {file_name} was not found')
    except NoCredentialsError:
        print('Credentials not available')
    except PartialCredentialsError:
        print('Incomplete credentials provided')
    except Exception as e:
        print(f'Error uploading file: {e}')

if __name__ == '__main__':
    # Define your bucket name and region
    bucket_name = 'ecom-db2024'
    region = 'us-west-1'  # or your preferred region

    # Define the file to upload
    file_name = 'D:\cloud-devops\ecom-web\database\initdb.sql'

    # Create an S3 bucket
    create_bucket(bucket_name, region)

    # Upload the SQL dump file to the bucket
    upload_file_to_bucket(file_name, bucket_name)
