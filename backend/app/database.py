# database.py
import motor.motor_asyncio
from app.config import MONGO_URL

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)

database = client.leetcode_db

# Filtered posts (only quality_flag=1) and original posts
filtered_posts_collection = database.get_collection("filtered_posts")
posts_collection = database.get_collection("posts")

# Users collection for authentication
users_collection = database.get_collection("users")

shared_experiences_collection = database.get_collection("shared_experiences")
