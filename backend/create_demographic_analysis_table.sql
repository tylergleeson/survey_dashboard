-- Create the demographic_analysis table
CREATE TABLE IF NOT EXISTS demographic_analysis (
    -- Primary key
    id BIGSERIAL PRIMARY KEY,
    
    -- Basic demographic information
    age INTEGER NOT NULL,
    occupation VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    
    -- Timestamp for record creation
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Predictions with their confidence levels
    prediction_location VARCHAR(100),
    prediction_location_confidence VARCHAR(20) CHECK (prediction_location_confidence IN ('High', 'Medium', 'Low')),
    
    prediction_employment VARCHAR(100),
    prediction_employment_confidence VARCHAR(20) CHECK (prediction_employment_confidence IN ('High', 'Medium', 'Low')),
    
    prediction_income VARCHAR(100),
    prediction_income_confidence VARCHAR(20) CHECK (prediction_income_confidence IN ('High', 'Medium', 'Low')),
    
    prediction_education VARCHAR(100),
    prediction_education_confidence VARCHAR(20) CHECK (prediction_education_confidence IN ('High', 'Medium', 'Low')),
    
    prediction_health VARCHAR(100),
    prediction_health_confidence VARCHAR(20) CHECK (prediction_health_confidence IN ('High', 'Medium', 'Low')),
    
    prediction_crime VARCHAR(100),
    prediction_crime_confidence VARCHAR(20) CHECK (prediction_crime_confidence IN ('High', 'Medium', 'Low')),
    
    prediction_environment VARCHAR(100),
    prediction_environment_confidence VARCHAR(20) CHECK (prediction_environment_confidence IN ('High', 'Medium', 'Low')),
    
    prediction_culture VARCHAR(100),
    prediction_culture_confidence VARCHAR(20) CHECK (prediction_culture_confidence IN ('High', 'Medium', 'Low')),
    
    prediction_transportation VARCHAR(100),
    prediction_transportation_confidence VARCHAR(20) CHECK (prediction_transportation_confidence IN ('High', 'Medium', 'Low')),
    
    prediction_housing VARCHAR(100),
    prediction_housing_confidence VARCHAR(20) CHECK (prediction_housing_confidence IN ('High', 'Medium', 'Low')),
    
    prediction_technology VARCHAR(100),
    prediction_technology_confidence VARCHAR(20) CHECK (prediction_technology_confidence IN ('High', 'Medium', 'Low')),
    
    prediction_social VARCHAR(100),
    prediction_social_confidence VARCHAR(20) CHECK (prediction_social_confidence IN ('High', 'Medium', 'Low')),
    
    prediction_economic VARCHAR(100),
    prediction_economic_confidence VARCHAR(20) CHECK (prediction_economic_confidence IN ('High', 'Medium', 'Low')),
    
    -- Constraints
    CONSTRAINT valid_age CHECK (age > 0 AND age < 120),
    CONSTRAINT valid_zip_code CHECK (zip_code ~ '^\d{5}(-\d{4})?$'),
    CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'non-binary', 'other'))
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_demographic_analysis_location ON demographic_analysis(location);
CREATE INDEX IF NOT EXISTS idx_demographic_analysis_occupation ON demographic_analysis(occupation);
CREATE INDEX IF NOT EXISTS idx_demographic_analysis_age ON demographic_analysis(age);
CREATE INDEX IF NOT EXISTS idx_demographic_analysis_created_at ON demographic_analysis(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_demographic_analysis_updated_at
    BEFORE UPDATE ON demographic_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE demographic_analysis ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all records
CREATE POLICY "Allow authenticated users to read all records"
    ON demographic_analysis
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for authenticated users to insert their own records
CREATE POLICY "Allow authenticated users to insert their own records"
    ON demographic_analysis
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy for authenticated users to update their own records
CREATE POLICY "Allow authenticated users to update their own records"
    ON demographic_analysis
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy for authenticated users to delete their own records
CREATE POLICY "Allow authenticated users to delete their own records"
    ON demographic_analysis
    FOR DELETE
    TO authenticated
    USING (true);

-- Add comments to the table and columns
COMMENT ON TABLE demographic_analysis IS 'Stores demographic analysis predictions with confidence levels';
COMMENT ON COLUMN demographic_analysis.id IS 'Unique identifier for each record';
COMMENT ON COLUMN demographic_analysis.age IS 'Age of the individual';
COMMENT ON COLUMN demographic_analysis.occupation IS 'Occupation of the individual';
COMMENT ON COLUMN demographic_analysis.location IS 'Location of the individual';
COMMENT ON COLUMN demographic_analysis.zip_code IS 'ZIP code of the individual';
COMMENT ON COLUMN demographic_analysis.gender IS 'Gender of the individual';
COMMENT ON COLUMN demographic_analysis.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN demographic_analysis.updated_at IS 'Timestamp when the record was last updated'; 