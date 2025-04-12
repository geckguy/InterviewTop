import json
import logging
import time
import re
from itertools import islice

from pymongo import MongoClient
from google import genai  # Ensure you have installed the google-genai package
from google.genai import types

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# MongoDB Setup
mongo_client = MongoClient('mongodb+srv://invicube:VPPvMMr3myWv6glO@cluster0.qwsfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = mongo_client['leetcode_db']
posts_collection = db['posts']
quality_collection = db['quality_flags']
processed_collection = db['processed_posts']

# API Keys Setup: list of API keys to rotate through when rate limited
API_KEYS = [
    "AIzaSyCxtFCD3XIakaC_bhbI_Gve7lOcD43H_cE",
    "AIzaSyAtTl9tSSCjh5DcXDlmRcAl4495bMkuhOc",
    "AIzaSyAeU-iP-zv6Ra-WerHImaYWDljQJvb2Qj8",  
    "AIzaSyD-1BVx_SMFPwtWlzkVhWicWgSpJoLOCTk",
    "AIzaSyB-KiF1jaQhdQ5GvOOmi-6egkurmLTebyg",
    "AIzaSyAjFwi2L4vNUcmy5pcIgLe4KINcHg4k1_U"
]
current_api_key_index = 0

def get_gemini_client():
    """Returns a Gemini API client using the current API key."""
    current_key = API_KEYS[current_api_key_index]
    return genai.Client(api_key=current_key)

PROMPT_INSTRUCTIONS ="""You are an expert interview analyst. For each post:
1. Determine if the post has sufficient technical and interview details:
   - If not, set "quality_flag" = 0 and return only:
       {
         "quality_flag": 0,
         "quality_reasoning": "<5–10 words here>"
       }
   - If yes, set "quality_flag" = 1.
2. If "quality_flag" = 1, return a JSON object with:
   - company (omit if not found)
   - position (omit if not found)
   - location (omit if not found)
   - seniority ("junior", "senior", or "above senior"; omit if unknown)
   - interview_details: array of { round_number, type ("Technical (Coding)", "Design", "HR", etc.), questions[] }
     - If only partial round info is given, fill in missing details logically and minimally based on typical software dev interviews.
   - leetcode_questions: array of { problem_name, problem_statement, function_signature, test_cases[] }
     - Each test case must have "input", "output", "explanation".
     - If partial, carefully expand to a coherent set of test cases.
   - design_questions: array of { design_task, description, guiding_questions[] }
     - If partial, expand logically in line with the context.
   - problem_link: array of any relevant URLs (e.g., LeetCode)
   - difficulty: "easy", "medium", or "hard" (omit if unknown)
   - offer_status: "accepted", "rejected", "pending" (omit if unknown)
   - compensation_details (omit if not found)
   - quality_flag: 1
   - quality_reasoning: a 5–10 word justification
No extra commentary. Provide one JSON object per post, in the order given.
Posts:
"""
# # Prompt instructions for batch processing multiple posts
# PROMPT_INSTRUCTIONS = """You are an expert interview analyst and problem setter. You will be given multiple interview experience posts. For each post, perform the following:

# 1. Candidate Background Extraction:
#    - Extract the company name where the interview took place. If not mentioned, omit the company field entirely.
#    - Extract the candidate's position. If not mentioned, omit the position field.
#    - Extract the interview or company location. If not mentioned, omit the location field.
#    - Categorize the position into one of three categories: "junior", "senior", or "above senior". If not determinable, omit the seniority field.

# 2. Interview Details:
#    - For each interview round, output an object with:
#        "round_number": (e.g., 1, 2, 3),
#        "type": (e.g., "Technical (Coding)", "Design", "HR"),
#        "questions": an array of concise bullet points summarizing the round.

# 3. LeetCode-Style Questions:
#    - For each coding round in the post, generate a complete LeetCode style problem. Output these as an array under "leetcode_questions". Each problem must include:
#        - "problem_name"
#        - "problem_statement": a clear, detailed description
#        - "function_signature"
#        - "test_cases": an array of example test cases, each with "input", "output", and "explanation".

# 4. Design Questions:
#    - For each design round (LLD/HLD) in the post, generate a concise design prompt. Output these as an array under "design_questions". Each design prompt should include:
#        - "design_task": a short title
#        - "description": a brief description of the design challenge
#        - "guiding_questions": an array of guiding questions.

# 5. Problem Link Extraction:
#    - If the post contains any URL to a problem (e.g., "https://leetcode.com/problems/..."), extract all such URLs and output them as an array under "problem_link".

# 6. Interview Difficulty:
#    - Assess the overall difficulty of the interview process based on the questions asked, number of rounds, and complexity of tasks.
#    - Categorize as "easy", "medium", or "hard".  If not determinable, omit the difficulty field.

# 7. Offer Status:
#    - Extract whether the candidate received an offer at the end of the interview process.
#    - Set "offer_status" to one of: "accepted", "rejected", "pending". If not mentioned, omit the offer_status field.

# 8. Quality Flag:
#     - Set "quality_flag" to 1 if the post contains meaningful interview details such as: interview rounds, questions asked, interviewer interactions, preparation strategies, results, or company-specific information.
#     - Be inclusive rather than strict - mark as quality (1) if the post offers any substantive interview insights. 
#     - Set to 0 only if the post lacks specific interview experience information.
# 9. Quality Reasoning:
#     - Provide "quality_reasoning": a very brief (5-10 words) explanation justifying the quality_flag value.
# Important
#     - If you set "quality_flag" to 0, do not include any of the other fields (1–7) in your output. Only return quality_flag and quality_reasoning.
#     - If you set "quality_flag" to 1, then return all fields (1–9) in your final JSON.

# Return your output as structured JSON for each post in the same order as given below. Do not include any extra commentary.

# Posts:
# """

def grouper(iterable, n):
    """Yield successive n-sized chunks from iterable."""
    it = iter(iterable)
    while True:
        group = list(islice(it, n))
        if not group:
            break
        yield group

def call_gemini_batch(prompt_text):
    """
    Calls the Gemini API with the combined prompt for a batch of posts.
    Loops through the API keys if a rate limit or similar error occurs.
    Returns the raw response text if successful, else None.
    """
    global current_api_key_index
    max_attempts = len(API_KEYS)
    attempt = 0

    while attempt < max_attempts:
        gemini_client = get_gemini_client()
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.5-pro-exp-03-25",
                contents=[prompt_text],
                config=types.GenerateContentConfig(
                    system_instruction="You are an expert interview analyst and problem setter. Analyze interview experience posts and extract structured information according to the instructions provided. Return only JSON output without additional commentary."
                )
            )
            return response.text  # raw output
        except Exception as e:
            error_message = str(e).lower()
            logging.error(f"Error calling Gemini API with API key {API_KEYS[current_api_key_index]}: {e}")
            # Check if error indicates rate limiting or similar issue
            if "rate limit" in error_message or "quota" in error_message:
                logging.info("Rate limit encountered. Switching API key.")
                # Rotate to the next API key
                current_api_key_index = (current_api_key_index + 1) % len(API_KEYS)
                attempt += 1
                # Brief pause before retrying
                time.sleep(1)
            else:
                # For other errors, do not retry with a different API key.
                break
    logging.error("All API keys have been exhausted or a non-rate-limit error occurred.")
    return None

