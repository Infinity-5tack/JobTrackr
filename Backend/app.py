import mysql.connector  # type: ignore
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token
import datetime
import os
from dotenv import load_dotenv
import requests
import http.client
import json
from openai import OpenAI
import time
import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re

# Load environment variables from .env file     
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

otp_store = {}

app_key = os.getenv('APP_KEY')  # API key for job search
jooble_api_key = os.getenv('JOOBLE_API_KEY')
jooble_host = os.getenv('JOOBLE_HOST')
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Database connection function
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

# Secret key for JWT
app.config["JWT_SECRET_KEY"] = "supersecretkey"  # Change this for production
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=1)
jwt = JWTManager(app)



@app.route('/signup', methods=['POST'])
def signup():
        data = request.get_json()  # Receive JSON data
        firstname = data.get('firstname')
        lastname = data.get('lastname')
        email = data.get('email')
        password = data.get('password')

        # Hash the password before storing it
        hashed_password = generate_password_hash(password, method="pbkdf2:sha256")

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if the user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            cursor.close()
            connection.close()
            return jsonify({"message": "Email already exists!"}), 400

        # Insert new user into the database with hashed password
        insert_query = "INSERT INTO users (firstname, email, password, lastname) VALUES (%s, %s, %s, %s)"
        cursor.execute(insert_query, (firstname, email, hashed_password, lastname))
        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({"message": "User created successfully!"}), 201


@app.route('/signin', methods=['POST'])
def signin():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT id, email, password FROM users WHERE email = %s", (email,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()

        if result:
            user_id, stored_email, stored_password = result
            if check_password_hash(stored_password, password):
                # Generate JWT token
                access_token = create_access_token(identity={"id": user_id, "email": stored_email})
                return jsonify({"message": "Sign-in successful!", "token": access_token}), 200
            else:
                return jsonify({"message": "Invalid password."}), 401
        else:
            return jsonify({"message": "User not found."}), 404


    # GET PROFILE - FIXED DATA RETRIEVAL
@app.route('/getProfile', methods=['GET'])
def getProfile():
        try:
            email = request.args.get('email')
            if not email:
                return jsonify({"error": "Email is required"}), 400

            connection = get_db_connection()
            cursor = connection.cursor(dictionary=True)  # Return results as dict

            # Fixing SQL Query - Ensures all data is properly fetched
            select_query = """
                SELECT 
                    u.id AS user_id, u.email, u.firstname, u.lastname, u.phone, u.linkedin, u.city,
                    p.skills, p.certifications,
                    w.company_name, w.position, w.years_of_experience, w.job_description,
                    e.degree, e.school, e.gpa, e.field_of_study, YEAR(e.graduation_date) AS graduation_year
                FROM users u
                LEFT JOIN profile p ON p.id = u.id
                LEFT JOIN work_experience w ON w.profile_id = u.id
                LEFT JOIN education e ON e.profile_id = u.id
                WHERE u.email = %s
            """

            cursor.execute(select_query, (email,))
            rows = cursor.fetchall()
            cursor.close()
            connection.close()

            if not rows:
                return jsonify({"message": "No data found for the given email"}), 404

            # Process results to group work experience and education properly
            profile_data = {}

            for row in rows:
                user_id = row["user_id"]
                if user_id not in profile_data:
                    profile_data[user_id] = {
                        "user_id": user_id,
                        "email": row["email"],
                        "firstname": row["firstname"],
                        "lastname": row["lastname"],
                        "phone": row["phone"],
                        "linkedin": row["linkedin"],
                        "city": row["city"],
                        "skills": row["skills"].split(", ") if row["skills"] else [],
                        "certifications": row["certifications"].split(", ") if row["certifications"] else [],
                        "workExperience": [],
                        "education": []
                    }

                # Append work experience if it exists
                if row["company_name"]:
                    work_exp = {
                        "company": row["company_name"],
                        "position": row["position"],
                        "yearsOfExperience": row["years_of_experience"],
                        "responsibilities": row["job_description"]
                    }
                    if work_exp not in profile_data[user_id]["workExperience"]:
                        profile_data[user_id]["workExperience"].append(work_exp)

                # Append education if it exists
                if row["degree"]:
                    education_entry = {
                        "degree": row["degree"],
                        "institution": row["school"],
                        "gpa": row["gpa"],
                        "field": row["field_of_study"],
                        "endYear": row["graduation_year"]
                    }
                    if education_entry not in profile_data[user_id]["education"]:
                        profile_data[user_id]["education"].append(education_entry)

            # Debugging: Print the final profile data
            print("Final Profile Data:", profile_data)

            return jsonify({"message": "Data fetched successfully!", "data": list(profile_data.values())[0]}), 200

        except Exception as e:
            print("Error in getProfile:", str(e))
            return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


    # CREATE / EDIT PROFILE - FIXED DATA STORAGE
