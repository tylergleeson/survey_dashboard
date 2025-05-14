-- Create the demographic_analysis table
CREATE TABLE IF NOT EXISTS demographic_analysis (
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

-- Insert some test data
INSERT INTO demographic_analysis (
    age, occupation, location, zip_code, gender,
    prediction_location, prediction_employment, prediction_income,
    prediction_education, prediction_health, prediction_crime,
    prediction_environment, prediction_culture, prediction_transportation,
    prediction_housing, prediction_technology, prediction_social,
    prediction_economic
) VALUES
(28, 'Software Engineer', 'San Francisco', '94105', 'male',
 'Urban Tech Hub', 'Full-time Tech', 'High Income',
 'Bachelor Degree', 'Good', 'Low',
 'Moderate', 'Diverse', 'Public Transit',
 'Renting', 'High', 'Active',
 'Growing'),
(35, 'Registered Nurse', 'Boston', '02108', 'female',
 'Urban Medical', 'Full-time Healthcare', 'Medium-High Income',
 'Bachelor Degree', 'Good', 'Low',
 'Moderate', 'Diverse', 'Public Transit',
 'Renting', 'Medium', 'Active',
 'Stable'),
(42, 'High School Teacher', 'Chicago', '60601', 'female',
 'Urban Education', 'Full-time Education', 'Medium Income',
 'Master Degree', 'Good', 'Moderate',
 'Moderate', 'Diverse', 'Public Transit',
 'Owning', 'Medium', 'Active',
 'Stable'); 