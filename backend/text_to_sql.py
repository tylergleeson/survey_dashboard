import os
import json
from openai import OpenAI
from dotenv import load_dotenv
import psycopg2
from psycopg2 import sql
import logging
from datetime import datetime, timedelta
import hashlib
import pickle
from pathlib import Path
import glob
import time
from typing import List, Dict, Tuple, Optional
import csv
from collections import defaultdict
import pandas as pd

# Load environment variables
load_dotenv('.env.local')

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('normalization.log'),
        logging.StreamHandler()
    ]
)

# Set up cache directory and configuration
CACHE_DIR = Path('cache')
CACHE_DIR.mkdir(exist_ok=True)
CACHE_EXPIRY_DAYS = 30  # Cache entries expire after 30 days

class CacheEntry:
    def __init__(self, normalized_value: str, confidence_score: float, timestamp: datetime):
        self.normalized_value = normalized_value
        self.confidence_score = confidence_score
        self.timestamp = timestamp
        self.approved_by = None
        self.review_count = 0
        self.last_reviewed = None

    def to_dict(self) -> dict:
        return {
            'normalized_value': self.normalized_value,
            'confidence_score': self.confidence_score,
            'timestamp': self.timestamp.isoformat(),
            'approved_by': self.approved_by,
            'review_count': self.review_count,
            'last_reviewed': self.last_reviewed.isoformat() if self.last_reviewed else None
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'CacheEntry':
        entry = cls(
            normalized_value=data['normalized_value'],
            confidence_score=data['confidence_score'],
            timestamp=datetime.fromisoformat(data['timestamp'])
        )
        entry.approved_by = data.get('approved_by')
        entry.review_count = data.get('review_count', 0)
        if data.get('last_reviewed'):
            entry.last_reviewed = datetime.fromisoformat(data['last_reviewed'])
        return entry

def cleanup_expired_cache():
    """
    Remove expired cache entries
    """
    expiry_date = datetime.now() - timedelta(days=CACHE_EXPIRY_DAYS)
    for cache_file in CACHE_DIR.glob('*.pkl'):
        try:
            with open(cache_file, 'rb') as f:
                entry = CacheEntry.from_dict(pickle.load(f))
                if entry.timestamp < expiry_date:
                    cache_file.unlink()
                    logging.info(f"Removed expired cache entry: {cache_file}")
        except Exception as e:
            logging.warning(f"Error processing cache file {cache_file}: {e}")

def get_cache_key(input_value: str, column_name: str) -> str:
    """
    Generate a cache key for a normalization request
    """
    key = f"{column_name}:{input_value.lower().strip()}"
    return hashlib.md5(key.encode()).hexdigest()

def get_cached_value(cache_key: str) -> Optional[Tuple[str, float]]:
    """
    Get a cached normalization result
    """
    cache_file = CACHE_DIR / f"{cache_key}.pkl"
    if cache_file.exists():
        try:
            with open(cache_file, 'rb') as f:
                entry = CacheEntry.from_dict(pickle.load(f))
                if entry.timestamp > datetime.now() - timedelta(days=CACHE_EXPIRY_DAYS):
                    logging.info(f"Cache hit for {cache_key} -> {entry.normalized_value}")
                    return entry.normalized_value, entry.confidence_score
                else:
                    cache_file.unlink()
                    logging.info(f"Removed expired cache entry: {cache_file}")
        except Exception as e:
            logging.warning(f"Error reading cache file {cache_file}: {e}")
    return None

def save_to_cache(cache_key: str, normalized_value: str, confidence_score: float, approved_by: Optional[str] = None):
    """
    Save a normalization result to cache
    """
    cache_file = CACHE_DIR / f"{cache_key}.pkl"
    try:
        entry = CacheEntry(normalized_value, confidence_score, datetime.now())
        if approved_by:
            entry.approved_by = approved_by
            entry.review_count += 1
            entry.last_reviewed = datetime.now()
        with open(cache_file, 'wb') as f:
            pickle.dump(entry.to_dict(), f)
    except Exception as e:
        logging.warning(f"Error writing to cache file {cache_file}: {e}")

def get_db_connection():
    """
    Create a database connection using environment variables
    
    Returns:
        psycopg2.connection: Database connection
    """
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("POSTGRES_DB"),
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
            host=os.getenv("POSTGRES_HOST", "localhost"),
            port=os.getenv("POSTGRES_PORT", "5432")
        )
        return conn
    except Exception as e:
        logging.error(f"Error connecting to database: {e}")
        return None

