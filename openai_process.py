from openai import OpenAI  # Updated OpenAI client interface
import json
import logging
import time
from pymongo import MongoClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# OpenAI Client Initialization (replace with your actual API key)
client = OpenAI(api_key="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")


# MongoDB Connection (update MONGO_URI if needed)
MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "leetcode_db"
POSTS_COLLECTION_NAME = "posts"
QUALITY_COLLECTION_NAME = "quality_flags"

mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DATABASE_NAME]
posts_collection = db[POSTS_COLLECTION_NAME]
quality_collection = db[QUALITY_COLLECTION_NAME]
def upload_file(file_path):
    # This function should upload the file and return an object with an 'id' field.
    logging.info(f"Uploading file: {file_path}")
    try:
        with open(file_path, "rb") as f:
            # The file is uploaded for batch processing.
            uploaded_file = client.files.create(
                file=f,
                purpose="batch"
            )
        logging.info(f"File uploaded successfully with id: {uploaded_file.id}")
        return uploaded_file
    except Exception as e:
        logging.error("Error uploading file", exc_info=True)
        raise

def create_batch_job(input_file_id, endpoint="/v1/chat/completions", completion_window="24h"):
    # This function should create a batch job and return an object with an 'id' field.
    logging.info(f"Creating batch job with file id: {input_file_id}")
    try:
        batch_job = client.batches.create(
            input_file_id=input_file_id,
            endpoint=endpoint,
            completion_window=completion_window
        )
        logging.info(f"Batch job created successfully with id: {batch_job.id}")
        return batch_job
    except Exception as e:
        logging.error("Error creating batch job", exc_info=True)
        raise

# Build a quality flag task for batch processing.
def build_quality_task(custom_id, title, combined_text):
    """
    Build a task request that sends a prompt to GPT-4o to output only the quality flag.
    """
    prompt = f"""
    You are an expert interview analyst. Evaluate the following post for its relevance as an interview experience account. A post is considered relevant if it includes any clear interview context (e.g., candidate background, interview rounds, interactions). If the post does not include clear interview context and is merely a technical solution or code snippet, output only a JSON object {{"quality_flag": 0}}. Otherwise, output only a JSON object {{"quality_flag": 1}}.
    
    Do not include any extra text.
    
    Post Text:
    {combined_text}
    """
    task = {
        "custom_id": custom_id,
        "method": "POST",
        "url": "/v1/chat/completions",
        "body": {
            "model": "gpt-4o",
            "messages": [
                {"role": "user", "content": prompt.strip()}
            ],
            "max_tokens": 100
        }
    }
    return task

def build_batch_tasks(limit=200):
    """
    Build batch tasks for up to `limit` posts from the 'posts' collection,
    skipping those whose topicId is already present in the quality_flags collection.
    Returns a list of task dictionaries.
    """
    tasks = []
    posts_cursor = posts_collection.find().limit(limit)
    
    for post in posts_cursor:
        topic_id = post.get("topicId")
        # Skip if quality flag already exists for this topicId
        if quality_collection.find_one({"topicId": topic_id}):
            logging.info(f"Quality flag for topicId {topic_id} already exists. Skipping.")
            continue
        
        title = post.get("title", "")
        content = post.get("content", "")
        combined_text = f"{title}\n\n{content}"
        custom_id = f"quality-{topic_id}"
        task = build_quality_task(custom_id, title, combined_text)
        tasks.append(task)
    
    return tasks

def write_tasks_to_file(tasks, file_name="batch_tasks_quality2.jsonl"):
    """
    Writes the list of task dictionaries to a JSONL file.
    """
    with open(file_name, 'w') as file:
        for task in tasks:
            file.write(json.dumps(task) + "\n")
    logging.info(f"Batch tasks file created: {file_name}")
    return file_name

def main():
    # Build tasks from posts
    tasks = build_batch_tasks(limit=200)
    if not tasks:
        logging.info("No new tasks to process.")
        return

    # Write tasks to a JSONL file
    file_name = write_tasks_to_file(tasks)
    
    # Upload the file using your batch client's file upload functionality
    uploaded_file = upload_file(file_name)
    logging.info(f"File uploaded: {uploaded_file.id}")
    
    # Create the batch job with the uploaded file ID
    batch_job = create_batch_job(input_file_id=uploaded_file.id, endpoint="/v1/chat/completions", completion_window="24h")
    logging.info(f"Batch job created: {batch_job.id}")

if __name__ == "__main__":
    main()