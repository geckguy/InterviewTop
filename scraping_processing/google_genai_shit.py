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
import google.generativeai as genai # Main import
# Import specific types and exceptions needed
from google.generativeai.types import FinishReason
# Explicitly import the exceptions from the main genai module
from google.generativeai import Client, GenerativeModel # Ensure Client is importable
from google.generativeai import BlockedPromptException, StopCandidateException 

# --- Assume pymongo setup and other necessary imports are here ---
from pymongo import MongoClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- API Keys Setup ---
API_KEYS = [
    "***REMOVED***",
    "***REMOVED***",
    "***REMOVED***",
    "***REMOVED***",
    "***REMOVED***"
]
if not API_KEYS or "YOUR_API_KEY" in API_KEYS[0]: # Simplified check
     raise ValueError("Please replace 'YOUR_API_KEY_n' with your actual API keys in the API_KEYS list.")

current_api_key_index = 0

# --- Pydantic Models (ensure these are defined correctly as discussed before) ---
class TestCase(BaseModel):
    input: Any
    output: Any
    explanation: Optional[str] = None

class LeetCodeQuestion(BaseModel):
    problem_name: str
    problem_statement: str
    function_signature: Optional[str] = None
    test_cases: List[TestCase] = Field(default_factory=list)

class DesignQuestion(BaseModel):
    design_task: str
    description: str
    guiding_questions: List[str] = Field(default_factory=list)

class InterviewRound(BaseModel):
    round_number: int
    type: str
    questions: List[str] = Field(default_factory=list)

class PostAnalysisResult(BaseModel):
    quality_flag: int
    quality_reasoning: str
    company: Optional[str] = None
    position: Optional[str] = None
    location: Optional[str] = None
    seniority: Optional[str] = None
    interview_details: List[InterviewRound] = Field(default_factory=list)
    leetcode_questions: List[LeetCodeQuestion] = Field(default_factory=list)
    design_questions: List[DesignQuestion] = Field(default_factory=list)
    problem_link: List[str] = Field(default_factory=list)
    difficulty: Optional[str] = None
    offer_status: Optional[str] = None
    compensation_details: Optional[Dict[str, Any]] = None

    @field_validator('quality_flag')
    @classmethod
    def check_quality_flag(cls, v: int) -> int:
        if v not in [0, 1]:
            raise ValueError('quality_flag must be 0 or 1')
        return v
def get_gemini_client():
    """Creates and returns a genai.Client instance using the current API key."""
    global current_api_key_index
    if not API_KEYS:
        raise ValueError("API_KEYS list is empty.")
    if current_api_key_index >= len(API_KEYS) or current_api_key_index < 0:
         logging.warning(f"API key index {current_api_key_index} out of bounds (0-{len(API_KEYS)-1}). Resetting to 0.")
         current_api_key_index = 0

    current_key = API_KEYS[current_api_key_index]
    logging.info(f"Attempting to create genai.Client with API key index {current_api_key_index}")
    try:
        # Use the client pattern (Ensure google-generativeai is up-to-date: pip install --upgrade google-generativeai)
        client = genai.Client(api_key=current_key)
        logging.info(f"Successfully created genai.Client with API key index {current_api_key_index}")
        return client
    except AttributeError as ae:
         # Specific catch if 'Client' attribute is still missing (library issue)
         logging.error(f"Failed to create genai.Client (AttributeError): {ae}. Is 'google-generativeai' library up-to-date?")
         return None
    except Exception as e:
        logging.error(f"Failed to create genai.Client with API key index {current_api_key_index}: {e}")
        return None # Signal failure