def verify_table_exists():
    """
    Verify that the demographic_analysis table exists
    
    Returns:
        bool: True if table exists, False otherwise
    """
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'demographic_analysis'
                );
            """)
            exists = cur.fetchone()[0]
            return exists
    except Exception as e:
        print(f"Error verifying table existence: {e}")
        return False
    finally:
        conn.close()

def check_duplicate_data(data):
    """
    Check if the data already exists in the table
    
    Args:
        data (dict): Normalized demographic data
        
    Returns:
        bool: True if duplicate exists, False otherwise
    """
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cur:
            # Check for duplicates based on key fields
            cur.execute("""
                SELECT EXISTS (
                    SELECT 1 FROM demographic_analysis
                    WHERE age = %s
                    AND occupation = %s
                    AND location = %s
                    AND zip_code = %s
                    AND gender = %s
                );
            """, (
                data['input_data'].get('age'),
                data['input_data'].get('occupation'),
                data['input_data'].get('location'),
                data['input_data'].get('zip_code'),
                data['input_data'].get('gender')
            ))
            is_duplicate = cur.fetchone()[0]
            return is_duplicate
    except Exception as e:
        print(f"Error checking for duplicates: {e}")
        return False
    finally:
        conn.close()

def get_existing_values(column_name):
    """
    Get all unique values for a specific column from the database
    
    Args:
        column_name (str): Name of the column to get values from
        
    Returns:
        list: List of unique values
    """
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT DISTINCT {column_name}
                FROM demographic_analysis
                WHERE {column_name} IS NOT NULL
                ORDER BY {column_name};
            """)
            values = [row[0] for row in cur.fetchall()]
            logging.info(f"Retrieved {len(values)} existing values for {column_name}")
            return values
    except Exception as e:
        logging.error(f"Error getting existing values for {column_name}: {e}")
        return []
    finally:
        conn.close()

def get_user_approval(input_value, normalized_value, confidence_score):
    """
    Get user approval for a new normalized value
    
    Args:
        input_value (str): Original input value
        normalized_value (str): Proposed normalized value
        confidence_score (float): Confidence score of the normalization
        
    Returns:
        str: Approved normalized value
    """
    print(f"\nNormalization proposal:")
    print(f"Original value: {input_value}")
    print(f"Proposed value: {normalized_value}")
    print(f"Confidence score: {confidence_score:.2f}")
    
    if confidence_score >= 0.9:
        print("High confidence match - auto-approved")
        return normalized_value
    
    response = input("Approve this normalization? (y/n, or enter new value): ").strip()
    if response.lower() == 'y':
        return normalized_value
    elif response.lower() == 'n':
        return input_value
    else:
        return response

def normalize_with_gpt(input_value, column_name, existing_values):
    """
    Use GPT to normalize a value by either matching to existing values
    or creating a new standardized value
    
    Args:
        input_value (str): The value to normalize
        column_name (str): The column name this value belongs to
        existing_values (list): List of existing values in the database
        
    Returns:
        tuple: (normalized_value, confidence_score)
    """
    # Check cache first
    cache_key = get_cache_key(input_value, column_name)
    cached_result = get_cached_value(cache_key)
    if cached_result:
        logging.info(f"Cache hit for {input_value} -> {cached_result[0]}")
        return cached_result
    
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    prompt = f"""
    You are a data normalization expert. Your task is to either:
    1. Match the input value to an existing value in the database, or
    2. Create a new standardized value if no good match exists
    
    Column: {column_name}
    Input value: {input_value}
    Existing values in database: {json.dumps(existing_values, indent=2)}
    
    Rules:
    1. If the input value is very similar to an existing value, use the existing value
    2. If the input value is significantly different, create a new standardized value
    3. For locations, use full city names (e.g., "washington dc" not "dc")
    4. For occupations, use full job titles (e.g., "software developer" not "dev")
    5. For gender, use standard terms ("male", "female", "non-binary", "other")
    6. Always return a single string value
    
    Return your response in JSON format with two fields:
    1. "normalized_value": the normalized value
    2. "confidence_score": a number between 0 and 1 indicating your confidence in the match
       - 1.0: Exact match to existing value
       - 0.9: Very similar to existing value
       - 0.7: Somewhat similar to existing value
       - 0.5: New value with high confidence
       - 0.3: New value with low confidence
    """
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a data normalization expert. Return only the JSON response."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1  # Low temperature for consistent results
    )
    
    try:
        result = json.loads(response.choices[0].message.content)
        normalized_value = result['normalized_value'].strip()
        confidence_score = float(result['confidence_score'])
        
        # Log the normalization
        logging.info(f"Normalized {input_value} -> {normalized_value} (confidence: {confidence_score:.2f})")
        
        # Get user approval if needed
        if confidence_score < 0.9:
            normalized_value = get_user_approval(input_value, normalized_value, confidence_score)
            logging.info(f"User approved normalization: {input_value} -> {normalized_value}")
        
        # Cache the result
        save_to_cache(cache_key, normalized_value, confidence_score)
        
        return normalized_value, confidence_score
    except Exception as e:
        logging.error(f"Error parsing GPT response: {e}")
        return input_value, 0.0

