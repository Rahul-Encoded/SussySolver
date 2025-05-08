# Import necessary libraries
import google.generativeai as genai  # Google Generative AI SDK (for Gemini models)
import ast                          # Abstract Syntax Trees: used to safely evaluate strings containing Python literals
import json                         # JSON encoder/decoder for working with structured data
from PIL import Image               # Python Imaging Library: for image processing
from dotenv import load_dotenv      # Load environment variables from a .env file
import os                           # Operating system module, used for interacting with the OS (e.g., reading environment variables)

# Load environment variables from a `.env` file (if present)
load_dotenv()

# Retrieve the GEMINI_API_KEY from environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Define the path to a prompt template file that contains instructions for the AI model
prompt_path = "ai_notes_prompt.txt"

# Open and read the contents of the prompt file
with open(prompt_path, "r", encoding="utf-8") as f:
    prompt_file = f.read()

# Configure the Google Generative AI library with your API key
genai.configure(api_key=GEMINI_API_KEY)

# Initialize a generative model using a specific Gemini version (likely a vision-language model)
model = genai.GenerativeModel(model_name="gemini-2.5-flash-preview-04-17")

def analyze_image(img: Image, dict_of_vars: dict):
    """
    Analyzes an image using the Gemini model along with some input dictionary data.
    
    Args:
        img (Image): A PIL Image object representing the image to be analyzed.
        dict_of_vars (dict): A dictionary containing variables/data related to the image or context.

    Returns:
        answer: Processed response where each item has an 'assign' flag set based on its presence in the response.
    """
    
    # Convert the dictionary into a JSON-formatted string for inclusion in the prompt
    dict_of_vars_str = json.dumps(dict_of_vars, ensure_ascii=False)
    
    # Insert the dictionary string into the prompt using string formatting
    # This assumes `prompt_file` contains something like: "{dict_of_vars_str}" placeholder
    prompt = prompt_file.format(dict_of_vars_str=dict_of_vars_str)

    # Send the combined prompt and image to the Gemini model for analysis
    response = model.generate_content([prompt, img])

    print("OG Response: ", response)

    # Print the raw text response from the model
    print("Gemini Raw Response:", response.text)

    answers = []    # will store the parsed and processed dictionaries
    
    parsed_data = None
    
    # Preprocessing the response text to remove potential markdow wrapping
    cleaned_response_text = response.text.strip()    #Remove leading/trailing whitespace

    # Check and remove common markdown code block wrappers
    # This makes the parser resilient even if the AI ignores the prompt instruction
    if cleaned_response_text.startswith('```json'):
        cleaned_response_text = cleaned_response_text[len('```json'):].strip()
    elif cleaned_response_text.startswith('```'): # Handle cases with just ```
        cleaned_response_text = cleaned_response_text[len('```'):].strip()

    # The AI might put the ending ``` on a new line, strip() helps, but also check end
    if cleaned_response_text.endswith('```'):
        cleaned_response_text = cleaned_response_text[:-len('```')].strip()
    # --- End Preprocessing ---

    # Print the cleaned text before parsing
    print("Cleaned Response Text for Parsing:", cleaned_response_text)

    try:
        # Try to parse the cleaned response text using ast.literal_eval
        # It's crucial that cleaned_response_text is ONLY the string representation of a Python literal (like a list or dict)
        parsed_data = ast.literal_eval(cleaned_response_text)

        # Check if the parsed result is a list as expected by the frontend
        if isinstance(parsed_data, list):
             answers = parsed_data # Use the list directly
        else:
             # If it's not a list, it might be a single dictionary (based on prompt structure)
             print(f"Warning: Gemini response parsed as {type(parsed_data)}, not a list. Attempting to wrap if dict. Raw text: {raw_response_text}")
             if isinstance(parsed_data, dict):
                 answers = [parsed_data] # Wrap a single dictionary in a list
             else:
                 # If it's neither a list nor a dict, it's an unexpected format
                 print(f"Error: Parsed data was not a list or single dict. Type: {type(parsed_data)}. Parsed value: {parsed_data}. Raw text: {raw_response_text}")
                 # 'answers' remains empty []

    except (ValueError, SyntaxError, TypeError) as e: # Catch specific errors from literal_eval
        # If ast.literal_eval fails even after cleaning, it means the string is not a valid literal
        print(f"Error parsing response (ast.literal_eval failed): {e}. Cleaned text: '{cleaned_response_text}'. Raw text: '{raw_response_text}'")
        # 'answers' remains empty [], which signals an error to the frontend

    # --- Post-parsing processing (add 'assign' flag if missing) ---
    processed_answers = []
    for item in answers:
        # Ensure 'item' is a dictionary before processing
        if isinstance(item, dict):
            processed_item = item.copy() # Work on a copy
            # Add or ensure the 'assign' key exists and is boolean
            processed_item["assign"] = bool(processed_item.get("assign", False)) # Get 'assign' or default to False, convert to bool
            processed_answers.append(processed_item)
        else:
            print(f"Warning: Item in parsed list was not a dictionary: {type(item)}. Value: {item}")
            # Skip non-dictionary items or handle as errors


    print("returned answer (processed list sent to route): ", processed_answers)
    return processed_answers # Return the final list of processed dictionaries