# --- Core Function to Call Gemini API (Corrected Call Parameters and Exceptions) ---
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

    expected_schema = List[PostAnalysisResult]

    # *** FIX: Define safety settings using plain dictionaries and string values ***
    # These string values ("HARM_CATEGORY_...", "BLOCK_...") are standard for the API
    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    ]

    while attempt < max_attempts:
        actual_attempt_number = attempt // 2 + 1
        logging.info(f"--- Starting API Call Attempt {actual_attempt_number}/{len(API_KEYS)} (Internal attempt: {attempt + 1}/{max_attempts}) ---")

        gemini_client = get_gemini_client()

        if gemini_client is None:
            # ... (client creation retry logic remains the same) ...
            logging.warning(f"Failed to get Gemini client for key index {current_api_key_index}. Rotating key.")
            previous_key_index = current_api_key_index
            current_api_key_index = (current_api_key_index + 1) % len(API_KEYS)
            attempt += 1
            logging.warning(f"Rotated API key from index {previous_key_index} to {current_api_key_index}. Retrying client creation (Attempt {attempt + 1}/{max_attempts}).")
            time.sleep(2)
            continue


        last_used_key_index = current_api_key_index
        model_name = "models/gemini-2.5-pro-exp-03-25" # Use full model name format

        try:
            logging.info(f"Attempting API call with API key index {current_api_key_index} using model {model_name}.")

            generation_config_dict = {
                 'response_mime_type': "application/json",
                 'response_schema': expected_schema,
                 'temperature': 0.1,
            }

            # --- Make the API call using client.models.generate_content ---
            # Pass the safety_settings list of dictionaries directly
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=[prompt_text],
                config=generation_config_dict,
                safety_settings=safety_settings, # Passing the list of dicts
                request_options={"timeout": 600}
            )

            # --- Response Validation ---
            # Check finish reason using the imported FinishReason enum (assuming this import works)
            if not response.candidates:
                 # ... (no candidates error handling remains the same) ...
                 if response.prompt_feedback and response.prompt_feedback.block_reason:
                     logging.error(f"API call failed (Key Index {current_api_key_index}): Prompt Blocked - Reason: {response.prompt_feedback.block_reason.name}. Failing batch.")
                     return None
                 else:
                     logging.error(f"API call failed (Key Index {current_api_key_index}): No candidates returned and no explicit block reason found.")
                     raise RuntimeError("No response candidates or prompt feedback block reason")


            first_candidate = response.candidates[0]

            try:
                # Attempt to use the imported FinishReason enum
                finish_reason_enum = first_candidate.finish_reason
                if finish_reason_enum == FinishReason.SAFETY:
                    safety_ratings_str = ", ".join([f"{rating.category.name}: {rating.probability.name}" for rating in first_candidate.safety_ratings])
                    logging.error(f"API call blocked due to SAFETY reasons (Key Index {current_api_key_index}). Ratings: [{safety_ratings_str}]. Failing batch.")
                    return None

                if finish_reason_enum not in (FinishReason.STOP, FinishReason.MAX_TOKENS, FinishReason.FINISH_REASON_UNSPECIFIED):
                    logging.warning(f"API call finished unexpectedly (Key Index {current_api_key_index}): Reason={finish_reason_enum.name}. Output may be incomplete.")
                    if finish_reason_enum == FinishReason.MAX_TOKENS:
                        logging.warning("MAX_TOKENS reached. JSON structure might be incomplete. Proceeding cautiously.")
                        # return None # Safer approach
                    else:
                        logging.error(f"Problematic finish reason {finish_reason_enum.name}. Failing batch.")
                        return None
                finish_reason_name_for_log = finish_reason_enum.name # Get name for logging if enum worked

            except NameError:
                # Fallback if FinishReason enum wasn't available/imported correctly
                logging.warning("FinishReason enum access failed. Checking finish reason by attribute value.")
                finish_reason_val = getattr(first_candidate, 'finish_reason', None)
                # You might need to inspect 'finish_reason_val' to know if it's int/string/enum under the hood
                # This fallback is less robust - updating the library is preferred.
                # Assuming standard values for logging: 0: unspecified, 1: stop, 2: max_tokens, 3: safety, 4: recitation, 5: other
                finish_reason_map = {0: "UNSPECIFIED", 1: "STOP", 2: "MAX_TOKENS", 3: "SAFETY", 4: "RECITATION", 5: "OTHER"}
                finish_reason_name_for_log = finish_reason_map.get(finish_reason_val, f"UNKNOWN ({finish_reason_val})")

                if finish_reason_val == 3: # Assuming 3 is SAFETY
                    # ... log safety block ... (code omitted for brevity, same as above)
                    return None
                if finish_reason_val not in (1, 2, 0): # Assuming 1=STOP, 2=MAX_TOKENS, 0=UNSPECIFIED
                    # ... handle unexpected finish reasons ... (code omitted for brevity, same as above)
                    return None


            response_text = response.text
            if not response_text and first_candidate.content and first_candidate.content.parts:
                 response_text = "".join([part.text for part in first_candidate.content.parts if hasattr(part, 'text')])

            if not response_text:
                 # ... (handle no text output, same as before) ...
                 return None

            logging.info(f"Successful API call with key index {current_api_key_index}. Finish Reason: {finish_reason_name_for_log}.")
            return response_text

        # --- Exception Handling (Catching BlockedPromptException etc remains the same) ---
        except (BlockedPromptException, StopCandidateException) as safety_exception:
            logging.error(f"API call failed (Key Index {current_api_key_index}): Safety/Stop Exception - {type(safety_exception).__name__}: {safety_exception}. Failing batch.")
            return None
        except core_exceptions.PermissionDenied as pde:
             logging.error(f"Permission Denied (Key Index {current_api_key_index}): {pde}. Likely invalid API key. Rotating key.")
        except core_exceptions.ResourceExhausted as ree:
             logging.warning(f"Resource Exhausted/Rate Limit (Key Index {current_api_key_index}): {ree}. Rotating key and backing off.")
        except (core_exceptions.InternalServerError, core_exceptions.ServiceUnavailable) as server_error:
            logging.warning(f"Server Error ({getattr(server_error, 'code', 'N/A')}) (Key Index {current_api_key_index}): {server_error}. Rotating key and backing off.")
        except Exception as e:
            logging.error(f"Unexpected error during Gemini API call (Key Index {current_api_key_index}): {e.__class__.__name__}: {e}", exc_info=True)

        # --- Retry Logic (same as before) ---
        # ... (retry code remains the same) ...
        attempt += 1
        if attempt >= max_attempts:
            logging.error(f"Max attempts ({max_attempts}) reached. Failing batch after error on key index {last_used_key_index}.")
            break

        if last_used_key_index == current_api_key_index:
            previous_key_index = current_api_key_index
            current_api_key_index = (current_api_key_index + 1) % len(API_KEYS)
            logging.warning(f"Rotating API key from index {previous_key_index} to {current_api_key_index} due to error.")
        else:
            logging.warning(f"Retrying with current key index {current_api_key_index} after previous client creation failure.")

        sleep_time = min(2**(actual_attempt_number), 60)
        logging.info(f"Waiting {sleep_time}s before next attempt ({attempt + 1}/{max_attempts})...")
        time.sleep(sleep_time)


    logging.error("All API keys/attempts exhausted during API call.")
    return None