def normalize_data(data):
    """
    Normalize all input data using GPT to match existing values or create new ones
    
    Args:
        data (dict): Raw input data
        
    Returns:
        dict: Normalized data
    """
    normalized = data.copy()
    
    # Get existing values for each column
    existing_locations = get_existing_values('location')
    existing_occupations = get_existing_values('occupation')
    existing_genders = get_existing_values('gender')
    
    # Normalize input data
    if 'location' in normalized['input_data']:
        normalized['input_data']['location'], _ = normalize_with_gpt(
            normalized['input_data']['location'],
            'location',
            existing_locations
        )
    
    if 'occupation' in normalized['input_data']:
        normalized['input_data']['occupation'], _ = normalize_with_gpt(
            normalized['input_data']['occupation'],
            'occupation',
            existing_occupations
        )
    
    if 'gender' in normalized['input_data']:
        normalized['input_data']['gender'], _ = normalize_with_gpt(
            normalized['input_data']['gender'],
            'gender',
            existing_genders
        )
    
    # Normalize predictions
    for category, prediction in normalized['predictions'].items():
        if 'prediction' in prediction:
            # Normalize location in predictions
            if 'location' in category or 'geolocation' in category:
                prediction['prediction'], _ = normalize_with_gpt(
                    prediction['prediction'],
                    'location',
                    existing_locations
                )
            
            # Normalize occupation in predictions
            if 'employment' in category or 'occupation' in category:
                prediction['prediction'], _ = normalize_with_gpt(
                    prediction['prediction'],
                    'occupation',
                    existing_occupations
                )
    
    return normalized

def read_demographic_file(filepath):
    """
    Read and parse the demographic analysis file
    
    Args:
        filepath (str): Path to the demographic analysis file
        
    Returns:
        dict: Parsed demographic data
    """
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Split content into input data and predictions
    sections = content.split('=' * 30)
    input_section = sections[1].strip()
    predictions_section = sections[2].strip() if len(sections) > 2 else ""
    
    # Parse input data
    input_data = {}
    for line in input_section.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            input_data[key.strip()] = value.strip()
    
    # Parse predictions
    predictions = {}
    current_category = None
    current_data = {}
    
    for line in predictions_section.split('\n'):
        line = line.strip()
        if line.startswith('## '):
            if current_category and current_data:
                predictions[current_category] = current_data
            current_category = line[3:].lower().replace(' ', '_')
            current_data = {}
        elif line.startswith('Prediction: '):
            current_data['prediction'] = line[11:].strip()
        elif line.startswith('Explanation: '):
            current_data['explanation'] = line[12:].strip()
        elif line.startswith('- '):
            if 'sources' not in current_data:
                current_data['sources'] = []
            current_data['sources'].append(line[2:].strip())
    
    if current_category and current_data:
        predictions[current_category] = current_data
    
    return {
        'input_data': input_data,
        'predictions': predictions
    }

