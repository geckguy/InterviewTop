import json
import logging
from pymongo import MongoClient
from ollama import chat  # Import the chat function from Ollama

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# MongoDB Connection (update MONGO_URI if needed)
MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "leetcode_db"
POSTS_COLLECTION_NAME = "posts"
QUALITY_COLLECTION_NAME = "quality_flags"

mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DATABASE_NAME]
posts_collection = db[POSTS_COLLECTION_NAME]
quality_collection = db[QUALITY_COLLECTION_NAME]

def get_quality_flag(custom_id, title, combined_text):
    """
    Send a prompt to deepseek-coder via Ollama's chat interface.
    The prompt instructs the model to output only a JSON object with a 'quality_flag' key.
    """
    prompt = f"""
    You are an expert interview analyst. Evaluate the following post for its relevance as an interview experience account.
A post is considered RELEVANT (quality_flag: 1) if it includes ANY of these interview context elements:
- Interview rounds or stages (e.g., "Round 1", "Technical interview", "HR round")
- Interview questions or problems asked
- Descriptions of interactions with interviewers
- Candidate's interview preparation or experience
- Interview results (accept/reject/pending)
- Company names along with interview details

A post is considered IRRELEVANT (quality_flag: 0) ONLY if it contains none of the above and is merely:
- A standalone technical solution without interview context
- A general question about a company without interview details
- A coding problem without any mention of interviews

Don't have to think too much and don't solve anything just decide whther relevant or not

Your output must be EXACTLY one of these two options with no additional text:
{{"quality_flag": 1}}
{{"quality_flag": 0}}

Post Text:
    {combined_text}
    """.strip()
    
    logging.info(f"Processing task {custom_id}")
    try:
        # Call the Ollama chat interface using deepseek-r1:7b
        response = chat(
            model='deepseek-r1:7b',
            messages=[
                {'role': 'user', 'content': prompt}
            ]
        )
        # Access the message content from the response
        response_content = response['message']['content']
        logging.info(f"Response for {custom_id}: {response_content}")
        
        # Extract JSON from the response if it's mixed with other text
        try:
            # Try to parse the entire response as JSON first
            result = json.loads(response_content)
        except json.JSONDecodeError:
            # If that fails, try to find a JSON object in the response
            import re
            json_pattern = r'\{.*?\}'  # Pattern to find JSON-like content
            matches = re.findall(json_pattern, response_content, re.DOTALL)
            if matches:
                try:
                    result = json.loads(matches[-1])  # Take the last JSON object found
                except json.JSONDecodeError:
                    logging.error(f"Failed to parse extracted JSON: {matches[-1]}")
                    return None
            else:
                logging.error("No JSON-like content found in the response")
                return None
        
        return result.get("quality_flag")
    except Exception as e:
        logging.error(f"Error processing task {custom_id}", exc_info=True)
        return None

def process_posts(limit):
    """
    Processes posts from the 'posts' collection (up to `limit`) that do not already have a quality flag.
    For each post, it calls deepseek-coder to obtain the quality flag and saves the result in the database.
    """
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
        flag = get_quality_flag(custom_id, title, combined_text)
        
        if flag is not None:
            quality_doc = {"topicId": topic_id, "quality_flag": flag}
            quality_collection.insert_one(quality_doc)
            logging.info(f"Inserted quality flag for topicId {topic_id}: {quality_doc}")
        else:
            logging.error(f"Failed to process quality flag for topicId {topic_id}")

def main():
    process_posts(limit=1000)

if __name__ == "__main__":
    main()