@app.route('/createProfile', methods=['POST'])
@app.route('/editProfile', methods=['POST'])
@app.route('/editProfile', methods=['POST'])
def createOrEditProfile():
    try:
        data = request.get_json()

        original_email = data.get('originalEmail') or data.get('email')  # Use original email to fetch user
        updated_email = data.get('email')
        phone = data.get('phone', "")
        city = data.get('city', "")
        linkedin = data.get('linkedin', "")
        experience = data.get('workExperience', [])
        education = data.get('education', [])
        skills = data.get('skills', [])
        certifications = data.get('certifications', [])

        if not original_email:
            return jsonify({"error": "Original email is required"}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Fetch user by original email
        cursor.execute("SELECT id FROM users WHERE email = %s", (original_email,))
        existing_user = cursor.fetchone()

        if not existing_user:
            return jsonify({"error": "User not found"}), 404

        user_id = existing_user[0]

        # If email is changed, update it
        if updated_email and original_email != updated_email:
            cursor.execute("UPDATE users SET email = %s WHERE id = %s", (updated_email, user_id))

        firstname = data.get("firstname", "")
        lastname = data.get("lastname", "")

        cursor.execute("""
    UPDATE users 
    SET firstname = %s, lastname = %s, phone = %s, city = %s, linkedin = %s 
    WHERE id = %s
""", (firstname, lastname, phone, city, linkedin, user_id))

        # Convert skills and certifications to string
        skills_str = ", ".join(skills) if skills else ""
        certifications_str = ", ".join([c.get("name", "") if isinstance(c, dict) else c for c in certifications])

        # Insert or update profile
        cursor.execute("""
            INSERT INTO profile (id, skills, certifications) 
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE skills = VALUES(skills), certifications = VALUES(certifications)
        """, (user_id, skills_str, certifications_str))

        # Clear old experience/education
        cursor.execute("DELETE FROM work_experience WHERE profile_id = %s", (user_id,))
        cursor.execute("DELETE FROM education WHERE profile_id = %s", (user_id,))

        # Insert work experience
        for i in experience:
            cursor.execute("""
                INSERT INTO work_experience (profile_id, company_name, position, years_of_experience, job_description) 
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, i.get("company", ""), i.get("position", ""), int(i.get("yearsOfExperience", 0)), i.get("responsibilities", "")))

        # Insert education
        for i in education:
            graduation_date = f"{i.get('endYear', 2000)}-01-01" if i.get("endYear") else None
            cursor.execute("""
                INSERT INTO education (profile_id, degree, school, gpa, field_of_study, graduation_date) 
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (user_id, i.get("degree", ""), i.get("institution", ""), float(i.get("gpa", 0.0)), i.get("field", ""), graduation_date))

        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({"message": "Profile updated successfully!"}), 201

    except Exception as e:
        print("Error in editProfile:", str(e))
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


@app.route('/createJob', methods=['POST'])
def create_job():
        try:
            data = request.get_json()
            original_email = data.get('originalEmail') or data.get('email')
            print(data, "****")  # Debugging

            job_title = data.get('job_title')
            company_name = data.get('company_name')
            job_location = data.get('job_location')
            job_type = data.get('job_type')
            job_status = data.get('job_status') or "Applied"  # Default value
            date_applied = data.get('date_applied')
            job_link = data.get('job_link')
            job_description = data.get('job_description')
            notes = data.get('notes')
            original_email = data.get('originalEmail') or data.get('email')
            job_id = data.get('job_id')

            connection = get_db_connection()
            cursor = connection.cursor()

            # Get user ID from email
            cursor.execute("SELECT id FROM users WHERE email = %s", (original_email,))
            user = cursor.fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404

            user_id = user[0]

            if not job_id:  # Create a new job
                insert_job_query = """
                    INSERT INTO jobs (job_title, company_name, job_location, job_type, 
                                    job_link, job_description)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                cursor.execute(insert_job_query, (job_title, company_name, job_location, job_type,
                                                job_link, job_description))

                cursor.execute("SELECT LAST_INSERT_ID()")
                last_inserted_id = cursor.fetchone()[0]

                job_id = last_inserted_id  # Ensure we have a valid job_id

            # Insert into `users_jobs`, ensuring `status` is not blank
            insert_user_job = """
                INSERT INTO users_jobs (job_id, user_id, date_applied, status)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE status = VALUES(status), date_applied = VALUES(date_applied)
            """
            cursor.execute(insert_user_job, (job_id, user_id, date_applied, job_status))

            connection.commit()
            cursor.close()
            connection.close()

            return jsonify({"message": "Job entry created successfully!"}), 201

        except Exception as e:
            print("Error in createJob:", str(e))
            return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


    # Get all jobs for a user
@app.route('/getuserJobs', methods=['GET'])
def get_userjobs():
        try:
            email = request.args.get('email', '').strip()
            if not email:
                return jsonify({"error": "Email is required"}), 400

            connection = get_db_connection()
            cursor = connection.cursor(dictionary=True)

            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if not user:
                return jsonify({"error": "User not found"}), 404

            user_id = user['id']

            cursor.execute("""
                SELECT j.*, DATE_FORMAT(uj.date_applied, '%Y-%m-%d') AS date_applied, 
                    COALESCE(uj.status, 'Applied') AS job_status
                FROM users_jobs uj
                INNER JOIN jobs j ON uj.job_id = j.jobs_id
                WHERE uj.user_id = %s
            """, (user_id,))

            jobs = cursor.fetchall()

            cursor.close()
            connection.close()

            return jsonify({"jobs": jobs}), 200

        except Exception as e:
            print("Error in getJobs:", str(e))
            return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


    # Get all jobs
@app.route('/getAllJobs', methods=['GET'])
def get_jobs():
        try:

            connection = get_db_connection()
            cursor = connection.cursor(dictionary=True)

            cursor.execute("""
                SELECT *FROM jobs
            """)

            jobs = cursor.fetchall()

            cursor.close()
            connection.close()

            return jsonify({"jobs": jobs}), 200

        except Exception as e:
            print("Error in getJobs:", str(e))
            return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


@app.route('/editJob', methods=['POST'])
def edit_job():
        try:
            data = request.get_json()
            job_id = data.get("job_id")
            job_title = data.get("job_title")
            company_name = data.get("company_name")
            job_location = data.get("job_location")
            job_type = data.get("job_type")
            job_status = data.get("job_status") or "Applied"  # Default status
            date_applied = data.get("date_applied")
            job_link = data.get("job_link")
            job_description = data.get("job_description")
            notes = data.get("notes")
            email = data.get("email")

            if not job_id:
                return jsonify({"error": "Job ID is required"}), 400

            connection = get_db_connection()
            cursor = connection.cursor()

            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            user_id = cursor.fetchone()[0]

            if not user_id:
                return jsonify({"error": "User not found"}), 404

            print("user_id", user_id)

            update_job_query = """
                UPDATE jobs 
                SET job_title = %s, company_name = %s, job_location = %s, job_type = %s, 
                    job_link = %s, job_description = %s
                WHERE jobs_id = %s
            """
            cursor.execute(update_job_query, (job_title, company_name, job_location, job_type,
                                            job_link, job_description, job_id))

            update_user_job_query = """
                UPDATE users_jobs 
                SET status = %s, date_applied = %s
                WHERE job_id = %s AND user_id = %s
            """
            cursor.execute(update_user_job_query, (job_status, date_applied, job_id, user_id))

            connection.commit()
            cursor.close()
            connection.close()

            return jsonify({"message": "Job updated successfully!"}), 200

        except Exception as e:
            print("Error in editJob:", str(e))
            return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


@app.route('/deleteJob', methods=['POST'])
def delete_job():
        try:
            data = request.get_json()
            job_id = data.get("jobs_id")
            email = data.get("email")

            if not job_id:
                return jsonify({"error": "Job ID is required"}), 400

            connection = get_db_connection()
            cursor = connection.cursor()

            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if not user:
                return jsonify({"error": "User not found"}), 404

            user_id = user[0]

            delete_query = "DELETE FROM users_jobs WHERE job_id = %s AND user_id = %s"
            cursor.execute(delete_query, (job_id, user_id))
            connection.commit()

            cursor.close()
            connection.close()

            return jsonify({"message": "Job deleted successfully!"}), 200

        except Exception as e:
            print("Error in deleteJob:", str(e))
            return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


@app.route('/analytics', methods=['GET'])
def analytics():
        try:
            email = request.args.get('email', '').strip()
            if not email:
                return jsonify({"error": "Email is required"}), 400

            connection = get_db_connection()
            cursor = connection.cursor(dictionary=True)

            # Get user ID
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if not user:
                return jsonify({"error": "User not found"}), 404

            user_id = user['id']

            # Fetch job status analytics
            cursor.execute("""
                SELECT status, COUNT(*) AS count
                FROM users_jobs
                WHERE user_id = %s
                GROUP BY status;
            """, (user_id,))
            job_statuses = cursor.fetchall()

            # Fetch job title analytics
            cursor.execute("""
                SELECT j.job_title, COUNT(*) AS count
                FROM users_jobs uj
                JOIN jobs j ON uj.job_id = j.jobs_id
                WHERE uj.user_id = %s
                GROUP BY j.job_title;
            """, (user_id,))
            job_titles = cursor.fetchall()

            # Fetch total applications per month
            cursor.execute("""
                SELECT DATE_FORMAT(date_applied, '%Y-%m') AS month, COUNT(*) AS total_applications
                FROM users_jobs
                WHERE user_id = %s
                GROUP BY month
                ORDER BY month;
            """, (user_id,))
            applications_per_month = cursor.fetchall()

            # Fetch job type distribution
            cursor.execute("""
                SELECT j.job_type, COUNT(*) AS total_jobs
                FROM users_jobs uj
                JOIN jobs j ON uj.job_id = j.jobs_id
                WHERE uj.user_id = %s
                GROUP BY j.job_type
                ORDER BY total_jobs DESC;
            """, (user_id,))
            job_type_distribution = cursor.fetchall()

            cursor.close()
            connection.close()

            return jsonify({
                "jobs": job_statuses,
                "job_titles": job_titles,
                "applications_per_month": applications_per_month,
                "job_type_distribution": job_type_distribution
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500


@app.route('/generalanalytics', methods=['GET'])
def general_analytics():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT j.company_name, COUNT(*) AS count
            FROM users_jobs uj
            JOIN jobs j ON uj.job_id = j.jobs_id
            GROUP BY j.company_name
            ORDER BY count DESC;
        """)
        company_data = cursor.fetchall()

        cursor.execute("""
            SELECT j.job_title, COUNT(*) AS count
            FROM users_jobs uj
            JOIN jobs j ON uj.job_id = j.jobs_id
            GROUP BY j.job_title
            ORDER BY count DESC;
        """)
        job_title_data = cursor.fetchall()

        cursor.execute("""
            SELECT j.job_location, COUNT(*) AS count
            FROM users_jobs uj
            JOIN jobs j ON uj.job_id = j.jobs_id
            GROUP BY j.job_location
            ORDER BY count DESC;
        """)
        job_location_data = cursor.fetchall()

        cursor.execute("""
            SELECT status, COUNT(*) AS count
            FROM users_jobs
            WHERE status IN ('Offer', 'Rejected')
            GROUP BY status;
        """)
        offers_rejections_data = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({
            "company_data": company_data,
            "job_title_data": job_title_data,
            "job_location_data": job_location_data,
            "offers_rejections_data": offers_rejections_data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/jobsearchapi', methods=['GET'])
def jobsearchapi():
        try:
            keyword = request.args.get('keyword', '').strip()
            page = request.args.get('page', 1, type=int)
            country = request.args.get('country', 'us').strip().lower()

            if country not in ["us", "ca"]:
                return jsonify({"error": "Invalid country. Choose 'us' or 'ca'."}), 400

            app_id = "10b2419a"
            url = f"http://api.adzuna.com/v1/api/jobs/{country}/search/{page}"

            params = {
                "app_id": app_id,
                "app_key": app_key,
                "what": keyword,
                "max_days_old": 3,
                "results_per_page": 20,
                "content-type": "application/json"
            }

            response = requests.get(url, params=params)

            if response.status_code == 200:
                jobs_data = response.json()
                total_results = jobs_data.get("count", 1)
                results_per_page = 20
                total_pages = (total_results // results_per_page) + (1 if total_results % results_per_page > 0 else 0)

                return jsonify({"jobs_data": jobs_data.get("results", []), "total_pages": total_pages}), 200
            else:
                return jsonify({"error": "Failed to fetch jobs"}), response.status_code

        except Exception as e:
            print("Error in jobsearchapi:", str(e))
            return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


def fetch_jobs_from_jooble(keyword, location=""):
        try:
            connection = http.client.HTTPSConnection(jooble_host)
            headers = {"Content-type": "application/json"}
            body = json.dumps({"keywords": keyword, "location": location})

            connection.request("POST", f"/api/{jooble_api_key}", body, headers)
            response = connection.getresponse()

            raw_data = response.read().decode("utf-8")
            jobs_data = json.loads(raw_data)

            # ✅ Format and clean response
            formatted_jobs = []
            for job in jobs_data.get("jobs", []):
                formatted_jobs.append({
                    "title": job.get("title", "N/A"),
                    "company": job.get("company", "N/A"),
                    "location": job.get("location", "N/A"),
                    "date_posted": job.get("updated", "N/A"),
                    "job_type": job.get("type", "N/A"),
                    "salary": job.get("salary", "Not Specified"),
                    "link": job.get("link", "#")
                })

            return {"total_jobs": len(formatted_jobs), "jobs": formatted_jobs}

        except Exception as e:
            print("Error fetching jobs from Jooble:", str(e))
            return {"error": f"Exception occurred: {str(e)}"}


@app.route('/jooblejobsearchapi', methods=['GET'])
def jooble_job_search_api():
        try:
            keyword = request.args.get("keyword", "").strip()
            location = request.args.get("location", "").strip()

            if not keyword:
                return jsonify({"error": "Keyword is required"}), 400

            jobs_data = fetch_jobs_from_jooble(keyword, location)
            return jsonify(jobs_data), 200

        except Exception as e:
            print("Error in Jooble API:", str(e))
            return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


@app.route('/generateCoverLetter', methods=['POST'])
def generate_cover_letter():
    try:
        data = request.get_json()
        job_description = data.get('job_description', '').strip()
        email = data.get('email', '').strip()

        if not job_description or not email:
            return jsonify({"error": "Job description and email are required"}), 400

        # Fetch user profile from DB
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                u.id AS user_id, u.firstname, u.lastname, u.email, u.phone, u.city,
                p.skills
            FROM users u
            LEFT JOIN profile p ON p.id = u.id
            WHERE u.email = %s
        """, (email,))
        row = cursor.fetchone()
        cursor.close()
        connection.close()

        if not row:
            return jsonify({"error": "No user found with that email"}), 404

        # Extract user info
        full_name = f"{row['firstname']} {row['lastname']}"
        city = row['city']
        phone = row['phone']
        user_email = row['email']

        # Try to extract company name from job description
        company_match = re.search(r'\b(?:at|with|within)\s+([A-Z][A-Za-z0-9&., ]+)', job_description)
        company_name = company_match.group(1).strip() if company_match else "the company"

        # Prompt for GPT
        prompt = f"""
You are a professional cover letter writer.

Write a cover letter using the following formatting and rules:

- At the top, center the following:
{full_name}
{city}
{user_email}
{phone}

- Then add:
To,  
The Hiring Manager,  
{company_name}

- Do NOT include LinkedIn, URLs, street address, or placeholders like [Your Name]
- The body of the letter should be tailored to the job description
- Use a professional tone, align with resume structure, and keep it concise

Job Description:
{job_description}

Begin the cover letter below:
"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful AI that writes professional, personalized cover letters."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=600
        )

        cover_letter = response.choices[0].message.content.strip()
        return jsonify({"cover_letter": cover_letter}), 200

    except Exception as e:
        print("❌ Error generating cover letter:", str(e))
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


@app.route('/generateResume', methods=['POST'])
def generate_resume():
    try:
        print("🔥 /generateResume endpoint hit")

        data = request.get_json()
        print("📨 Received Data:", data)

        job_description = data.get('job_description')
        email = data.get('email')

        if not job_description or not email:
            return jsonify({"error": "Job description and email are required"}), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        select_query = """
            SELECT 
                u.id AS user_id, u.email, u.firstname, u.lastname, u.phone, u.linkedin, u.city,
                p.skills, p.certifications,
                w.company_name, w.position, w.years_of_experience, w.job_description,
                e.degree, e.school, e.gpa, e.field_of_study, YEAR(e.graduation_date) AS graduation_year
            FROM users u
            LEFT JOIN profile p ON p.id = u.id
            LEFT JOIN work_experience w ON w.profile_id = u.id
            LEFT JOIN education e ON e.profile_id = u.id
            WHERE u.email = %s
        """

        cursor.execute(select_query, (email,))
        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        if not rows:
            return jsonify({"message": "No data found for the given email"}), 404

        profile_data = {}
        for row in rows:
            user_id = row["user_id"]
            if user_id not in profile_data:
                profile_data[user_id] = {
                    "user_id": user_id,
                    "email": row["email"],
                    "firstname": row["firstname"],
                    "lastname": row["lastname"],
                    "phone": row["phone"],
                    "linkedin": row["linkedin"],
                    "city": row["city"],
                    "skills": row["skills"].split(", ") if row["skills"] else [],
                    "certifications": row["certifications"].split(", ") if row["certifications"] else [],
                    "workExperience": [],
                    "education": []
                }

            if row["company_name"]:
                work_exp = {
                    "company": row["company_name"],
                    "position": row["position"],
                    "yearsOfExperience": row["years_of_experience"],
                    "responsibilities": row["job_description"]
                }
                if work_exp not in profile_data[user_id]["workExperience"]:
                    profile_data[user_id]["workExperience"].append(work_exp)

            if row["degree"]:
                education_entry = {
                    "degree": row["degree"],
                    "institution": row["school"],
                    "gpa": row["gpa"],
                    "field": row["field_of_study"],
                    "endYear": row["graduation_year"]
                }
                if education_entry not in profile_data[user_id]["education"]:
                    profile_data[user_id]["education"].append(education_entry)

        print("✅ Final Profile Data:", profile_data)

        prompt = f"""
        You are a resume expert. Generate a professional resume based on the user's profile and the job description provided.

        The format must follow these rules:
        - Do not use asterisks (*) anywhere in the resume
        - Contact info (City | Phone | Email | LinkedIn) should appear below the name, also center-aligned
        - Use markdown headers for each section (like ## Summary, ## Work Experience)
        - Work Experience should be in the format:  
        [Job Title], [Company]  
        [City]  
        [Start Year] - [End Year or Present]  
        - Education should be in the format:  
        [Degree], [Institution]  
        [City]  
        [Expected Graduation Year], GPA: [GPA if available]
        - Responsibilities in work experience should be bullet points
        - Ensure consistent indentation, spacing, and header hierarchy
        - Leave an empty line between sections

Profile:
{profile_data}

Job Description:
{job_description}

Resume:
"""

        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful AI that creates professional Resume."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500
            )
        except Exception as e:
            print("❌ OpenAI API Error:", str(e))
            return jsonify({"error": "OpenAI API Error", "details": str(e)}), 500

        resume = response.choices[0].message.content.strip()
        return jsonify({"Resume": resume}), 200

    except Exception as e:
        print("🔥 Unexpected Error:", str(e))
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@app.route('/generateOTP', methods=['POST'])
def generate_otp():
    try:
        data = request.get_json()
        email = data.get("email").strip().lower()

        # Check if email exists
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        connection.close()

        if not user:
            return jsonify({"error": "Email not registered"}), 404

        # Generate OTP and store with email as key
        otp = str(random.randint(100000, 999999))
        otp_store[email] = {'otp': otp, 'timestamp': time.time()}

        # Send the OTP
        sender_email = "infinity.5stack.seneca@gmail.com"
        sender_password = "bjnu etpj ejom uxvi"
        subject = "Your OTP Code"
        body = f"Your OTP code is: {otp}. It is valid for 10 minutes."

        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=120)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, email, msg.as_string())
        server.quit()

        print(f"✅ OTP sent to {email}: {otp}")
        return jsonify({"message": "OTP Sent Successfully"}), 200

    except Exception as e:
        print("Error sending OTP:", str(e))
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


