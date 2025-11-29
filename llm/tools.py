import os
from datetime import datetime, timedelta
from typing import List, Optional
from langchain_core.tools import tool

# Replaced deprecated import with the new one
# pip install -U langchain-tavily
from dotenv import load_dotenv

# Try loading from current directory first, then parent
load_dotenv()
if not os.getenv("TAVILY_API_KEY"):
    load_dotenv("../.env")
from langchain_tavily import TavilySearch


# --- Configuration ---
LOGS_DIR = "./src/data/logs"
IMAGES_METADATA_DIR = "./src/data/parsedMemories"


@tool
def get_dates_of_written_logs() -> List[str]:
    """
    Scans the log directory and returns a list of all dates (YYYY-MM-DD) that have a log file.
    Useful for checking which days have recorded memories before trying to read them.
    """
    if not os.path.exists(LOGS_DIR):
        return []

    dates = []
    try:
        files = os.listdir(LOGS_DIR)
        for filename in sorted(files):
            if filename.endswith(".txt"):
                # filename is "YYYY-MM-DD.txt" -> remove ".txt"
                date_str = filename.replace(".txt", "")
                dates.append(date_str)
        return dates
    except Exception as e:
        return [f"Error reading directory: {str(e)}"]


@tool
def read_log(date_str: str) -> str:
    """
    Reads the full content of a daily log file for a specific date.

    Args:
        date_str: The date string in "YYYY-MM-DD" format.
    """
    filename = f"{date_str}.txt"
    file_path = os.path.join(LOGS_DIR, filename)

    if not os.path.exists(file_path):
        return f"No log file found for date: {date_str}"

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Error reading log file: {str(e)}"


@tool
def write_log(text: str) -> str:
    """
    Appends text to today's log file.
    Automatically handles timestamping and file creation.

    Args:
        text: The content to write (e.g., a memory, note, or observation).
    """
    today = datetime.now().strftime("%Y-%m-%d")
    filename = f"{today}.txt"
    file_path = os.path.join(LOGS_DIR, filename)

    try:
        os.makedirs(LOGS_DIR, exist_ok=True)

        file_exists = os.path.exists(file_path)

        with open(file_path, "a", encoding="utf-8") as f:
            # If new file, add header
            if not file_exists:
                f.write(f"=== Log for {today} ===\n\n")

            # Append content with timestamp
            timestamp = datetime.now().strftime("%H:%M:%S")
            f.write(f"[{timestamp}] {text}\n")
            f.flush()

        return f"Successfully appended note to log: {file_path}"
    except Exception as e:
        return f"Error writing to log: {str(e)}"


@tool
def read_logs_range(start_date: str, end_date: str) -> str:
    """
    Reads and combines logs for all dates between start_date and end_date (inclusive).
    Ignores dates where no log file exists.

    Args:
        start_date: "YYYY-MM-DD"
        end_date: "YYYY-MM-DD"
    """
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        return "Error: Dates must be in YYYY-MM-DD format."

    if start > end:
        return "Error: start_date cannot be after end_date."

    combined_logs = ""
    current = start
    found_any = False

    while current <= end:
        date_str = current.strftime("%Y-%m-%d")
        filename = f"{date_str}.txt"
        file_path = os.path.join(LOGS_DIR, filename)

        if os.path.exists(file_path):
            found_any = True
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    combined_logs += f"\n--- DATE: {date_str} ---\n{content}\n"
            except Exception as e:
                combined_logs += f"\n[Error reading {date_str}: {e}]\n"

        current += timedelta(days=1)

    if not found_any:
        return f"No logs found between {start_date} and {end_date}."

    return combined_logs


