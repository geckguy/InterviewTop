# database.py
import motor.motor_asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_URL")
if not MONGO_DETAILS:
    raise ValueError("No MONGO_URL environment variable set")
    
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

# Change the database name to leetcode_db
database = client.leetcode_db
# Filtered posts (only quality_flag=1) and original posts
filtered_posts_collection = database.get_collection("filtered_posts")
posts_collection = database.get_collection("posts")
# Users collection for authentication
users_collection = database.get_collection("users")


