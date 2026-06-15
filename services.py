import os
import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_BUCKET = os.getenv("AWS_BUCKET_NAME")

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
    region_name = os.getenv("AWS_REGION")
)



async def upload_image_to_s3(file_bytes, file_name, content_type):

    s3_client.put_object(Bucket = AWS_BUCKET , Key= file_name , Body= file_bytes, ContentType= content_type)

    return f"https://{AWS_BUCKET}.s3.amazonaws.com/{file_name}"