@tool
def get_image_info(image_name: str) -> str:
    """
    Retrieves the text description and metadata for a specific image.

    Args:
        image_name: The name of the image (e.g. 'vacation' or 'family_pic').
                    Do NOT include the file extension.
    """
    # Ensure we strip extension just in case the LLM adds it
    clean_name = image_name.split(".")[0]  # "picture14.txt" -> "picture14"
    filename = f"{clean_name}.txt"
    file_path = os.path.join(IMAGES_METADATA_DIR, filename)

    if not os.path.exists(file_path):
        return (
            f"No information found for image: '{clean_name}' (File {filename} missing)."
        )

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Error reading image info: {str(e)}"


@tool
def web_search(query: str) -> str:
    """
    Search the web for real-time information using Tavily.
    """
    try:
        search = TavilySearch(max_results=3)
        results = search.invoke(query)

        # Handle the specific dict format you just received
        if isinstance(results, dict) and "results" in results:
            # Tavily "advanced" response format
            items = results["results"]
            formatted_output = f"Search Results for '{query}':\n"
            for i, res in enumerate(items, 1):
                title = res.get("title", "No Title")
                content = res.get("content", "") or res.get("snippet", "")
                url = res.get("url", "No URL")
                formatted_output += f"\n{i}. [{title}] {content}\n   Source: {url}\n"
            return formatted_output

        # Handle list format (older LangChain versions sometimes do this)
        elif isinstance(results, list):
            formatted_output = f"Search Results for '{query}':\n"
            for i, res in enumerate(results, 1):
                content = res.get("content", "")
                url = res.get("url", "")
                formatted_output += f"\n{i}. {content}\n   Source: {url}\n"
            return formatted_output

        return str(results)

    except Exception as e:
        return f"Error performing web search: {str(e)}"


@tool
def get_datetime():
    """
    Returns the current day of the week, date, month, and precise time.
    Use this when the user asks "What time is it?", "What day is it?",
    or to check if it's time for a scheduled event.
    """
    now = datetime.now()
    # Format: "Saturday, November 29, 2025 at 02:05 PM"
    return now.strftime("%A, %B %d, %Y at %I:%M %p")


# --- UNIT TESTS ---
if __name__ == "__main__":
    print("🔍 Running Unit Tests for Tools...\n")

    # 1. Test Writing a Log (Should Create Today's File)
    print("1. Testing write_log...")
    res_write = write_log.invoke({"text": "Test log entry created by unit test."})
    print(f"   Result: {res_write}\n")

    # 2. Test Getting Dates (Should include today)
    print("2. Testing get_dates_of_written_logs...")
    res_dates = get_dates_of_written_logs.invoke({})
    print(f"   Result: {res_dates}\n")

    # 3. Test Reading Today's Log
    today_str = datetime.now().strftime("%Y-%m-%d")
    print(f"3. Testing read_log for {today_str}...")
    res_read = read_log.invoke({"date_str": today_str})
    print(f"   Result: {res_read[:100]}... (truncated)\n")  # Print first 100 chars

    # 4. Test Range Reading (Previous 7 days)
    week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    print(f"4. Testing read_logs_range ({week_ago} to {today_str})...")
    res_range = read_logs_range.invoke({"start_date": week_ago, "end_date": today_str})
    print(f"   Result Length: {len(res_range)} chars\n")

    # 5. Test Image Info (Expect 'No info found' unless you have dummy files)
    print("5. Testing get_image_info...")
    res_img = get_image_info.invoke({"image_name": "picture14"})
    print(f"   Result: {res_img}\n")

    # 6. Test Web Search (Requires API Key)
    print("6. Testing web_search...")
    # Check if API key is set before running to avoid ugly error dump
    if os.environ.get("TAVILY_API_KEY"):
        res_search = web_search.invoke({"query": "who is albert einstein"})
        print(f"   Result: {res_search[:1096]}... (truncated)\n")
    else:
        print("   ⚠️ Skipping web_search test: TAVILY_API_KEY not found in env.\n")

    # 7. Test get_datetime
    print("7. Testing get_datetime...")
    res_datetime = get_datetime.invoke({})
    print(f"   Result: {res_datetime}\n")

    print("✅ Tests Completed.")
