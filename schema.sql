CREATE TABLE surveys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_by VARCHAR(100), -- Admin/Co-admin identifier
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Form Fields Table (Stores the UI fields dynamically)
CREATE TABLE survey_fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT,
  field_label VARCHAR(255) NOT NULL,            -- e.g., "What is your email?"
  field_type ENUM('text', 'number', 'textarea', 'dropdown') NOT NULL, 
  field_options TEXT NULL,                       -- JSON string for dropdown options like ["Yes", "No"]
  is_required BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

-- 3. Survey Responses Table
CREATE TABLE survey_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT,
  response_data JSON NOT NULL,                  -- Stores answers like {"email": "user@test.com", "age": 25}
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);