def parse_gemini_output(output_text):
    """
    Attempts to parse the Gemini output into a list of JSON objects.

    1. Look for multiple JSON blocks enclosed in ```json ``` fences.
    2. If none found, try parsing the entire string as JSON (array or object).
    3. If that fails, try line-by-line parsing in case each line is its own JSON object.
    """
    # First, remove any leading or trailing backticks
    cleaned_text = output_text.strip()
    if cleaned_text.startswith("```json"):
        cleaned_text = cleaned_text[len("```json"):].strip()
    if cleaned_text.endswith("```"):
        cleaned_text = cleaned_text[:-3].strip()

    # Attempt to find JSON blocks within triple backticks
    json_blocks = re.findall(r"```json(.*?)```", output_text, re.DOTALL)

    results = []
    # If we found JSON code fences, parse each block individually
    if json_blocks:
        for block in json_blocks:
            block = block.strip()
            try:
                parsed_obj = json.loads(block)
                # If it's a list, extend results, else append
                if isinstance(parsed_obj, list):
                    results.extend(parsed_obj)
                else:
                    results.append(parsed_obj)
            except json.JSONDecodeError as e:
                logging.error("Error parsing a JSON block: %s", e)
    else:
        # 1. Try parsing the entire cleaned_text as JSON
        try:
            parsed = json.loads(cleaned_text)
            if isinstance(parsed, list):
                return parsed
            else:
                return [parsed]
        except json.JSONDecodeError:
            # 2. Fall back to line-by-line
            for line in cleaned_text.splitlines():
                line = line.strip()
                if not line:
                    continue
                try:
                    results.append(json.loads(line))
                except json.JSONDecodeError:
                    continue

    return results

