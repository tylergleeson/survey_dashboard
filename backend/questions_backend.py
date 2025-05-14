import anthropic
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env file (create this file with your API key)
load_dotenv('.env.local')

def analyze_demographics(person_data):
    """
    Analyze demographics using Claude API with web search capabilities
    
    Args:
        person_data (dict): Dictionary containing basic demographic information
        
    Returns:
        dict: Extended profile with predictions based on web research and LLM
    """
    # Initialize the Anthropic client
    client = anthropic.Anthropic(
        api_key=os.getenv("ANTHROPIC_API_KEY")
    )
    
    # Format the input data for the prompt
    input_str = "\n".join([f"{k}: {v}" for k, v in person_data.items()])
    
    # Define the categories to predict
    prediction_categories = [
        "employment_type",
        "geolocation_metadata",
        "income_bracket",
        "education_level",
        "housing_status",
        "family_status",
        "work_schedule_type",
        "gig_work_likelihood",
        "technology_comfort_level",
        "media_consumption_style",
        "political_leaning",
        "urban_rural_classification",
        "industry_sector",
        "emotional_tone",
        "consumer_preferences",
        "response_quality_score",
        "career_stage",
        "marital_status",
        "roommate_likelihood"
    ]
    
    # Create the prediction categories formatted string
    categories_str = "\n".join(prediction_categories)
    
    # STEP 1: Gather data using web search
    research_prompt = f"""
    Research the following demographic information:
    {input_str}

    For each of these categories, gather current information and make predictions:
    {categories_str}

    Include specific data points and sources for each prediction.
    """
    
    research_message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=4000,
        temperature=0.2,
        system="You are a demographic research expert. Use web search to gather current information about demographics, locations, and trends. Provide detailed predictions with specific data points and sources.",
        messages=[{"role": "user", "content": research_prompt}],
        tools=[
            {
                "name": "web_search",
                "description": "Search the web for information",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query"
                        }
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "web_fetch",
                "description": "Fetch a webpage",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "url": {
                            "type": "string",
                            "description": "URL to fetch"
                        }
                    },
                    "required": ["url"]
                }
            }
        ]
    )
    
    # STEP 2: Format the research as JSON
    json_prompt = f"""
    Format the following research into a JSON object:
    
    {research_message.content[0].text}
    
    The JSON must follow this exact structure:
    {{
        "employment_type": {{
            "prediction": "specific prediction",
            "explanation": "brief explanation",
            "sources": ["source1", "source2"]
        }},
        "geolocation_metadata": {{
            "prediction": "specific prediction",
            "explanation": "brief explanation",
            "sources": ["source1", "source2"]
        }}
        // ... continue for all categories
    }}
    
    CRITICAL: Return ONLY the JSON object. No other text.
    """
    
    json_message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=4000,
        temperature=0.2,
        system="You are a JSON formatting bot. Your ONLY task is to convert the given research into a valid JSON object. Do not include any text before or after the JSON.",
        messages=[{"role": "user", "content": json_prompt}]
    )
    
    # Extract the JSON response
    try:
        # Find the JSON in the response
        response_text = json_message.content[0].text
        
        # Find where the JSON starts and ends
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = response_text[json_start:json_end]
            predictions = json.loads(json_str)
        else:
            predictions = {
                "error": "Could not parse JSON",
                "raw_response": response_text
            }
            
    except Exception as e:
        predictions = {
            "error": str(e),
            "raw_response": json_message.content[0].text
        }
    
    return predictions

def format_results(predictions):
    """
    Format the prediction results for display
    
    Args:
        predictions (dict): The predictions from the LLM
        
    Returns:
        str: Formatted string for display
    """
    if "error" in predictions:
        return f"Error: {predictions['error']}\n\nRaw response: {predictions.get('raw_response', 'None')}"
    
    output = []
    output.append("DEMOGRAPHIC ANALYSIS RESULTS\n" + "="*30 + "\n")
    
    for category, data in predictions.items():
        output.append(f"## {category.replace('_', ' ').title()}")
        output.append(f"Prediction: {data.get('prediction', 'N/A')}")
        output.append(f"Explanation: {data.get('explanation', 'N/A')}")
        
        sources = data.get('sources', [])
        if sources:
            output.append("Sources:")
            for source in sources:
                output.append(f"- {source}")
        
        output.append("")  # Empty line for spacing
    
    return "\n".join(output)

def main():
    """
    Main function to run the demographic analysis
    """
    print("Demographic Analysis Tool\n" + "="*30)
    
    # Use the example provided or collect new inputs
    use_example = input("Use example data? (y/n): ").lower() == 'y'
    
    if use_example:
        # Use the data from the example
        person_data = {
            "age": "28",
            "occupation": "consultant",
            "location": "washington dc",
            "zip_code": "20001",
            "gender": "male"
        }
    else:
        # Collect new data
        person_data = {}
        person_data["age"] = input("Age: ")
        person_data["occupation"] = input("Occupation: ")
        person_data["location"] = input("Location: ")
        person_data["zip_code"] = input("ZIP code: ")
        person_data["gender"] = input("Gender: ")
    
    print("\nAnalyzing demographic data. This may take a minute as we research and generate predictions...\n")
    
    # Perform the analysis
    predictions = analyze_demographics(person_data)
    
    # Format and display the results
    formatted_results = format_results(predictions)
    print(formatted_results)
    
    # Create filename from input features
    filename_parts = ["demographic_analysis"]
    for key, value in person_data.items():
        # Clean the value for filename (remove spaces, special chars)
        clean_value = value.lower().replace(" ", "_")
        filename_parts.append(f"{key}_{clean_value}")
    
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create the full filepath
    filename = "_".join(filename_parts) + ".txt"
    filepath = os.path.join(script_dir, filename)
    
    # Save results to file
    with open(filepath, "w") as f:
        # Write the input data
        f.write("INPUT DATA\n" + "="*30 + "\n")
        for k, v in person_data.items():
            f.write(f"{k}: {v}\n")
        f.write("\n")
        
        # Write the predictions
        f.write(formatted_results)
    
    print(f"\nResults saved to {filepath}")

if __name__ == "__main__":
    main()