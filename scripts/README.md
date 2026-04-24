# Data Pipeline Scripts

Scripts for scraping interview experiences from LeetCode Discuss and processing them with LLMs to extract structured data.

## Scripts

| Script                    | Purpose                                                    |
| ------------------------- | ---------------------------------------------------------- |
| `scrape.py`               | Scrapes interview discussion posts from LeetCode GraphQL API |
| `gemini_process.py`       | Processes posts using Google Gemini to extract structured interview data |
| `openai_process.py`       | Alternative processor using OpenAI GPT models              |
| `openai_4omini.py`        | Processor using OpenAI GPT-4o-mini                         |
| `openai_batch.py`         | Batch processing via OpenAI Batch API                      |
| `deepseek_process.py`     | Alternative processor using DeepSeek                       |
| `google_genai_process.py` | Additional Google GenAI processing script                  |

## Setup

1. Create a `.env` file (see `.env.example`)
2. Install dependencies: `pip install pymongo requests python-dotenv google-genai openai`
3. Run the desired script: `python scrape.py`

## Pipeline

1. **Scrape** → `scrape.py` fetches raw posts into `posts` collection
2. **Process** → One of the processor scripts (e.g. `gemini_process.py`) extracts structured data and stores in `processed_posts` / `filtered_posts`
