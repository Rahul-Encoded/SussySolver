# Import necessary modules
from fastapi import APIRouter  # For creating modular routes in FastAPI
import base64                 # For decoding base64-encoded image data
from io import BytesIO         # For converting decoded data into a file-like object
from apps.calc.utils import analyze_image  # Custom function to analyze the image using Gemini AI
from schema import ImageData  # Pydantic model defining expected request body structure
from PIL import Image          # Python Imaging Library for handling image files

# Create a new router instance
router = APIRouter()

# Define a POST endpoint; empty string '' means it's relative to the base path where this router is mounted
@router.post('')
async def run(data: ImageData):
    """
    Endpoint to receive a base64-encoded image, process it,
    and return structured analysis results.
    
    Args:
        data (ImageData): The request body containing the base64-encoded image.

    Returns:
        dict: A response message with status and processed data.
    """

    # Extract the base64 part after the data URL prefix (e.g., "data:image/png;base64,....")
    # Split on ',' and take the second part which is actual base64 data
    image_base64 = data.image.split(',')[1]

    # Decode the base64 string into raw bytes
    image_data = base64.b64decode(image_base64)

    # Convert bytes into a file-like object (BytesIO)
    image_bytes = BytesIO(image_data)

    # Open the image using PIL so that it can be understood by functions expecting an Image object
    image = Image.open(image_bytes)

    # Call custom image analysis function; assume `analyze_image` returns a list of responses
    
    responses = analyze_image(image, dict_of_vars=data.dict_of_vars)

    # Prepare the final response data
    # If analyze_image returns a list, use it directly.
    # If it returned something else (due to error handling), you might adjust this.
    # Assuming analyze_image now returns a list of dictionaries:
    data_response_list = responses # responses is now the list from analyze_image

    # Print the full list for debugging
    print("response data sent to frontend: ", data_response_list)


    # Return a JSON-formatted response to the client
    # Put the list directly into the 'data' field
    return {
        "message": "Image Processed",
        "type": "success",
        "data": data_response_list # Put the list here
    }