import os
from datetime import datetime
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from gridfs import GridFS
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

CONNECTION_STRING = "mongodb+srv://TreeHugger:admin@touchgrassmain.lzxzeib.mongodb.net/?appName=TouchGrassMain"
client = MongoClient(CONNECTION_STRING)
database = client['User_info']
collection_name = database['login']
image_collection = database['Images']
#print("Connection successful")

app = Flask(__name__)
CORS(app)

fs = GridFS(database)
image_count = 5
extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']

'''
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    user = collection_name.find_one({"username": username})
    if not user or user.get("password") != password:
        return jsonify({"error": "Invalid username or password"}), 401

    return jsonify({"message": "Logged in successfully!"})

@app.route("/createAccount", methods=["POST"])
def createAccount():
    data = request.get_json()
    newUsername = data.get("username")
    newPassword = data.get("password")
    if newUsername == "" or newPassword == "" :
        return jsonify({"message": "Credentials cannot be empty"})
    
    collection_name.insert_one({"username": newUsername, "password": newPassword, "touches": 0})

    return jsonify({"message": "Account created successfully"})


@app.route("/getTouches", methods=["GET"])
def getTouches():
    username = request.args.get("username")
    user = collection_name.find_one({"username" : username})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"touches": user["touches"]})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
'''

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
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password cannot be empty"}), 400

    user = collection_name.find_one({"username": username})

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid username or password"}), 401

    return jsonify({"message": "Logged in successfully!", "user": JSONify_user(user)}), 200

@app.route("/createAccount", methods=["POST"])
def createAccount():
    data = request.get_json(silent=True) or {}
    newUsername = data.get("username", "").strip()
    newPassword = data.get("password", "").strip()

    if not newUsername or not newPassword:
        return jsonify({"error": "Username and password cannot be empty"}), 400

    password_hash = generate_password_hash(newPassword)

    new_user = {
        "username": newUsername,
        "password_hash": password_hash,
        "images": [None] * image_count,
        "created_at": datetime.utcnow(),
        "touches": 0
    }

    try:
        result = collection_name.insert_one(new_user)
    except DuplicateKeyError:
        return jsonify({"error": "Username already exists"}), 409

    created_user = collection_name.find_one({"_id": result.inserted_id})
    return jsonify({"message": "Account created successfully", "user": JSONify_user(created_user)}), 201

@app.route("/uploadImage/<username>/<int:image_index>", methods=["POST"])
def uploadImage(username, image_index):
    if image_index < 0 or image_index >= image_count:
        return jsonify({"error": "Invalid image index"}), 400

    user = collection_name.find_one({"username": username})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    uploaded_file = request.files["image"]
    if uploaded_file.filename == "":
        return jsonify({"error": "No image file selected"}), 400

    if not allowed_file(uploaded_file.filename):
        return jsonify({"error": "File type not supported"}), 400

    file_bytes = uploaded_file.read()
    clean_filename = secure_filename(uploaded_file.filename)

    image_id = fs.put(
        file_bytes,
        filename=clean_filename,
        metadata={
            "username": username,
            "image_index": image_index,
            "content_type": uploaded_file.content_type,
            "upload_date": datetime.utcnow()
        }
    )

    new_image_info = {
        "file_id": image_id,
        "filename": clean_filename,
        "content_type": uploaded_file.content_type,
        "upload_date": datetime.utcnow()
    }

    old_image_value = user["images"][image_index]

    collection_name.update_one(
        {"_id": user["_id"]},
        {"$set": {f"images.{image_index}": new_image_info}}
    )

    if old_image_value is not None and "file_id" in old_image_value:
        try:
            fs.delete(old_image_value["file_id"])
        except Exception:
            pass

    updated_user = collection_name.find_one({"_id": user["_id"]})

    return jsonify({
        "message": f"Image stored successfully in slot {image_index}",
        "user": JSONify_user(updated_user)
    }), 200

@app.route("/getTouches", methods=["GET"])
def getTouches():
    username = request.args.get("username")
    user = collection_name.find_one({"username" : username})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"touches": user["touches"]})

@app.route("/getImages/<file_id>", methods=["GET"])
def getImages(file_id):
    try:
        file = fs.get(ObjectId(file_id))
        return Response(file.read(), mimetype=file.content_type)
    except:
        return jsonify({"error": "Images not found"}), 404
    
@app.route("/getPictures", methods=["GET"])
def getPictures():
    username = request.args.get("username")
    user = collection_name.find_one({"username" : username})
    if not user:
        return jsonify({"error": "User not found"}), 404
    image = []
    for img in user["images"]:
        if img is None:
            image.append(None)
        else:
            image.append({
                "file_id": str(img["file_id"]),"filename": img["filename"],"content_type": img["content_type"],
            })
    return jsonify({"pictures" : image})

if __name__ == "__main__":
    app.run(debug=True, port=5000)