# --- Include your other functions here ---
# parse_gemini_output (Ensure ValidationError is imported)
def parse_gemini_output(output_text: Optional[str], expected_schema: type = List[PostAnalysisResult]) -> List[Dict]:
    """
    Parses the Gemini output, expecting a single JSON string representing a list
    conforming to the expected_schema (List[PostAnalysisResult]). Includes Pydantic validation.
    Returns a list of dictionaries on success, or an empty list on failure.
    """
    results = []
    if not output_text:
        logging.warning("Cannot parse: Received empty or null output text from API.")
        return results

    # --- Attempt to find and extract the JSON list ---
    # Gemini might sometimes add introductory text or markdown backticks
    # Try to find the outermost list structure '[...]'
    match = re.search(r'^\s*\[.*\]\s*$', output_text, re.DOTALL | re.MULTILINE)
    json_string_to_parse = output_text # Default to using the whole string

    if match:
        json_string_to_parse = match.group(0)
        logging.debug("Extracted JSON list from potentially larger output.")
    else:
         # Check for markdown code blocks
         match_md = re.search(r'```json\s*(\[.*\])\s*```', output_text, re.DOTALL | re.MULTILINE)
         if match_md:
              json_string_to_parse = match_md.group(1)
              logging.debug("Extracted JSON list from markdown code block.")
         else:
              logging.warning("Could not definitively isolate a JSON list structure ('[...]') or markdown block. Attempting to parse the full output.")

    try:
        parsed_data = json.loads(json_string_to_parse)
        if not isinstance(parsed_data, list):
            logging.error(f"Parsing Error: Expected a JSON list, but got type {type(parsed_data)} after loading.")
            logging.debug(f"Problematic non-list content after potential extraction (first 500 chars):\n{json_string_to_parse[:500]}")
            return results # Return empty list

        validated_results = []
        for i, item in enumerate(parsed_data):
            try:
                if not isinstance(item, dict):
                     logging.warning(f"Item {i} in parsed list is not a dictionary (type: {type(item)}). Skipping.")
                     continue

                # Use model_validate for Pydantic v2+
                validated_model = PostAnalysisResult.model_validate(item)
                # Use model_dump for Pydantic v2+
                validated_results.append(validated_model.model_dump(mode='json')) # Get dict output
            except ValidationError as ve:
                logging.error(f"Schema Validation Error for item {i}: {ve}")
                logging.debug(f"Invalid item content: {item}")
                # Optionally, decide whether to skip item or fail the whole batch
            except Exception as e:
                 logging.error(f"Unexpected error validating item {i}: {e}")
                 logging.debug(f"Problematic item content: {item}")
                 # Optionally, decide whether to skip item or fail the whole batch

        results = validated_results
        logging.info(f"Successfully parsed and validated {len(results)} items from JSON list.")

    except json.JSONDecodeError as e:
        logging.error(f"JSON Decode Error: Failed to parse the extracted/raw string. Error: {e}")
        logging.debug(f"Problematic JSON string attempted (first 500 chars):\n{json_string_to_parse[:500]}")
        logging.debug(f"Original full output (first 500 chars):\n{output_text[:500]}")
        return [] # Return empty list on decode error
    except Exception as e:
        logging.error(f"Unexpected error during parsing/validation: {e}")
        logging.debug(f"Content during unexpected error (first 500 chars):\n{output_text[:500]}")
        return [] # Return empty list on other errors

    return results