def generate_sql(data):
    """
    Use GPT-4 to generate SQL insert statements for an existing table
    
    Args:
        data (dict): Parsed demographic data
        
    Returns:
        str: SQL insert statements
    """
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    # Format the data for the prompt
    prompt = f"""
    Generate SQL INSERT statements for the following demographic data.
    The table 'demographic_analysis' already exists with the following structure:
    
    CREATE TABLE demographic_analysis (
        id SERIAL PRIMARY KEY,
        age INTEGER,
        occupation VARCHAR(100),
        location VARCHAR(100),
        zip_code VARCHAR(10),
        gender VARCHAR(20),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        prediction_location VARCHAR(100),
        prediction_employment VARCHAR(100),
        prediction_income VARCHAR(100),
        prediction_education VARCHAR(100),
        prediction_health VARCHAR(100),
        prediction_crime VARCHAR(100),
        prediction_environment VARCHAR(100),
        prediction_culture VARCHAR(100),
        prediction_transportation VARCHAR(100),
        prediction_housing VARCHAR(100),
        prediction_technology VARCHAR(100),
        prediction_social VARCHAR(100),
        prediction_economic VARCHAR(100)
    );
    
    Input Data:
    {json.dumps(data['input_data'], indent=2)}
    
    Predictions:
    {json.dumps(data['predictions'], indent=2)}
    
    Requirements:
    1. Generate only INSERT statements for the existing table
    2. Map the input data and predictions to the appropriate columns
    3. Use the CURRENT_TIMESTAMP for the timestamp column
    4. Make the SQL compatible with PostgreSQL
    5. Handle NULL values appropriately for missing data
    """
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a SQL expert. Generate clean, well-formatted SQL INSERT statements for an existing table."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )
    
    return response.choices[0].message.content

def save_sql(sql_content, original_filepath):
    """
    Save the SQL statements to a file
    
    Args:
        sql_content (str): SQL statements
        original_filepath (str): Path to the original demographic file
    """
    # Create SQL filename based on original filename
    base_name = os.path.splitext(os.path.basename(original_filepath))[0]
    sql_filepath = os.path.join(os.path.dirname(original_filepath), f"{base_name}.sql")
    
    with open(sql_filepath, 'w') as f:
        f.write(sql_content)
    
    return sql_filepath

class NormalizationStats:
    def __init__(self):
        self.total_normalizations = 0
        self.cache_hits = 0
        self.gpt_calls = 0
        self.auto_approvals = 0
        self.manual_approvals = 0
        self.rejections = 0
        self.column_stats = defaultdict(lambda: {
            'total': 0,
            'unique_values': set(),
            'confidence_scores': [],
            'approval_rates': []
        })
        self.start_time = datetime.now()

    def add_normalization(self, column_name: str, original_value: str, normalized_value: str, 
                         confidence_score: float, approved_by: str):
        self.total_normalizations += 1
        self.column_stats[column_name]['total'] += 1
        self.column_stats[column_name]['unique_values'].add(normalized_value)
        self.column_stats[column_name]['confidence_scores'].append(confidence_score)
        
        if approved_by == 'auto_approved':
            self.auto_approvals += 1
        elif approved_by == 'user_approved':
            self.manual_approvals += 1
        elif approved_by == 'rejected':
            self.rejections += 1
        
        self.column_stats[column_name]['approval_rates'].append(approved_by)

    def get_summary(self) -> dict:
        duration = datetime.now() - self.start_time
        return {
            'total_normalizations': self.total_normalizations,
            'cache_hits': self.cache_hits,
            'gpt_calls': self.gpt_calls,
            'auto_approvals': self.auto_approvals,
            'manual_approvals': self.manual_approvals,
            'rejections': self.rejections,
            'duration_seconds': duration.total_seconds(),
            'columns': {
                col: {
                    'total': stats['total'],
                    'unique_values': len(stats['unique_values']),
                    'avg_confidence': sum(stats['confidence_scores']) / len(stats['confidence_scores']) if stats['confidence_scores'] else 0,
                    'approval_rate': sum(1 for x in stats['approval_rates'] if x != 'rejected') / len(stats['approval_rates']) if stats['approval_rates'] else 0
                }
                for col, stats in self.column_stats.items()
            }
        }

# Global stats object
stats = NormalizationStats()