@app.route('/verifyOTP', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json()
        email = data.get("email").strip().lower()
        otp = data.get("otp")

        stored_data = otp_store.get(email)

        if not stored_data:
            return jsonify({"message": "No OTP found for this email"}), 404

        if time.time() - stored_data['timestamp'] > 600:  # 10-minute expiry
            del otp_store[email]  # Cleanup
            return jsonify({"message": "OTP expired"}), 400

        if stored_data['otp'] == otp:
            del otp_store[email]  # Cleanup after successful verification
            return jsonify({"message": "OTP Verified Successfully"}), 200
        else:
            return jsonify({"message": "Invalid OTP"}), 400

    except Exception as e:
        print("Error verifying OTP:", str(e))
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


@app.route('/resetPassword', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        email = data.get("email").strip().lower()
        new_password = data.get("password")

        # Check password length
        if len(new_password) < 6:
            return jsonify({"message": "Password must be at least 6 characters long."}), 400

        hashed_password = generate_password_hash(new_password, method="pbkdf2:sha256")

        connection = get_db_connection()
        cursor = connection.cursor()

        update_query = "UPDATE users SET password = %s WHERE email = %s"
        cursor.execute(update_query, (hashed_password, email))
        connection.commit()

        cursor.close()
        connection.close()
        return jsonify({"message": "Password Updated Successfully"}), 200

    except Exception as e:
        print("Error updating password:", str(e))
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


if __name__ == '__main__':
        app.run(host='0.0.0.0', port=5000, debug=True)