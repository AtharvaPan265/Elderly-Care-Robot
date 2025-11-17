import requests

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
    
if __name__ == "__main__":
    # Test the show_image function
    success = show_image("picture14.jpg", "This is a test image.")
    if success:
        print("Image displayed successfully.")
    else:
        print("Failed to display image.")