def process_quality_posts(batch_size):
    """
    Processes posts that have a quality_flag of 1 from the quality_flags collection,
    filters out those already in processed_posts,
    groups the remaining posts in batches of `batch_size`,
    sends the combined prompt to Gemini,
    and stores the resulting JSON outputs in processed_posts.
    """
    # 1. Retrieve topicIds with quality_flag == 1 (convert to int if needed)
    quality_docs = list(quality_collection.find({"quality_flag": 1}))
    topic_ids = []
    for doc in quality_docs:
        try:
            topic_ids.append(int(doc["topicId"]))
        except ValueError:
            logging.error("Invalid topicId in quality_flags: %s", doc["topicId"])
    logging.info("Found %d topicIds in quality_flags.", len(topic_ids))

    # 2. Fetch matching posts from posts_collection
    posts = list(posts_collection.find({"topicId": {"$in": topic_ids}}))
    logging.info("Found %d posts matching quality_flags.", len(posts))

    # 3. Filter out already processed
    unprocessed_posts = []
    for post in posts:
        topic_id = post.get("topicId")
        if processed_collection.find_one({"topicId": topic_id}):
            logging.info("Topic %s already processed. Skipping.", topic_id)
        else:
            unprocessed_posts.append(post)
    logging.info("Total unprocessed posts: %d", len(unprocessed_posts))

    if not unprocessed_posts:
        logging.info("No unprocessed posts found.")
        return

    processed_count = 0

    # 4. Process posts in batches
    for group in grouper(unprocessed_posts, batch_size):
        # Build the combined prompt
        combined_prompt = PROMPT_INSTRUCTIONS + "\n"
        for idx, post in enumerate(group, start=1):
            title = post.get("title", "")
            content = post.get("content", "")
            post_text = f"Post {idx}:\nTitle: {title}\nContent: {content}\n"
            combined_prompt += post_text + "\n"

        logging.info("Sending combined prompt for %d posts.", len(group))
        output_text = call_gemini_batch(combined_prompt)
        if output_text is None:
            logging.error("Failed to get a response for the current batch.")
            continue

        # 5. Parse the output
        results = parse_gemini_output(output_text)
        if not results or len(results) != len(group):
            logging.warning("Expected %d results but got %d. Skipping this batch.", len(group), len(results))
            continue

        # 6. Store each processed result with the corresponding topicId
        for post, result in zip(group, results):
            topic_id = post.get("topicId")
            result["topicId"] = topic_id
            try:
                processed_collection.insert_one(result)
                logging.info("Stored processed output for topicId %s", topic_id)
                processed_count += 1
            except Exception as e:
                logging.error("Error storing result for topicId %s: %s", topic_id, e)

        # Pause between batches to avoid rate limits
        time.sleep(1)

    logging.info("Processing complete. %d posts processed.", processed_count)

if __name__ == "__main__":
    process_quality_posts(batch_size=5)