# process_quality_posts (Remains the same conceptually, relies on corrected call/parse)
def process_quality_posts(batch_size):
    """
    Processes posts using Gemini with JSON schema enforcement via the Client pattern.
    Strictly checks alignment and stores results only if alignment is confirmed.
    (Ensure MongoDB setup is done before calling this)
    """
    # --- MongoDB Setup (ensure this is executed) ---
    try:
        # Use your actual connection string securely (e.g., from environment variables)
        # MONGODB_URI = os.environ.get("MONGODB_URI", 'mongodb+srv://...')
        MONGODB_URI = 'mongodb+srv://invicube:***REMOVED***@cluster0.qwsfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
        mongo_client = MongoClient(MONGODB_URI)
        # Test connection
        mongo_client.admin.command('ping')
        logging.info("MongoDB connection successful.")
        db = mongo_client['leetcode_db']
        posts_collection = db['posts']
        quality_collection = db['quality_flags']
        processed_collection = db['processed_posts']
        # Create index if it doesn't exist for faster lookups
        processed_collection.create_index("topicId", unique=True) # unique=True prevents duplicates if run again
        quality_collection.create_index("topicId")
        posts_collection.create_index("topicId")

    except Exception as e:
        logging.error(f"MongoDB Connection Error: {e}")
        return # Cannot proceed without DB

    logging.info("Starting post processing...")

    try:
        # 1. Get quality topic IDs
        quality_docs = list(quality_collection.find({"quality_flag": 1}, {"topicId": 1, "_id": 0}))
        quality_topic_ids = {doc['topicId'] for doc in quality_docs if 'topicId' in doc}
        logging.info(f"Found {len(quality_topic_ids)} topic IDs with quality_flag=1.")
        if not quality_topic_ids:
            logging.info("No quality posts found to process.")
            return

        # 2. Get IDs already processed
        processed_docs = list(processed_collection.find({}, {"topicId": 1, "_id": 0}))
        processed_topic_ids = {doc['topicId'] for doc in processed_docs if 'topicId' in doc}
        logging.info(f"Found {len(processed_topic_ids)} topic IDs already processed.")

        # 3. Determine IDs to process
        ids_to_process = list(quality_topic_ids - processed_topic_ids)
        logging.info(f"Need to process {len(ids_to_process)} new topic IDs.")

        if not ids_to_process:
            logging.info("No new posts to process.")
            return

        # 4. Fetch actual post content for the required IDs
        # Fetch in chunks to avoid large memory usage if ids_to_process is huge
        posts_to_process = []
        fetch_chunk_size = 1000 # Adjust as needed
        for i in range(0, len(ids_to_process), fetch_chunk_size):
             chunk_ids = ids_to_process[i:i + fetch_chunk_size]
             posts_chunk = list(posts_collection.find({"topicId": {"$in": chunk_ids}}, {"_id": 0, "topicId": 1, "content": 1})) # Adjust fields as needed
             posts_to_process.extend(posts_chunk)
             logging.info(f"Fetched {len(posts_chunk)} posts in chunk {i // fetch_chunk_size + 1}")

        logging.info(f"Total posts fetched for processing: {len(posts_to_process)}")

        # 5. Loop through batches
        total_processed_count = 0
        batch_number = 0
        processed_topic_ids_in_run = set() # Track IDs processed in this specific run

        for group in grouper(posts_to_process, batch_size):
            batch_number += 1
            batch_topic_ids = [post.get("topicId", "UNKNOWN_ID") for post in group]
            logging.info(f"--- Processing Batch {batch_number} (Size: {len(group)}) ---")
            logging.debug(f"Batch Topic IDs: {batch_topic_ids}")

            # 6. Build prompt
            # Ensure PROMPT_INSTRUCTIONS is defined before this function is called!
            if 'PROMPT_INSTRUCTIONS' not in globals():
                 logging.error("PROMPT_INSTRUCTIONS is not defined. Cannot proceed.")
                 return

            combined_prompt = PROMPT_INSTRUCTIONS + "\n\n## Input Posts:\n"
            for idx, post in enumerate(group, start=1):
                 # Ensure content exists and is string
                 post_content = post.get("content", "")
                 post_id = post.get("topicId", f"UNKNOWN_ID_{idx}")
                 if not isinstance(post_content, str):
                     post_content = str(post_content) # Attempt to convert non-strings

                 # Basic truncation or cleaning if needed
                 # post_content_cleaned = post_content[:4000] # Example: limit length
                 post_content_cleaned = post_content

                 post_text = f"\n### Post {idx} (ID: {post_id})\n```text\n{post_content_cleaned}\n```\n"
                 combined_prompt += post_text

            combined_prompt += "\n## Required JSON Output Structure:\nProduce a single JSON list where each element corresponds to one input post and follows the schema defined.\n"
            # logging.debug(f"Combined prompt for Batch {batch_number}:\n{combined_prompt[:500]}...") # Log start of prompt

            # 7. Call call_gemini_batch
            output_text = call_gemini_batch(combined_prompt)

            if output_text is None:
                logging.error(f"API call failed for Batch {batch_number} (Topic IDs: {batch_topic_ids}). Skipping batch.")
                continue # Skip to the next batch

            # 8. Parse results
            results = parse_gemini_output(output_text, List[PostAnalysisResult])

            # 9. *** CRUCIAL ALIGNMENT CHECK ***
            if len(results) != len(group):
                logging.error(f"CRITICAL ALIGNMENT ERROR: Batch {batch_number} expected {len(group)} results, got {len(results)}. Skipping storage for this batch. Topic IDs: {batch_topic_ids}")
                logging.debug(f"Raw output for misaligned batch {batch_number} (first 1000 chars):\n{output_text[:1000]}...")
                # Optionally save problematic output for debugging
                # with open(f"error_batch_{batch_number}.txt", "w") as f:
                #     f.write(f"Topic IDs: {batch_topic_ids}\nExpected: {len(group)}, Got: {len(results)}\n\nOutput:\n{output_text}")
                continue # Skip to the next batch

            # 10. If aligned, loop through zip(group, results) and store
            logging.info(f"Alignment check passed for Batch {batch_number}. Storing {len(results)} results.")
            stored_in_batch = 0
            for post, result_dict in zip(group, results):
                 topic_id = post.get("topicId")
                 if topic_id is None:
                      logging.warning(f"Skipping post with missing topicId in Batch {batch_number}.")
                      continue
                 if not isinstance(result_dict, dict):
                     logging.warning(f"Skipping invalid result (not a dict: {type(result_dict)}) for topicId {topic_id} in Batch {batch_number}.")
                     continue

                 # Avoid reprocessing if somehow included again (safeguard)
                 if topic_id in processed_topic_ids_in_run:
                     logging.warning(f"Topic ID {topic_id} encountered again within the same run. Skipping duplicate storage.")
                     continue

                 # Add metadata
                 result_dict["topicId"] = topic_id
                 result_dict["_source_batch_number"] = batch_number
                 result_dict["_processed_timestamp"] = time.time()
                 # Add original content reference if needed (careful with size)
                 # result_dict["_original_content_preview"] = post.get("content", "")[:100]

                 try:
                      # Use update_one with upsert=True
                      update_result = processed_collection.update_one(
                           {"topicId": topic_id},
                           {"$set": result_dict},
                           upsert=True
                      )
                      if update_result.upserted_id:
                          # logging.info(f"Inserted result for topicId {topic_id}") # Too verbose?
                          stored_in_batch += 1
                          total_processed_count +=1
                      elif update_result.matched_count > 0 and update_result.modified_count > 0:
                           logging.warning(f"Updated existing result for topicId {topic_id} (should be rare if filtering works)")
                           stored_in_batch += 1 # Count updates too
                      elif update_result.matched_count > 0 and update_result.modified_count == 0:
                           logging.debug(f"Data for topicId {topic_id} already matched the update.")
                           # Don't increment stored_in_batch if nothing changed
                      else:
                           # This case should ideally not happen with upsert=True
                           logging.error(f"DB Update failed unexpectedly for topicId {topic_id} - no insert/update occurred.")

                      processed_topic_ids_in_run.add(topic_id) # Mark as processed in this run

                 except Exception as db_e:
                      logging.error(f"Error storing result for topicId {topic_id} in Batch {batch_number}: {db_e}")

            logging.info(f"Stored/Updated {stored_in_batch} results from Batch {batch_number}.")
            # Consider adding a small delay between batches if hitting API limits frequently
            time.sleep(5) # Pause between batches (adjust as needed)

        logging.info(f"--- Processing Complete --- Total new results stored/updated in this run: {total_processed_count}")

    except Exception as main_e:
        logging.error(f"An error occurred during the main processing loop: {main_e}", exc_info=True)
    finally:
        if 'mongo_client' in locals() and mongo_client:
            mongo_client.close()
            logging.info("MongoDB connection closed.")


# --- Helper for Batching (Stays the Same) ---
def grouper(iterable, n):
    """Collect data into fixed-length chunks or blocks"""
    it = iter(iterable)
    while True:
        group = list(islice(it, n))
        if not group:
            break
        yield group

# --- Prompt (MUST BE DEFINED) ---
# Define your actual prompt instructions here. Make sure it clearly asks for a
# JSON list where each element corresponds to an input post.
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
The final output MUST be a single JSON list `[...]`, where each element in the list is a JSON object representing one analyzed post, following the schema implicitly defined by the API configuration.

Posts:
"""


# --- Main Execution ---
if __name__ == "__main__":
    # Ensure necessary imports like ValidationError are available if used directly here
    # from pydantic import ValidationError # Already imported above

    # Set batch size (consider making this configurable via args or env vars)
    process_quality_posts(batch_size=7) # Adjust batch size based on token limits and performance