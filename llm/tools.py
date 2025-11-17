import os
from datetime import datetime
from langchain_core.tools import tool
import requests
from langchain_community.tools.tavily_search import TavilySearchResults


@tool
def write_to_daily_file(text, directory_path="./src/data/logs") -> str: 
    """
    Writes a string to a file named with today's date.
    Adds the date as a header at the top when the file is first created.
    
    Parameters:
    -----------
    text : str
        The text content to write to the file
    directory_path : str
        The directory path where the file should be created/stored (default is current directory)
    
    Returns:
    --------
    str
        The full path of the file that was written to
    """
    # Get today's date in YYYY-MM-DD format
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Create the filename with today's date
    filename = f"{today}.txt"
    
    # Create the full file path
    file_path = os.path.join(directory_path, filename)
    
    # Create the directory if it doesn't exist
    os.makedirs(directory_path, exist_ok=True)
    
    # Check if file exists to determine the mode
    file_exists = os.path.exists(file_path)
    
    # Write to the file
    with open(file_path, 'a') as f:
        # If file is new, write the date header first
        if not file_exists:
            f.write(f"=== Log for {today} ===\n\n")
        f.write(text + "\n")
    
    # Return information about what was done
    action = " Appended to existing" if file_exists else "Created new"
    action += " saved to"
    # print(f"{action} file: {file_path} \n")
    
    return "<tool> Log saved to: " + file_path + " </tool>"

@tool
def read_daily_file(date_str, directory_path="./src/data/logs") -> str: 
    """
    Reads the contents of a daily log file for a given date.
    
    Parameters:
    -----------
    date_str : str
        The date string in YYYY-MM-DD format
    directory_path : str
        The directory path where the file is stored (default is current directory)
    
    Returns:
    --------
    str
        The contents of the file, or an error message if the file does not exist
    """
    # Create the filename with the given date
    filename = f"{date_str}.txt"
    # print(f"Attempting to read file: {filename}")
    # Create the full file path
    file_path = os.path.join(directory_path, filename)
    
    # Check if the file exists
    if not os.path.exists(file_path):
        return f"No log file found for date: {date_str}"
    
    # Read and return the contents of the file
    with open(file_path, 'r') as f:
        content = f.read()
    
    return content


# print(read_daily_file.invoke("2025-10-30"))

@tool
def web_search(query: str) -> str:
    """Search using Tavily API optimized for AI agents."""
    try:
        search = TavilySearchResults(max_results=5)
        output = search.invoke({"query": query})
        
        # output = f"Search results for '{query}':\n\n"
        # for idx, result in enumerate(results, 1):
        #     output += f"{idx}. {result['url']}\n"
        #     output += f"   {result['content']}\n\n"
        
        return f"<tool>{output}</tool>"
    except Exception as e:
        return f"<tool>Error performing search: {str(e)}</tool>"

@tool
def show_image(image_name: str, caption: str = "") -> bool:
    """
    Display an image in the Streamlit UI.
    
    Args:
        image_name: Name of the image file (e.g., "scan.png")
        caption: Optional caption to display with the image
    
    Returns:
        True if successful, False otherwise
    
    Example:
        show_image("patient_scan.png", "Latest X-ray results")
    """
    try:
        response = requests.post(
            "http://localhost:8000/set_image",
            json={
                "image_name": image_name,
                "caption": caption
            },
            timeout=5
        )
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Failed to show image: {e}")
        return False