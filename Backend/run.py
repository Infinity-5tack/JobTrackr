import subprocess
import os
from flask_cors import CORS
from flask import Flask
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Retrieve the backend path and frontend path from the .env file
backend_path = os.getenv('BACKEND_PATH')
frontend_path = os.getenv('FRONTEND_PATH')

# Ensure the paths are defined in the .env file
if not backend_path or not frontend_path:
    print("Error: BACKEND_PATH or FRONTEND_PATH not defined in .env file.")
    exit(1)

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Start Python backend process using the dynamic backend path
python_process = subprocess.Popen("python app.py", shell=True, cwd=backend_path)

# Start npm frontend process using the dynamic frontend path
node_process = subprocess.Popen("npm start", shell=True, cwd=frontend_path)

# Wait for both processes to finish
python_process.wait()
node_process.wait()

if __name__ == '__main__':
    app.run(debug=True)