import json
import logging
import re
from pymongo import MongoClient
import openai  # Import the updated openai module

# Set up logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# MongoDB Connection (update MONGO_URI if needed)
MONGO_URI = "mongodb+srv://invicube:***REMOVED***@cluster0.qwsfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "leetcode_db"
POSTS_COLLECTION_NAME = "posts"
QUALITY_COLLECTION_NAME = "quality_flags"

mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DATABASE_NAME]
posts_collection = db[POSTS_COLLECTION_NAME]
quality_collection = db[QUALITY_COLLECTION_NAME]

# OpenAI API Initialization (replace with your actual API key)
openai.api_key = "***REMOVED***"

def get_quality_flag(custom_id, title, combined_text):
    """
    Sends a prompt to GPT-4o-mini via the updated OpenAI API.
    The prompt instructs the model to output only a JSON object with a 'quality_flag' key.
    """
    system_prompt_text = (
        "You are an expert interview analyst. Evaluate the following post for its relevance as an interview experience account.\n"
        "A post is considered RELEVANT (quality_flag: 1) if it includes ANY of these interview context elements:\n"
        "- Interview rounds or stages (e.g., \"Round 1\", \"Technical interview\", \"HR round\")\n"
        "- Interview questions or problems asked\n"
        "- Descriptions of interactions with interviewers\n"
        "- Candidate's interview preparation or experience\n"
        "- Interview results (accept/reject/pending)\n"
        "- Company names along with interview details\n\n"
        "A post is considered IRRELEVANT (quality_flag: 0) ONLY if it contains none of the above and is merely:\n"
        "- A standalone technical solution without interview context\n"
        "- A general question about a company without interview details\n"
        "- A coding problem without any mention of interviews\n\n"
        "Don't have to think too much and don't solve anything just decide whether relevant or not\n\n"
        "Your output must be EXACTLY one of these two options with no additional text:\n"
        '{"quality_flag": 1}\n{"quality_flag": 0}\n\n'
        "Post Text:"
    )
    
    messages = [
        {"role": "system", "content": system_prompt_text},
        {"role": "user", "content": combined_text}
    ]
    
    logging.info(f"Processing task {custom_id}")
    try:
        # Updated API call using the new client interface
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
            # Optionally, you can add parameters such as max_tokens if needed, e.g.:
            # max_tokens=500
        )
        # Extract the response content from the assistant's message
        response_content = response.choices[0].message.content
        logging.info(f"Response for {custom_id}: {response_content}")
        
        # Attempt to parse the response as JSON
        try:
            result = json.loads(response_content)
        except json.JSONDecodeError:
            json_pattern = r'\{.*?\}'
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
    For each post, it sends the post to GPT-4o-mini, obtains the quality flag, and stores the result in the database.
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
