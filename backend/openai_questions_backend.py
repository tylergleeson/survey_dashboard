import os
import json
from openai import OpenAI
from dotenv import load_dotenv
import logging
from datetime import datetime

# Load environment variables
load_dotenv('.env.local')

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('openai_analysis.log'),
        logging.StreamHandler()
    ]
)

# Example demographic datasets
EXAMPLE_DATASETS = [
    {
        "name": "DC Consultant",
        "data": {
            "age": 28,
            "occupation": "Consultant",
            "location": "Washington DC",
            "zip_code": "20001",
            "gender": "male"
        }
    },
    {
        "name": "Tech Professional",
        "data": {
            "age": 28,
            "occupation": "Software Engineer",
            "location": "San Francisco",
            "zip_code": "94105",
            "gender": "male"
        }
    },
    {
        "name": "Healthcare Worker",
        "data": {
            "age": 35,
            "occupation": "Registered Nurse",
            "location": "Boston",
            "zip_code": "02108",
            "gender": "female"
        }
    },
    {
        "name": "Education Professional",
        "data": {
            "age": 42,
            "occupation": "High School Teacher",
            "location": "Chicago",
            "zip_code": "60601",
            "gender": "female"
        }
    }
]

def show_example_datasets():
    """
    Display available example demographic datasets
    """
    print("\nExample Demographic Datasets:")
    print("=" * 50)
    for i, dataset in enumerate(EXAMPLE_DATASETS, 1):
        print(f"\n{i}. {dataset['name']}:")
        print(f"   Age: {dataset['data']['age']}")
        print(f"   Occupation: {dataset['data']['occupation']}")
        print(f"   Location: {dataset['data']['location']}")
        print(f"   ZIP Code: {dataset['data']['zip_code']}")
        print(f"   Gender: {dataset['data']['gender']}")

def get_example_dataset():
    """
    Let user select an example dataset
    
    Returns:
        dict: Selected dataset or None if user chooses to enter custom data
    """
    show_example_datasets()
    print("\nOptions:")
    print("1-4: Select example dataset")
    print("5: Enter custom data")
    
    choice = input("\nEnter your choice (1-5): ")
    
    if choice.isdigit() and 1 <= int(choice) <= 4:
        return EXAMPLE_DATASETS[int(choice) - 1]['data']
    elif choice == '5':
        return None
    else:
        print("Invalid choice. Please enter custom data.")
        return None

def get_openai_client():
    """
    Create and return an OpenAI client instance
    """
    try:
        return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    except Exception as e:
        logging.error(f"Error creating OpenAI client: {e}")
        return None

def analyze_demographics(age, occupation, location, zip_code, gender):
    """
    Analyze demographics using OpenAI's GPT-4
    
    Args:
        age (int): Age of the individual
        occupation (str): Occupation of the individual
        location (str): Location of the individual
        zip_code (str): ZIP code of the individual
        gender (str): Gender of the individual
        
    Returns:
        dict: Analysis results including predictions and explanations
    """
    client = get_openai_client()
    if not client:
        return None
    
    # Construct the prompt
    prompt = f"""
    Analyze the following demographic information and provide detailed predictions and explanations:
    
    Age: {age}
    Occupation: {occupation}
    Location: {location}
    ZIP Code: {zip_code}
    Gender: {gender}
    
    Please provide predictions and explanations for the following categories:
    1. Location Analysis
    2. Employment Opportunities
    3. Income Potential
    4. Education Options
    5. Health and Wellness
    6. Crime and Safety
    7. Environmental Factors
    8. Cultural Diversity
    9. Transportation
    10. Housing Market
    11. Technology Access
    12. Social Life
    13. Economic Outlook
    
    For each category, provide:
    - A specific prediction
    - A detailed explanation
    - Supporting factors or considerations
    
    Format the response as a structured analysis with clear sections for each category.
    """
    
    try:
        # First call to get the analysis
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a demographic analysis expert. Provide detailed, well-structured analysis."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        analysis = response.choices[0].message.content
        
        # Second call to format the analysis as JSON
        format_prompt = f"""
        Convert the following demographic analysis into a structured JSON format:
        
        {analysis}
        
        The JSON should have the following structure:
        {{
            "input_data": {{
                "age": {age},
                "occupation": "{occupation}",
                "location": "{location}",
                "zip_code": "{zip_code}",
                "gender": "{gender}"
            }},
            "predictions": {{
                "location_analysis": {{
                    "prediction": "string",
                    "explanation": "string",
                    "sources": ["string"]
                }},
                "employment_opportunities": {{
                    "prediction": "string",
                    "explanation": "string",
                    "sources": ["string"]
                }},
                // ... similar structure for other categories
            }}
        }}
        
        Ensure all predictions and explanations are properly formatted as strings.
        Include relevant sources or factors in the sources array.
        """
        
        format_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a data formatting expert. Convert the analysis into a structured JSON format."},
                {"role": "user", "content": format_prompt}
            ],
            temperature=0.1
        )
        
        # Parse the JSON response
        formatted_analysis = json.loads(format_response.choices[0].message.content)
        
        # Save the results to a file
        save_results(formatted_analysis)
        
        return formatted_analysis
        
    except Exception as e:
        logging.error(f"Error in demographic analysis: {e}")
        return None