def export_cache_to_csv(filename: str = 'cache_export.csv'):
    """
    Export cache entries to a CSV file
    """
    entries = []
    for cache_file in CACHE_DIR.glob('*.pkl'):
        try:
            with open(cache_file, 'rb') as f:
                entry = CacheEntry.from_dict(pickle.load(f))
                key_parts = cache_file.stem.split(':')
                entries.append({
                    'column_name': key_parts[0],
                    'original_value': key_parts[1],
                    'normalized_value': entry.normalized_value,
                    'confidence_score': entry.confidence_score,
                    'timestamp': entry.timestamp.isoformat(),
                    'approved_by': entry.approved_by,
                    'review_count': entry.review_count,
                    'last_reviewed': entry.last_reviewed.isoformat() if entry.last_reviewed else None
                })
        except Exception as e:
            logging.warning(f"Error reading cache file {cache_file}: {e}")
    
    if entries:
        df = pd.DataFrame(entries)
        df.to_csv(filename, index=False)
        print(f"Exported {len(entries)} cache entries to {filename}")
    else:
        print("No cache entries to export")

def import_cache_from_csv(filename: str):
    """
    Import cache entries from a CSV file
    """
    try:
        df = pd.read_csv(filename)
        imported_count = 0
        
        for _, row in df.iterrows():
            cache_key = get_cache_key(row['original_value'], row['column_name'])
            entry = CacheEntry(
                normalized_value=row['normalized_value'],
                confidence_score=float(row['confidence_score']),
                timestamp=datetime.fromisoformat(row['timestamp'])
            )
            entry.approved_by = row['approved_by']
            entry.review_count = int(row['review_count'])
            if pd.notna(row['last_reviewed']):
                entry.last_reviewed = datetime.fromisoformat(row['last_reviewed'])
            
            cache_file = CACHE_DIR / f"{cache_key}.pkl"
            with open(cache_file, 'wb') as f:
                pickle.dump(entry.to_dict(), f)
            imported_count += 1
        
        print(f"Imported {imported_count} cache entries from {filename}")
    except Exception as e:
        logging.error(f"Error importing cache from {filename}: {e}")
        print(f"Error importing cache: {e}")

def bulk_edit_cache_entries():
    """
    Bulk edit cache entries based on patterns
    """
    print("\nBulk Edit Options:")
    print("1. Edit by column")
    print("2. Edit by confidence score range")
    print("3. Edit by approval status")
    print("4. Edit by date range")
    print("5. Exit")
    
    choice = input("\nEnter your choice (1-5): ")
    
    if choice == '5':
        return
    
    entries = []
    for cache_file in CACHE_DIR.glob('*.pkl'):
        try:
            with open(cache_file, 'rb') as f:
                entry = CacheEntry.from_dict(pickle.load(f))
                key_parts = cache_file.stem.split(':')
                entries.append((cache_file, key_parts[0], key_parts[1], entry))
        except Exception as e:
            logging.warning(f"Error reading cache file {cache_file}: {e}")
    
    if not entries:
        print("No cache entries found.")
        return
    
    filtered_entries = []
    if choice == '1':
        column = input("Enter column name to edit: ")
        filtered_entries = [(f, c, o, e) for f, c, o, e in entries if c == column]
    elif choice == '2':
        min_score = float(input("Enter minimum confidence score: "))
        max_score = float(input("Enter maximum confidence score: "))
        filtered_entries = [(f, c, o, e) for f, c, o, e in entries if min_score <= e.confidence_score <= max_score]
    elif choice == '3':
        status = input("Enter approval status (auto_approved/user_approved/manual_review): ")
        filtered_entries = [(f, c, o, e) for f, c, o, e in entries if e.approved_by == status]
    elif choice == '4':
        start_date = datetime.fromisoformat(input("Enter start date (YYYY-MM-DD): "))
        end_date = datetime.fromisoformat(input("Enter end date (YYYY-MM-DD): "))
        filtered_entries = [(f, c, o, e) for f, c, o, e in entries if start_date <= e.timestamp <= end_date]
    
    if not filtered_entries:
        print("No entries match the criteria.")
        return
    
    print(f"\nFound {len(filtered_entries)} entries to edit.")
    print("\nEdit Options:")
    print("1. Set new normalized value")
    print("2. Set new confidence score")
    print("3. Set new approval status")
    print("4. Delete entries")
    
    edit_choice = input("\nEnter your choice (1-4): ")
    
    if edit_choice == '1':
        new_value = input("Enter new normalized value: ")
        for cache_file, _, _, entry in filtered_entries:
            entry.normalized_value = new_value
            entry.review_count += 1
            entry.last_reviewed = datetime.now()
            entry.approved_by = "bulk_edit"
            with open(cache_file, 'wb') as f:
                pickle.dump(entry.to_dict(), f)
    elif edit_choice == '2':
        new_score = float(input("Enter new confidence score: "))
        for cache_file, _, _, entry in filtered_entries:
            entry.confidence_score = new_score
            entry.review_count += 1
            entry.last_reviewed = datetime.now()
            entry.approved_by = "bulk_edit"
            with open(cache_file, 'wb') as f:
                pickle.dump(entry.to_dict(), f)
    elif edit_choice == '3':
        new_status = input("Enter new approval status: ")
        for cache_file, _, _, entry in filtered_entries:
            entry.approved_by = new_status
            entry.review_count += 1
            entry.last_reviewed = datetime.now()
            with open(cache_file, 'wb') as f:
                pickle.dump(entry.to_dict(), f)
    elif edit_choice == '4':
        confirm = input(f"Are you sure you want to delete {len(filtered_entries)} entries? (y/n): ")
        if confirm.lower() == 'y':
            for cache_file, _, _, _ in filtered_entries:
                cache_file.unlink()
            print(f"Deleted {len(filtered_entries)} entries.")

