-- Create database
CREATE DATABASE jobapplicationtracker;
USE jobapplicationtracker;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(512) NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NULL,       -- Optional
    city VARCHAR(100) NULL,       -- Optional
    linkedin VARCHAR(255) NULL     -- Optional
);

-- Hash all passwords in the users table (Run this manually after inserting data)
UPDATE users SET password = SHA2(password, 256);

-- Create profile table (1-to-1 with users)
CREATE TABLE profile (
    id INT PRIMARY KEY,  
    skills TEXT NOT NULL,  
    certifications TEXT NOT NULL,  
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create work_experience table (Many-to-1 relationship with profile)
CREATE TABLE work_experience (
    experience_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    years_of_experience INT NOT NULL,
    job_description TEXT,
    FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
);

-- Create education table (Many-to-1 relationship with profile)
CREATE TABLE education (
    education_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT,
    degree VARCHAR(255) NOT NULL,
    school VARCHAR(255) NOT NULL,
    gpa DECIMAL(3,2),
    field_of_study VARCHAR(255),
    graduation_date DATE,
    FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
);

CREATE TABLE jobs (
    jobs_id INT AUTO_INCREMENT PRIMARY KEY,
    job_title VARCHAR(100) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    job_location VARCHAR(50) NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    job_link VARCHAR(2083),  
    job_description TEXT     
 );


CREATE TABLE users_jobs (
  id int NOT NULL AUTO_INCREMENT,
  job_id int DEFAULT NULL,
  user_id int DEFAULT NULL,
  date_applied date DEFAULT NULL,
  status varchar(45) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY id_UNIQUE (id),
  KEY id_idx (job_id),
  KEY id_idx1 (user_id),
  CONSTRAINT job_id FOREIGN KEY (job_id) REFERENCES jobs (jobs_id),
  CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES users (id)
)