# database.py
import motor.motor_asyncio

MONGO_DETAILS = "mongodb+srv://invicube:VPPvMMr3myWv6glO@cluster0.qwsfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"  # Update if needed
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

# Change the database name to leetcode_db
database = client.leetcode_db
# Filtered posts (only quality_flag=1) and original posts
filtered_posts_collection = database.get_collection("filtered_posts")
posts_collection = database.get_collection("posts")


