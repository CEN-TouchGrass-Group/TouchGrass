import os
from datetime import datetime
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from gridfs import GridFS   # Mongo helper for storing files
from bson import ObjectId   # Type for Mongo stored files IDs
from werkzeug.security import generate_password_hash, check_password_hash   # For password hashing
from werkzeug.utils import secure_filename


CONNECTION_STRING = "mongodb+srv://TreeHugger:admin@touchgrassmain.lzxzeib.mongodb.net/?appName=TouchGrassMain"
client = MongoClient(CONNECTION_STRING)
database = client['User_info']
collection_name = database['login']
#print("Connection successful")

app = Flask(__name__)
CORS(app)

fs = GridFS(database) # for images
image_count = 5
extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']

def allowed_file(filename): #check that the file is of an allowed type, and that it has a type at all
    if '.' in filename:
        extension = filename.rsplit('.', 1)[1].lower()
        return extension in extensions    
    return False

def JSONify_image(image):   # Mongo image object to JSON
    if image is None:
        return None
    
    return {
        "id": str(image["file_id"]),
        "filename": image["filename"],
        "content_type": image["content_type"],
        "upload_date": image["upload_date"].isoformat()
    }

collection_name.create_index("username", unique=True) # For unique usernames

def JSONify_user(user): # Mongo user object to JSON 
    if user is None:
        return None
    
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "images": [JSONify_image(image) for image in user["images"]],
        "created_at": user["created_at"].isoformat()
    }

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    
    if not username or not password:
        return jsonify({"error": "Username and password cannot be empty"}), 400
    
    user = collection_name.find_one({"username": username})
    
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid username or password"}), 402

    return jsonify({"message": "Logged in successfully!", "user": JSONify_user(user)}), 200

@app.route("/createAccount", methods=["POST"])
def createAccount():
    data = request.get_json()
    newUsername = data.get("username", "").strip()
    newPassword = data.get("password", "").strip()
    
    if not newUsername or not newPassword:
        return jsonify({"error": "Username and password cannot be empty"}), 400
    
    password_hash = generate_password_hash(newPassword)
    
    new_user = {
        "username": newUsername,
        "password": password_hash,
        "images": [None] * image_count,
        "created_at": datetime.utcnow()
    }
    
    try:    # Ensure username does not already exists
        resultcollection_name.insert_one(new_user)
    except DuplicateKeyError:
        return jsonify({"error": "Username already exists"}), 401
    
    created_user = collection_name.find_one({"_id": result.inserted_id})

    # Return the created user data in the response
    return jsonify({"message": "Account created successfully", "user": JSONify_user(created_user)}), 201

'''
None of this has been checked, this is VSCode autofill:

@app.route("/uploadImage/<username>/<int:image_index>", methods=["POST"])
def uploadImage(username, image_index):
    user = collection_name.find_one({"username": username})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No image file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    # Save the image to GridFS
    image_id = fs.put(file, filename=secure_filename(file.filename), content_type=file.content_type)
    
    # Update the user's images list
    images = user.get("images", [None] * image_count)
    for i in range(image_count):
        if images[i] is None:
            images[i] = image_id
            break
    else:
        return jsonify({"error": "Maximum number of images reached"}), 400

    collection_name.update_one({"_id": user["_id"]}, {"$set": {"images": images}})

    return jsonify({"message": "Image uploaded successfully"}), 200
'''

if __name__ == "__main__":
    app.run(debug=True, port=5000)