def save_results(data):
    """
    Save the analysis results to a file
    
    Args:
        data (dict): Analysis results to save
    """
    try:
        # Create filename based on input data
        input_data = data['input_data']
        filename = f"OpenAI_demographic_analysis_age_{input_data['age']}_occupation_{input_data['occupation'].lower().replace(' ', '_')}_location_{input_data['location'].lower().replace(' ', '_')}_zip_code_{input_data['zip_code']}_gender_{input_data['gender'].lower()}.txt"
        
        # Get the directory of the current script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        filepath = os.path.join(script_dir, filename)
        
        # Format the content
        content = f"""
OpenAI Demographic Analysis Results
{'=' * 30}

Input Data:
Age: {input_data['age']}
Occupation: {input_data['occupation']}
Location: {input_data['location']}
ZIP Code: {input_data['zip_code']}
Gender: {input_data['gender']}

{'=' * 30}

Analysis Results:
"""
        
        # Add predictions
        for category, prediction in data['predictions'].items():
            content += f"\n## {category.replace('_', ' ').title()}\n"
            content += f"Prediction: {prediction['prediction']}\n"
            content += f"Explanation: {prediction['explanation']}\n"
            if prediction.get('sources'):
                content += "\nSources:\n"
                for source in prediction['sources']:
                    content += f"- {source}\n"
            content += "\n"
        
        # Write to file
        with open(filepath, 'w') as f:
            f.write(content)
        
        logging.info(f"Results saved to: {filepath}")
        return filepath
        
    except Exception as e:
        logging.error(f"Error saving results: {e}")
        return None

def main():
    """
    Main function to run the demographic analysis
    """
    print("Demographic Analysis Tool\n" + "="*40)
    
    # Get user input
    try:
        # Offer example datasets
        example_data = get_example_dataset()
        
        if example_data:
            # Use example data
            age = example_data['age']
            occupation = example_data['occupation']
            location = example_data['location']
            zip_code = example_data['zip_code']
            gender = example_data['gender']
        else:
            # Get custom input
            age = int(input("\nEnter age: "))
            occupation = input("Enter occupation: ")
            location = input("Enter location: ")
            zip_code = input("Enter ZIP code: ")
            gender = input("Enter gender: ")
        
        print("\nAnalyzing demographics...")
        results = analyze_demographics(age, occupation, location, zip_code, gender)
        
        if results:
            print("\nAnalysis complete!")
            print(f"Results have been saved to a file in the backend directory.")
        else:
            print("\nError: Analysis failed. Please check the logs for details.")
            
    except ValueError as e:
        print(f"\nError: Invalid input - {e}")
    except Exception as e:
        print(f"\nError: {e}")

if __name__ == "__main__":
    main() 