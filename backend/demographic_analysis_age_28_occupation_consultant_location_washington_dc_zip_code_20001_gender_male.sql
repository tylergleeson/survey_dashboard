INSERT INTO demographic_analysis (
    age, 
    occupation, 
    location, 
    zip_code, 
    gender, 
    timestamp, 
    prediction_location, 
    prediction_employment, 
    prediction_income, 
    prediction_education, 
    prediction_housing, 
    prediction_transportation, 
    prediction_technology, 
    prediction_economic
) 
VALUES (
    28, 
    'Consultant', 
    'Washington DC', 
    '20001', 
    'male', 
    CURRENT_TIMESTAMP, 
    'Washington DC', 
    'Full-time Salaried Employee at a Consulting Firm', 
    '$95,000 - $130,000 annually', 
    'Master''s degree (likely MBA or specialized master''s)', 
    'Renting a 1-bedroom apartment or sharing a larger unit', 
    'Mix of public transit (Metro) and rideshare services', 
    'Heavy smartphone and laptop usage, active on LinkedIn and professional apps', 
    'Upper-middle purchasing power, discretionary income of $1,500-2,500 monthly'
);