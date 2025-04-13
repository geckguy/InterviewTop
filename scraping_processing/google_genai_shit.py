import json
import logging
import time
import re
from itertools import islice
from typing import List, Optional, Dict, Any

# --- Pydantic Imports ---
from pydantic import BaseModel, Field, field_validator, ValidationError

# --- Google API Imports ---
from google.api_core import exceptions as core_exceptions
from google import genai  # Main import for Gemini

# --- MongoDB ---
from pymongo import MongoClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- API Keys Setup ---
API_KEYS = [
    "***REMOVED***",
    "***REMOVED***",
    "***REMOVED***",  
    "***REMOVED***",
    "***REMOVED***",
    "***REMOVED***",
    "***REMOVED***"
]
if not API_KEYS or "YOUR_API_KEY" in API_KEYS[0]:
    raise ValueError("Please replace 'YOUR_API_KEY_n' with your actual API keys in the API_KEYS list.")

current_api_key_index = 0

# --- Pydantic Models ---
class TestCase(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None

class LeetCodeQuestion(BaseModel):
    problem_name: str
    problem_statement: str
    function_signature: Optional[str] = None
    test_cases: list[TestCase] = Field(default_factory=list)

class DesignQuestion(BaseModel):
    design_task: str
    description: str
    guiding_questions: list[str] = Field(default_factory=list)

class InterviewRound(BaseModel):
    round_number: int
    type: str
    questions: list[str] = Field(default_factory=list)

class PostAnalysisResult(BaseModel):
    quality_flag: int
    quality_reasoning: str
    company: Optional[str] = None
    position: Optional[str] = None
    location: Optional[str] = None
    seniority: Optional[str] = None
    interview_details: list[InterviewRound] = Field(default_factory=list)
    leetcode_questions: list[LeetCodeQuestion] = Field(default_factory=list)
    design_questions: list[DesignQuestion] = Field(default_factory=list)
    problem_link: list[str] = Field(default_factory=list)
    difficulty: Optional[str] = None
    offer_status: Optional[str] = None
    compensation_details: Optional[str] = None  # changed Any -> str

    @field_validator('quality_flag')
    @classmethod
    def check_quality_flag(cls, v: int) -> int:
        if v not in [0, 1]:
            raise ValueError('quality_flag must be 0 or 1')
        return v


def get_gemini_client():
    """
    Creates and returns a genai.Client instance using the current API key.
    """
    global current_api_key_index
    if not API_KEYS:
        raise ValueError("API_KEYS list is empty.")
    if current_api_key_index >= len(API_KEYS) or current_api_key_index < 0:
        logging.warning(f"API key index {current_api_key_index} out of bounds (0-{len(API_KEYS)-1}). Resetting to 0.")
        current_api_key_index = 0

    current_key = API_KEYS[current_api_key_index]
    logging.info(f"Attempting to create genai.Client with API key index {current_api_key_index}")
    try:
        client = genai.Client(api_key=current_key)
        logging.info(f"Successfully created genai.Client with API key index {current_api_key_index}")
        return client
    except AttributeError as ae:
        logging.error(f"Failed to create genai.Client (AttributeError): {ae}")
        return None
    except Exception as e:
        logging.error(f"Failed to create genai.Client with API key index {current_api_key_index}: {e}")
        return None  # Signal failure

def call_gemini_batch(prompt_text):
    """
    Calls the Gemini API using the genai.Client pattern, requesting structured JSON
    by passing a config dictionary. Loops through API keys.
    Returns the raw response text if successful, else None.
    """
    global current_api_key_index
    max_attempts = len(API_KEYS) * 2
    attempt = 0
    last_used_key_index = -1

    # Our expected schema is a list of PostAnalysisResult
    expected_schema = list[PostAnalysisResult]


    while attempt < max_attempts:
        actual_attempt_number = (attempt // 2) + 1
        logging.info(
            f"--- Starting API Call Attempt {actual_attempt_number}/{len(API_KEYS)} "
            f"(Internal attempt: {attempt+1}/{max_attempts}) ---"
        )

        gemini_client = get_gemini_client()
        if gemini_client is None:
            logging.warning(f"Failed to get Gemini client for key index {current_api_key_index}. Rotating key.")
            previous_key_index = current_api_key_index
            current_api_key_index = (current_api_key_index + 1) % len(API_KEYS)
            attempt += 1
            logging.warning(
                f"Rotated API key from index {previous_key_index} to {current_api_key_index}. "
                f"Retrying client creation (Attempt {attempt + 1}/{max_attempts})."
            )
            time.sleep(2)
            continue

        last_used_key_index = current_api_key_index
        model_name = "models/gemini-2.5-pro-exp-03-25"  # Example model name

        try:
            logging.info(
                f"Attempting API call with API key index {current_api_key_index} using model {model_name}."
            )

            generation_config_dict = {
                'response_mime_type': "application/json",
                'response_schema': expected_schema,  # Make sure we use list[...] not List[...]
                'temperature': 0.1,
            }

            response = gemini_client.models.generate_content(
                model=model_name,
                contents=[prompt_text],      # or a single string if needed
                config=generation_config_dict
            )

            if not response.candidates:
                # If there's feedback about blocking, you could read it here
                logging.error(
                    f"API call failed (Key Index {current_api_key_index}): "
                    f"No candidates returned."
                )
                return None

            # Just grab the text of the first candidate (no FinishReason checks)
            first_candidate = response.candidates[0]
            response_text = getattr(first_candidate, "text", None)

                        # If response_text is empty and candidate has content parts, join them
            if not response_text and hasattr(first_candidate, "content") and first_candidate.content and first_candidate.content.parts:
                response_text = "".join(
                    part.text for part in first_candidate.content.parts if hasattr(part, 'text')
                )

            if not response_text:
                logging.error("Candidate had no text content.")
                return None

            logging.info(f"Successful API call with key index {current_api_key_index}.")
            return response_text

        except core_exceptions.PermissionDenied as pde:
            logging.error(
                f"Permission Denied (Key Index {current_api_key_index}): {pde}. "
                "Likely invalid API key. Rotating key."
            )
        except core_exceptions.ResourceExhausted as ree:
            logging.warning(
                f"Resource Exhausted/Rate Limit (Key Index {current_api_key_index}): {ree}. "
                "Rotating key and backing off."
            )
        except (core_exceptions.InternalServerError, core_exceptions.ServiceUnavailable) as server_error:
            logging.warning(
                f"Server Error ({getattr(server_error, 'code', 'N/A')}) "
                f"(Key Index {current_api_key_index}): {server_error}. Rotating key and backing off."
            )
        except Exception as e:
            logging.error(
                f"Unexpected error during Gemini API call (Key Index {current_api_key_index}): "
                f"{e.__class__.__name__}: {e}",
                exc_info=True
            )

        attempt += 1
        if attempt >= max_attempts:
            logging.error(
                f"Max attempts ({max_attempts}) reached. Failing batch after error "
                f"on key index {last_used_key_index}."
            )
            break

        if last_used_key_index == current_api_key_index:
            previous_key_index = current_api_key_index
            current_api_key_index = (current_api_key_index + 1) % len(API_KEYS)
            logging.warning(
                f"Rotating API key from index {previous_key_index} to {current_api_key_index} due to error."
            )
        else:
            logging.warning(
                f"Retrying with current key index {current_api_key_index} after previous client creation failure."
            )

        sleep_time = min(2 ** (actual_attempt_number), 60)
        logging.info(
            f"Waiting {sleep_time}s before next attempt ({attempt + 1}/{max_attempts})..."
        )
        time.sleep(sleep_time)

    logging.error("All API keys/attempts exhausted during API call.")
    return None

def parse_gemini_output(
    output_text: Optional[str],
    expected_schema: type = list[PostAnalysisResult]  # Not List[PostAnalysisResult]
) -> List[Dict]:
    """
    Parses the Gemini output, expecting a single JSON string representing a list
    conforming to the expected_schema (list[PostAnalysisResult]). Includes Pydantic validation.
    Returns a list of dictionaries on success, or an empty list on failure.
    """
    results = []
    if not output_text:
        logging.warning("Cannot parse: Received empty or null output text from API.")
        return results

    # Attempt to isolate a JSON array from the string
    match = re.search(r'^\s*\[.*\]\s*$', output_text, re.DOTALL | re.MULTILINE)
    json_string_to_parse = output_text

    if match:
        json_string_to_parse = match.group(0)
        logging.debug("Extracted JSON list from potentially larger output.")
    else:
        # Also check for code block style
        match_md = re.search(r'```json\s*(\[.*\])\s*```', output_text, re.DOTALL | re.MULTILINE)
        if match_md:
            json_string_to_parse = match_md.group(1)
            logging.debug("Extracted JSON list from markdown code block.")
        else:
            logging.warning("Could not definitively isolate a JSON list structure. Parsing the full output.")

    try:
        parsed_data = json.loads(json_string_to_parse)
        if not isinstance(parsed_data, list):
            logging.error(f"Parsing Error: Expected a JSON list, but got type {type(parsed_data)}.")
            return results

        validated_results = []
        for i, item in enumerate(parsed_data):
            try:
                if not isinstance(item, dict):
                    logging.warning(f"Item {i} in parsed list is not a dictionary (type: {type(item)}). Skipping.")
                    continue

                # For Pydantic v2:
                validated_model = PostAnalysisResult.model_validate(item)
                validated_results.append(validated_model.model_dump(mode='json'))

            except ValidationError as ve:
                logging.error(f"Schema Validation Error for item {i}: {ve}")
                logging.debug(f"Invalid item content: {item}")
            except Exception as e:
                logging.error(f"Unexpected error validating item {i}: {e}")
                logging.debug(f"Problematic item content: {item}")

        results = validated_results
        logging.info(f"Successfully parsed and validated {len(results)} items from JSON list.")

    except json.JSONDecodeError as e:
        logging.error(f"JSON Decode Error: {e}")
    except Exception as e:
        logging.error(f"Unexpected error during parsing/validation: {e}")

    return results

def process_quality_posts(batch_size):
    """
    Processes posts using Gemini with JSON schema enforcement via genai.Client.
    Strictly checks alignment and stores results only if alignment is confirmed.
    """
    try:
        MONGODB_URI = (
            'mongodb+srv://invicube:***REMOVED***@cluster0.qwsfv.mongodb.net/'
            '?retryWrites=true&w=majority&appName=Cluster0'
        )
        mongo_client = MongoClient(MONGODB_URI)
        mongo_client.admin.command('ping')
        logging.info("MongoDB connection successful.")
        db = mongo_client['leetcode_db']
        posts_collection = db['posts']
        quality_collection = db['quality_flags']
        processed_collection = db['processed_posts']
        processed_collection.create_index("topicId", unique=True)
        quality_collection.create_index("topicId")
        posts_collection.create_index("topicId")

    except Exception as e:
        logging.error(f"MongoDB Connection Error: {e}")
        return

    logging.info("Starting post processing...")

    try:
        # 1. Get topicIds that have quality_flag=1
        quality_docs = list(quality_collection.find({"quality_flag": 1}, {"topicId": 1, "_id": 0}))
        quality_topic_ids = {doc['topicId'] for doc in quality_docs if 'topicId' in doc}
        logging.info(f"Found {len(quality_topic_ids)} topic IDs with quality_flag=1.")
        if not quality_topic_ids:
            logging.info("No quality posts found to process.")
            return

        # 2. Already processed IDs
        processed_docs = list(processed_collection.find({}, {"topicId": 1, "_id": 0}))
        processed_topic_ids = {doc['topicId'] for doc in processed_docs if 'topicId' in doc}
        logging.info(f"Found {len(processed_topic_ids)} topic IDs already processed.")

        # 3. Determine which IDs to process
        ids_to_process = list(quality_topic_ids - processed_topic_ids)
        logging.info(f"Need to process {len(ids_to_process)} new topic IDs.")

        if not ids_to_process:
            logging.info("No new posts to process.")
            return

        # 4. Fetch the post contents
        posts_to_process = []
        fetch_chunk_size = 1000
        for i in range(0, len(ids_to_process), fetch_chunk_size):
            chunk_ids = ids_to_process[i : i + fetch_chunk_size]
            posts_chunk = list(
                posts_collection.find(
                    {"topicId": {"$in": chunk_ids}},
                    {"_id": 0, "topicId": 1, "content": 1}
                )
            )
            posts_to_process.extend(posts_chunk)
            logging.info(
                f"Fetched {len(posts_chunk)} posts in chunk {i // fetch_chunk_size + 1}"
            )

        logging.info(f"Total posts fetched for processing: {len(posts_to_process)}")

        total_processed_count = 0
        batch_number = 0
        processed_topic_ids_in_run = set()

        for group in grouper(posts_to_process, batch_size):
            batch_number += 1
            batch_topic_ids = [post.get("topicId", "UNKNOWN_ID") for post in group]
            logging.info(f"--- Processing Batch {batch_number} (Size: {len(group)}) ---")
            logging.debug(f"Batch Topic IDs: {batch_topic_ids}")

            if 'PROMPT_INSTRUCTIONS' not in globals():
                logging.error("PROMPT_INSTRUCTIONS is not defined. Cannot proceed.")
                return

            combined_prompt = PROMPT_INSTRUCTIONS + "\n\n## Input Posts:\n"
            for idx, post in enumerate(group, start=1):
                post_content = post.get("content", "")
                post_id = post.get("topicId", f"UNKNOWN_ID_{idx}")
                if not isinstance(post_content, str):
                    post_content = str(post_content)

                post_text = (
                    f"\n### Post {idx} (ID: {post_id})\n```text\n{post_content}\n```\n"
                )
                combined_prompt += post_text

            combined_prompt += (
                "\n## Required JSON Output Structure:\n"
                "Produce a single JSON list where each element corresponds to one input post "
                "and follows the schema defined.\n"
            )

            output_text = call_gemini_batch(combined_prompt)
            if output_text is None:
                logging.error(
                    f"API call failed for Batch {batch_number} (Topic IDs: {batch_topic_ids}). Skipping batch."
                )
                continue

            results = parse_gemini_output(output_text, list[PostAnalysisResult])

            # Check alignment
            if len(results) != len(group):
                logging.error(
                    f"CRITICAL ALIGNMENT ERROR: Batch {batch_number} expected {len(group)} results, "
                    f"got {len(results)}. Skipping storage for this batch. Topic IDs: {batch_topic_ids}"
                )
                logging.debug(f"Raw output for misaligned batch {batch_number}:\n{output_text[:1000]}...")
                continue

            logging.info(f"Alignment check passed for Batch {batch_number}. Storing {len(results)} results.")
            stored_in_batch = 0
            for post, result_dict in zip(group, results):
                topic_id = post.get("topicId")
                if topic_id is None:
                    logging.warning(f"Skipping post with missing topicId in Batch {batch_number}.")
                    continue
                if not isinstance(result_dict, dict):
                    logging.warning(
                        f"Skipping invalid result (not a dict: {type(result_dict)}) "
                        f"for topicId {topic_id} in Batch {batch_number}."
                    )
                    continue
                if topic_id in processed_topic_ids_in_run:
                    logging.warning(
                        f"Topic ID {topic_id} encountered again within the same run. Skipping duplicate storage."
                    )
                    continue

                # Add metadata
                result_dict["topicId"] = topic_id
                result_dict["_source_batch_number"] = batch_number
                result_dict["_processed_timestamp"] = time.time()

                try:
                    update_result = processed_collection.update_one(
                        {"topicId": topic_id},
                        {"$set": result_dict},
                        upsert=True
                    )
                    if update_result.upserted_id:
                        stored_in_batch += 1
                        total_processed_count += 1
                    elif update_result.matched_count > 0 and update_result.modified_count > 0:
                        logging.warning(
                            f"Updated existing result for topicId {topic_id} "
                            "(should be rare if filtering works)."
                        )
                        stored_in_batch += 1
                    elif update_result.matched_count > 0 and update_result.modified_count == 0:
                        logging.debug(
                            f"Data for topicId {topic_id} already matched the update."
                        )
                    else:
                        logging.error(
                            f"DB Update failed unexpectedly for topicId {topic_id}."
                        )
                    processed_topic_ids_in_run.add(topic_id)

                except Exception as db_e:
                    logging.error(
                        f"Error storing result for topicId {topic_id} in Batch {batch_number}: {db_e}"
                    )

            logging.info(f"Stored/Updated {stored_in_batch} results from Batch {batch_number}.")
            time.sleep(5)  # Sleep to throttle calls if needed

        logging.info(
            f"--- Processing Complete --- "
            f"Total new results stored/updated in this run: {total_processed_count}"
        )

    except Exception as main_e:
        logging.error(f"An error occurred during the main processing loop: {main_e}", exc_info=True)
    finally:
        if 'mongo_client' in locals() and mongo_client:
            mongo_client.close()
            logging.info("MongoDB connection closed.")

def grouper(iterable, n):
    """
    Collect data into fixed-length chunks or blocks
    """
    it = iter(iterable)
    while True:
        group = list(islice(it, n))
        if not group:
            break
        yield group

# --- Prompt instructions ---
PROMPT_INSTRUCTIONS = """You are an expert interview analyst. For each post:
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
     - If only partial round info is given, fill in missing details logically based on typical software dev interviews.
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
The final output MUST be a single JSON list `[...]`, where each element in the list is a JSON object representing one analyzed post, following the schema implicitly defined by the API configuration.

Posts:
"""

if __name__ == "__main__":
    process_quality_posts(batch_size=8)
