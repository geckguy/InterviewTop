import json
import logging
from openai import OpenAI
from pymongo import MongoClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# OpenAI Client Initialization (replace with your actual API key)
client = OpenAI(api_key="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")

# MongoDB Connection (update MONGO_URI and DB names if needed)
MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "leetcode_db"
POSTS_COLLECTION_NAME = "posts"            # if needed for reference
QUALITY_COLLECTION_NAME = "quality_flags"

mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DATABASE_NAME]
posts_collection = db[POSTS_COLLECTION_NAME]
quality_collection = db[QUALITY_COLLECTION_NAME]

# Specify your batch job ID from when you created the job
batch_job_id = "batch_67f2cee4e8948190a4697bcfd20774b0"

def clean_response(response):
    """
    Helper function to extract JSON from the model's response.
    """
    try:
        json_start = response.find("{")
        json_end = response.rfind("}") + 1
        json_content = response[json_start:json_end]
        return json.loads(json_content)
    except (json.JSONDecodeError, ValueError):
        return None

def process_batch_results():
    # Retrieve the batch job details
    final_batch_job = client.batches.retrieve(batch_job_id)
    logging.info("Batch job status: %s", final_batch_job.status)
    
    # Check if the job is completed or expired (partial results may be available)
    if final_batch_job.status in ['completed', 'expired']:
        result_file_id = final_batch_job.output_file_id
        result_content = client.files.content(result_file_id).content

        # Write the output to a file for processing
        result_file_name = "batch_job_results_quality.jsonl"
        with open(result_file_name, 'wb') as rf:
            rf.write(result_content)
        logging.info("Results written to %s", result_file_name)

        # Parse the results into a dictionary where key is the custom_id
        results = {}
        with open(result_file_name, 'r') as file:
            for line in file:
                try:
                    res = json.loads(line.strip())
                    custom_id = res.get('custom_id')
                    response_section = res.get('response', {})
                    body_section = response_section.get('body', {})
                    choices = body_section.get('choices', [])
                    if choices and 'message' in choices[0]:
                        response_content = choices[0]['message']['content']
                        results[custom_id] = response_content
                except json.JSONDecodeError:
                    logging.error("Failed to decode a line: %s", line)

        # Process each result and update the quality_flags collection
        for custom_id, response_content in results.items():
            clean_result = clean_response(response_content)
            if clean_result is not None:
                # Our custom_id format is "quality-{topicId}"
                parts = custom_id.split("-", 1)
                if len(parts) == 2:
                    topic_id = parts[1]
                    quality_flag = clean_result.get("quality_flag")
                    if quality_flag is not None:
                        quality_collection.update_one(
                            {"topicId": topic_id},
                            {"$set": {"quality_flag": quality_flag}},
                            upsert=True
                        )
                        logging.info("Updated quality flag for topicId %s: %s", topic_id, quality_flag)
                    else:
                        logging.error("No quality_flag found in response for custom_id: %s", custom_id)
                else:
                    logging.error("Custom_id format invalid: %s", custom_id)
            else:
                logging.error("Failed to parse response for custom_id: %s", custom_id)

        logging.info("Processing completed for all quality flag results.")
    else:
        logging.info("Batch job not completed yet. Please check again later.")

if __name__ == "__main__":
    process_batch_results()