def process_all_files():
    """
    Process all demographic analysis files in the directory
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    analysis_files = [f for f in os.listdir(script_dir) if f.startswith('demographic_analysis_') and f.endswith('.txt')]
    
    if not analysis_files:
        print("No demographic analysis files found.")
        return
    
    print(f"\nProcessing all {len(analysis_files)} files...")
    
    for file in analysis_files:
        print(f"\nProcessing {file}...")
        filepath = os.path.join(script_dir, file)
        
        try:
            data = read_demographic_file(filepath)
            normalized_data = normalize_data(data)
            
            if check_duplicate_data(normalized_data):
                print(f"Warning: {file} appears to be a duplicate.")
                if input("Skip this file? (y/n): ").lower() == 'y':
                    continue
            
            sql_content = generate_sql(normalized_data)
            sql_filepath = save_sql(sql_content, filepath)
            print(f"SQL statements saved to: {sql_filepath}")
            
        except Exception as e:
            logging.error(f"Error processing {file}: {e}")
            print(f"Error processing {file}: {e}")
            if input("Continue with next file? (y/n): ").lower() != 'y':
                break

def show_normalization_stats():
    """
    Display detailed normalization statistics
    """
    summary = stats.get_summary()
    
    print("\nNormalization Statistics:")
    print("=" * 50)
    print(f"Total Normalizations: {summary['total_normalizations']}")
    print(f"Cache Hits: {summary['cache_hits']}")
    print(f"GPT Calls: {summary['gpt_calls']}")
    print(f"Auto Approvals: {summary['auto_approvals']}")
    print(f"Manual Approvals: {summary['manual_approvals']}")
    print(f"Rejections: {summary['rejections']}")
    print(f"Duration: {summary['duration_seconds']:.2f} seconds")
    
    print("\nColumn Statistics:")
    print("=" * 50)
    for column, col_stats in summary['columns'].items():
        print(f"\n{column}:")
        print(f"  Total Values: {col_stats['total']}")
        print(f"  Unique Values: {col_stats['unique_values']}")
        print(f"  Average Confidence: {col_stats['avg_confidence']:.2f}")
        print(f"  Approval Rate: {col_stats['approval_rate']:.2%}")

def main():
    """
    Main function to convert demographic analysis to SQL
    """
    print("Demographic Analysis to SQL Converter\n" + "="*40)
    
    while True:
        print("\nMenu:")
        print("1. Process a single file")
        print("2. Process multiple files")
        print("3. Process all files")
        print("4. Review cache entries")
        print("5. Export/Import cache")
        print("6. Show normalization statistics")
        print("7. Exit")
        
        choice = input("\nEnter your choice (1-7): ")
        
        if choice == '1':
            process_single_file()
        elif choice == '2':
            process_multiple_files()
        elif choice == '3':
            process_all_files()
        elif choice == '4':
            review_cache_entries()
        elif choice == '5':
            print("\nExport/Import Menu:")
            print("1. Export cache to CSV")
            print("2. Import cache from CSV")
            subchoice = input("Enter your choice (1-2): ")
            if subchoice == '1':
                filename = input("Enter export filename (default: cache_export.csv): ") or 'cache_export.csv'
                export_cache_to_csv(filename)
            elif subchoice == '2':
                filename = input("Enter import filename: ")
                import_cache_from_csv(filename)
        elif choice == '6':
            show_normalization_stats()
        elif choice == '7':
            break
        else:
            print("Invalid choice.")

def process_single_file():
    """
    Process a single demographic analysis file
    """
    # Verify table exists
    if not verify_table_exists():
        print("Error: The demographic_analysis table does not exist in the database.")
        print("Please create the table first using the following SQL:")
        print("""
        CREATE TABLE demographic_analysis (
            id SERIAL PRIMARY KEY,
            age INTEGER,
            occupation VARCHAR(100),
            location VARCHAR(100),
            zip_code VARCHAR(10),
            gender VARCHAR(20),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            prediction_location VARCHAR(100),
            prediction_employment VARCHAR(100),
            prediction_income VARCHAR(100),
            prediction_education VARCHAR(100),
            prediction_health VARCHAR(100),
            prediction_crime VARCHAR(100),
            prediction_environment VARCHAR(100),
            prediction_culture VARCHAR(100),
            prediction_transportation VARCHAR(100),
            prediction_housing VARCHAR(100),
            prediction_technology VARCHAR(100),
            prediction_social VARCHAR(100),
            prediction_economic VARCHAR(100)
        );
        """)
        return
    
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # List all demographic analysis files
    analysis_files = [f for f in os.listdir(script_dir) if f.startswith('demographic_analysis_') and f.endswith('.txt')]
    
    if not analysis_files:
        print("No demographic analysis files found in the backend directory.")
        return
    
    print("\nAvailable files:")
    for i, file in enumerate(analysis_files, 1):
        print(f"{i}. {file}")
    
    # Let user choose a file
    choice = int(input("\nEnter the number of the file to convert: ")) - 1
    if choice < 0 or choice >= len(analysis_files):
        print("Invalid choice.")
        return
    
    filepath = os.path.join(script_dir, analysis_files[choice])
    
    print(f"\nProcessing {analysis_files[choice]}...")
    
    # Read and parse the file
    data = read_demographic_file(filepath)
    
    # Normalize the data
    print("Normalizing data...")
    normalized_data = normalize_data(data)
    
    # Check for duplicates
    if check_duplicate_data(normalized_data):
        print("\nWarning: This data appears to be a duplicate of an existing record.")
        proceed = input("Do you want to proceed with generating the SQL anyway? (y/n): ")
        if proceed.lower() != 'y':
            print("Operation cancelled.")
            return
    
    # Generate SQL
    print("Generating SQL...")
    sql_content = generate_sql(normalized_data)
    
    # Save SQL to file
    sql_filepath = save_sql(sql_content, filepath)
    
    print(f"\nSQL statements saved to: {sql_filepath}")

def process_multiple_files():
    """
    Process multiple demographic analysis files in batch
    """
    # Verify table exists
    if not verify_table_exists():
        print("Error: The demographic_analysis table does not exist.")
        return
    
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # List all demographic analysis files
    analysis_files = [f for f in os.listdir(script_dir) if f.startswith('demographic_analysis_') and f.endswith('.txt')]
    
    if not analysis_files:
        print("No demographic analysis files found in the backend directory.")
        return
    
    print("\nAvailable files:")
    for i, file in enumerate(analysis_files, 1):
        print(f"{i}. {file}")
    
    # Let user choose files
    choices = input("\nEnter the numbers of the files to process (comma-separated): ")
    try:
        file_indices = [int(x.strip()) - 1 for x in choices.split(',')]
        selected_files = [analysis_files[i] for i in file_indices if 0 <= i < len(analysis_files)]
    except ValueError:
        print("Invalid input. Please enter comma-separated numbers.")
        return
    
    if not selected_files:
        print("No valid files selected.")
        return
    
    print(f"\nProcessing {len(selected_files)} files...")
    
    for file in selected_files:
        print(f"\nProcessing {file}...")
        filepath = os.path.join(script_dir, file)
        
        # Read and parse the file
        data = read_demographic_file(filepath)
        
        # Normalize the data
        print("Normalizing data...")
        normalized_data = normalize_data(data)
        
        # Check for duplicates
        if check_duplicate_data(normalized_data):
            print(f"\nWarning: {file} appears to be a duplicate of an existing record.")
            proceed = input("Do you want to proceed with generating the SQL anyway? (y/n): ")
            if proceed.lower() != 'y':
                print(f"Skipping {file}...")
                continue
        
        # Generate SQL
        print("Generating SQL...")
        sql_content = generate_sql(normalized_data)
        
        # Save SQL to file
        sql_filepath = save_sql(sql_content, filepath)
        
        print(f"SQL statements saved to: {sql_filepath}")

def review_cache_entries():
    """
    Review and manage cached normalization entries
    """
    print("\nCache Review Menu:")
    print("1. List all cached entries")
    print("2. Review specific entry")
    print("3. Delete specific entry")
    print("4. Clean up expired entries")
    print("5. Exit")
    
    choice = input("\nEnter your choice (1-5): ")
    
    if choice == '1':
        list_cache_entries()
    elif choice == '2':
        review_specific_entry()
    elif choice == '3':
        delete_specific_entry()
    elif choice == '4':
        cleanup_expired_cache()
        print("Expired entries cleaned up.")
    elif choice == '5':
        return
    else:
        print("Invalid choice.")

def list_cache_entries():
    """
    List all cached entries with their details
    """
    entries = []
    for cache_file in CACHE_DIR.glob('*.pkl'):
        try:
            with open(cache_file, 'rb') as f:
                entry = CacheEntry.from_dict(pickle.load(f))
                entries.append((cache_file.stem, entry))
        except Exception as e:
            logging.warning(f"Error reading cache file {cache_file}: {e}")
    
    if not entries:
        print("No cached entries found.")
        return
    
    print("\nCached Entries:")
    for i, (key, entry) in enumerate(entries, 1):
        print(f"\n{i}. Key: {key}")
        print(f"   Normalized Value: {entry.normalized_value}")
        print(f"   Confidence Score: {entry.confidence_score:.2f}")
        print(f"   Created: {entry.timestamp}")
        print(f"   Approved By: {entry.approved_by or 'None'}")
        print(f"   Review Count: {entry.review_count}")
        if entry.last_reviewed:
            print(f"   Last Reviewed: {entry.last_reviewed}")

def review_specific_entry():
    """
    Review and modify a specific cache entry
    """
    key = input("\nEnter the cache key to review: ")
    cache_file = CACHE_DIR / f"{key}.pkl"
    
    if not cache_file.exists():
        print("Entry not found.")
        return
    
    try:
        with open(cache_file, 'rb') as f:
            entry = CacheEntry.from_dict(pickle.load(f))
            
        print(f"\nCurrent Entry:")
        print(f"Normalized Value: {entry.normalized_value}")
        print(f"Confidence Score: {entry.confidence_score:.2f}")
        print(f"Created: {entry.timestamp}")
        print(f"Approved By: {entry.approved_by or 'None'}")
        
        new_value = input("\nEnter new normalized value (or press Enter to keep current): ").strip()
        if new_value:
            entry.normalized_value = new_value
            entry.review_count += 1
            entry.last_reviewed = datetime.now()
            entry.approved_by = "manual_review"
            
            with open(cache_file, 'wb') as f:
                pickle.dump(entry.to_dict(), f)
            print("Entry updated.")
    except Exception as e:
        logging.error(f"Error reviewing cache entry: {e}")
        print("Error reviewing entry.")

def delete_specific_entry():
    """
    Delete a specific cache entry
    """
    key = input("\nEnter the cache key to delete: ")
    cache_file = CACHE_DIR / f"{key}.pkl"
    
    if not cache_file.exists():
        print("Entry not found.")
        return
    
    confirm = input(f"Are you sure you want to delete {key}? (y/n): ")
    if confirm.lower() == 'y':
        try:
            cache_file.unlink()
            print("Entry deleted.")
        except Exception as e:
            logging.error(f"Error deleting cache entry: {e}")
            print("Error deleting entry.")

if __name__ == "__main__":
    main() 