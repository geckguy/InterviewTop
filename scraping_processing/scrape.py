import requests
import json
import logging
import time
from pymongo import MongoClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# MongoDB Setup
client = MongoClient('mongodb://localhost:27017')
db = client['leetcode_db']
collection = db['posts']

graphql_url = 'https://leetcode.com/graphql/'

# Replace these with actual values from your curl command
csrftoken = 'PTKYjgdX17DUjjobBMWMHW8y73c8SSlvryjGz9PdUQi4zUpZnc61KpLlvghTdm0C'
cookie_string = f'csrftoken={csrftoken};'

headers_list = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'origin': 'https://leetcode.com',
    'referer': 'https://leetcode.com/discuss/',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    'x-csrftoken': csrftoken,
    'cookie': cookie_string,
}
def fetch_with_retry(url, headers, json_payload, max_retries=5):
    delay = 1
    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=json_payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as err:
            status = response.status_code
            if status in (429, 520, 503):  # common rate-limit or server errors
                logging.warning(f"Attempt {attempt+1}: Received {status} error. Retrying in {delay} seconds...")
                time.sleep(delay)
                delay *= 2  # exponential backoff
            else:
                logging.error(f"HTTP error on attempt {attempt+1}: {err}\nResponse text: {response.text}")
                raise err
        except Exception as e:
            logging.error(f"Error on attempt {attempt+1}: {e}")
            time.sleep(delay)
            delay *= 2
    raise Exception("Max retries exceeded")


def fetch_post_items(skip, first=100):
    payload = {
        "query": """
        query discussPostItems($orderBy: ArticleOrderByEnum, $keywords: [String]!, $tagSlugs: [String!], $skip: Int, $first: Int) {
          ugcArticleDiscussionArticles(
            orderBy: $orderBy
            keywords: $keywords
            tagSlugs: $tagSlugs
            skip: $skip
            first: $first
          ) {
            totalNum
            pageInfo { hasNextPage }
            edges {
              node {
                uuid
                title
                slug
                summary
                createdAt
                updatedAt
                topicId
              }
            }
          }
        }""",
        "variables": {
            "orderBy": "MOST_RECENT",
            "keywords": ["google"],
            "tagSlugs": [],
            "skip": skip,
            "first": first
        },
        "operationName": "discussPostItems"
    }
    return fetch_with_retry(graphql_url, headers_list, payload)

def fetch_post_detail(topicId):
    payload = {
        "query": """
        query discussPostDetail($topicId: ID!) {
          ugcArticleDiscussionArticle(topicId: $topicId) {
            uuid
            title
            slug
            summary
            content
            createdAt
            updatedAt
            topicId
          }
        }""",
        "variables": {"topicId": str(topicId)},
        "operationName": "discussPostDetail"
    }
    return fetch_with_retry(graphql_url, headers_list, payload)

# Main scraper loop
skip, first, has_next = 100, 100, True

while has_next:
    try:
        data = fetch_post_items(skip, first)
        articles = data["data"]["ugcArticleDiscussionArticles"]["edges"]
        has_next = data["data"]["ugcArticleDiscussionArticles"]["pageInfo"]["hasNextPage"]

        for article in articles:
            node = article["node"]
            topicId = node["topicId"]

            if collection.find_one({"topicId": topicId}):
                logging.info(f"Topic {topicId} already exists. Skipping.")
                continue

            details = fetch_post_detail(topicId)["data"]["ugcArticleDiscussionArticle"]

            post_data = {
                "uuid": details["uuid"],
                "title": details["title"],
                "slug": details["slug"],
                "summary": details["summary"],
                "content": details["content"],
                "createdAt": details["createdAt"],
                "updatedAt": details["updatedAt"],
                "topicId": details["topicId"]
            }

            collection.update_one({"topicId": topicId}, {"$set": post_data}, upsert=True)
            logging.info(f"Stored topic {topicId}")

            time.sleep(1)  # Adjust sleep to avoid rate limits

        skip += first
        time.sleep(2)  # Delay between batches

    except Exception as e:
        logging.error(f"Error: {e}")
        break

logging.info("Scraping completed.")
