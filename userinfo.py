from datetime import datetime, timedelta
from pydoc import doc
import random
from unittest import result
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
database = client["User_info"]

collection_name = database["login"]
weekly_collection = database["WeeklySubmissions"]

app = Flask(__name__)
CORS(app)

fs = GridFS(database)
weekly_fs = GridFS(database, collection="weekly_images")

image_count = 5
extensions = ["jpg", "jpeg", "png", "gif", "webp"]

collection_name.create_index("username", unique=True)
weekly_collection.create_index([("week_index", 1), ("username", 1)], unique=True)
weekly_collection.create_index("expiration_date", expireAfterSeconds=0)


def allowed_file(filename):
    if "." in filename:
        extension = filename.rsplit(".", 1)[1].lower()
        return extension in extensions
    return False


def ensure_user_image_array(user):
    if "images" not in user or not isinstance(user["images"], list) or len(user["images"]) != image_count:
        collection_name.update_one(
            {"_id": user["_id"]},
            {"$set": {"images": [None] * image_count}}
        )
        user = collection_name.find_one({"_id": user["_id"]})
    return user


def JSONify_image(image):
    if image is None:
        return None

    return {
        "id": str(image["file_id"]),
        "filename": image["filename"],
        "content_type": image["content_type"],
        "upload_date": image["upload_date"].isoformat()
    }


def JSONify_user(user):
    if user is None:
        return None

    images = user.get("images", [None] * image_count)
    created_at = user.get("created_at", datetime.utcnow())

    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "images": [JSONify_image(image) for image in images],
        "created_at": created_at.isoformat(),
        "touches": user.get("touches", 0),
        "is_admin": user.get("is_admin", False)
    }


def get_week_start_date():
    today = datetime.utcnow()
    start_of_week = today - timedelta(days=today.weekday())
    return start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)


def get_week_index():
    return get_week_start_date().strftime("%Y-%m-%d")


def get_week_expiration_date():
    return get_week_start_date() + timedelta(days=28)


def ensure_weekly_document_shape(weekly_doc):
    updates = {}

    if "images" not in weekly_doc or not isinstance(weekly_doc["images"], list) or len(weekly_doc["images"]) != image_count:
        updates["images"] = [None] * image_count

    if "image_touches" not in weekly_doc or not isinstance(weekly_doc["image_touches"], list) or len(weekly_doc["image_touches"]) != image_count:
        updates["image_touches"] = [0] * image_count

    if "touches_total" not in weekly_doc:
        updates["touches_total"] = 0

    if "created_at" not in weekly_doc:
        updates["created_at"] = datetime.utcnow()

    if "expiration_date" not in weekly_doc:
        updates["expiration_date"] = get_week_expiration_date()

    if updates:
        weekly_collection.update_one(
            {"_id": weekly_doc["_id"]},
            {"$set": updates}
        )
        weekly_doc = weekly_collection.find_one({"_id": weekly_doc["_id"]})

    return weekly_doc


def get_or_create_weekly_document(username):
    week_index = get_week_index()

    weekly_collection.update_one(
        {"username": username, "week_index": week_index},
        {
            "$setOnInsert": {
                "username": username,
                "week_index": week_index,
                "expiration_date": get_week_expiration_date(),
                "images": [None] * image_count,
                "image_touches": [0] * image_count,
                "touches_total": 0,
                "created_at": datetime.utcnow()
            }
        },
        upsert=True
    )

    weekly_doc = weekly_collection.find_one({
        "username": username,
        "week_index": week_index
    })

    return ensure_weekly_document_shape(weekly_doc)


def weekly_image_to_json(image):
    if image is None:
        return None

    return {
        "id": str(image["file_id"]),
        "filename": image["filename"],
        "content_type": image["content_type"],
        "upload_date": image["upload_date"].isoformat(),
        "username": image["username"],
        "image_index": image["image_index"]
    }


def weekly_doc_to_json(weekly_doc):
    if weekly_doc is None:
        return None

    return {
        "id": str(weekly_doc["_id"]),
        "username": weekly_doc["username"],
        "week_index": weekly_doc["week_index"],
        "expiration_date": weekly_doc["expiration_date"].isoformat(),
        "touches_total": weekly_doc.get("touches_total", 0),
        "image_touches": weekly_doc.get("image_touches", [0] * image_count),
        "images": [weekly_image_to_json(image) for image in weekly_doc["images"]]
    }

def is_admin(username):
    user = collection_name.find_one({"username": username})
    if not user:
        return False
    return user.get("is_admin", False)

def save_profile_image_from_weekly(user, profile_index, weekly_image_info):
    user = ensure_user_image_array(user)

    stored_file = weekly_fs.get(weekly_image_info["file_id"])
    file_bytes = stored_file.read()

    image_id = fs.put(
        file_bytes,
        filename=weekly_image_info["filename"],
        metadata={
            "username": user["username"],
            "image_index": profile_index,
            "content_type": weekly_image_info["content_type"],
            "upload_date": datetime.utcnow()
        }
    )

    new_image_info = {
        "file_id": image_id,
        "filename": weekly_image_info["filename"],
        "content_type": weekly_image_info["content_type"],
        "upload_date": datetime.utcnow()
    }

    old_image_value = user["images"][profile_index]

    collection_name.update_one(
        {"_id": user["_id"]},
        {"$set": {f"images.{profile_index}": new_image_info}}
    )

    if old_image_value is not None and "file_id" in old_image_value:
        try:
            fs.delete(old_image_value["file_id"])
        except Exception:
            pass

    return collection_name.find_one({"_id": user["_id"]})


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password cannot be empty"}), 400

    user = collection_name.find_one({"username": username})
    stored_hash = user.get("password_hash") if user else None

    if not user or not stored_hash or not check_password_hash(stored_hash, password):
        return jsonify({"error": "Invalid username or password"}), 401

    return jsonify({
        "message": "Logged in successfully!",
        "user": JSONify_user(user)
    }), 200


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
        "touches": 0,
        "is_admin": False
    }

    weekly_doc = get_or_create_weekly_document(newUsername)

    try:
        result = collection_name.insert_one(new_user)
    except DuplicateKeyError:
        return jsonify({"error": "Username already exists"}), 409

    created_user = collection_name.find_one({"_id": result.inserted_id})

    return jsonify({
        "message": "Account created successfully",
        "user": JSONify_user(created_user)
    }), 201


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
    if not file_bytes:
        return jsonify({"error": "Empty file uploaded"}), 400

    clean_filename = secure_filename(uploaded_file.filename)

    weekly_doc = get_or_create_weekly_document(username)
    old_weekly_image = weekly_doc["images"][image_index]
    old_slot_touches = weekly_doc["image_touches"][image_index]

    weekly_image_id = weekly_fs.put(
        file_bytes,
        filename=clean_filename,
        metadata={
            "username": username,
            "week_index": weekly_doc["week_index"],
            "image_index": image_index,
            "content_type": uploaded_file.content_type,
            "upload_date": datetime.utcnow()
        }
    )

    new_weekly_image_info = {
        "file_id": weekly_image_id,
        "filename": clean_filename,
        "content_type": uploaded_file.content_type,
        "upload_date": datetime.utcnow(),
        "username": username,
        "image_index": image_index
    }

    new_touches_total = weekly_doc.get("touches_total", 0) - old_slot_touches
    if new_touches_total < 0:
        new_touches_total = 0

    weekly_collection.update_one(
        {"_id": weekly_doc["_id"]},
        {
            "$set": {
                f"images.{image_index}": new_weekly_image_info,
                f"image_touches.{image_index}": 0,
                "touches_total": new_touches_total
            }
        }
    )

    if old_weekly_image is not None and "file_id" in old_weekly_image:
        try:
            weekly_fs.delete(old_weekly_image["file_id"])
        except Exception:
            pass

    updated_weekly_doc = weekly_collection.find_one({"_id": weekly_doc["_id"]})

    return jsonify({
        "message": f"Weekly image submitted successfully in slot {image_index}",
        "weekly_submission": weekly_doc_to_json(updated_weekly_doc)
    }), 200


@app.route("/getWeeklySubmission", methods=["GET"])
def getWeeklySubmission():
    username = request.args.get("username", "").strip()
    week_index = request.args.get("week_index", "").strip()

    if not username:
        return jsonify({"error": "Username is required"}), 400

    if week_index == "":
        week_index = get_week_index()

    weekly_doc = weekly_collection.find_one({
        "username": username,
        "week_index": week_index
    })

    if not weekly_doc:
        return jsonify({"error": "Weekly submission not found"}), 404

    weekly_doc = ensure_weekly_document_shape(weekly_doc)

    return jsonify({
        "weekly_submission": weekly_doc_to_json(weekly_doc)
    }), 200


@app.route("/saveWeeklyImageToProfile/<username>/<int:weekly_index>/<int:profile_index>", methods=["POST"])
def saveWeeklyImageToProfile(username, weekly_index, profile_index):
    if weekly_index < 0 or weekly_index >= image_count:
        return jsonify({"error": "Invalid weekly image index"}), 400

    if profile_index < 0 or profile_index >= image_count:
        return jsonify({"error": "Invalid profile image index"}), 400

    user = collection_name.find_one({"username": username})
    if not user:
        return jsonify({"error": "User not found"}), 404

    week_index = request.args.get("week_index", "").strip()
    if week_index == "":
        week_index = get_week_index()

    weekly_doc = weekly_collection.find_one({
        "username": username,
        "week_index": week_index
    })

    if not weekly_doc:
        return jsonify({"error": "Weekly submission not found"}), 404

    weekly_doc = ensure_weekly_document_shape(weekly_doc)
    weekly_image_info = weekly_doc["images"][weekly_index]

    if weekly_image_info is None:
        return jsonify({"error": "No weekly image in that slot"}), 404

    updated_user = save_profile_image_from_weekly(user, profile_index, weekly_image_info)

    return jsonify({
        "message": f"Weekly image {weekly_index} saved to profile slot {profile_index}",
        "user": JSONify_user(updated_user)
    }), 200


@app.route("/weeklyImage/<file_id>", methods=["GET"])
def getWeeklyImage(file_id):
    try:
        object_id = ObjectId(file_id)
    except Exception:
        return jsonify({"error": "Invalid file id"}), 400

    try:
        stored_file = weekly_fs.get(object_id)
    except Exception:
        return jsonify({"error": "File not found"}), 404

    content_type = stored_file.metadata.get("content_type", "application/octet-stream")
    return Response(stored_file.read(), mimetype=content_type)


@app.route("/profileImage/<file_id>", methods=["GET"])
def getProfileImage(file_id):
    try:
        object_id = ObjectId(file_id)
    except Exception:
        return jsonify({"error": "Invalid file id"}), 400

    try:
        stored_file = fs.get(object_id)
    except Exception:
        return jsonify({"error": "File not found"}), 404

    content_type = stored_file.metadata.get("content_type", "application/octet-stream")
    return Response(stored_file.read(), mimetype=content_type)


@app.route("/getTopTen", methods=["GET"])
def getTopTen():
    leaderboard = weekly_collection.find().sort({"touches_total": -1}).limit(15);

    return jsonify({
        "leaderboard": [weekly_doc_to_json(doc) for doc in leaderboard]
    }), 200

@app.route("/getLeaderPics", methods=["GET"])
def getLeaderPics():
    leaderboard = weekly_collection.find().sort({"touches_total": -1}).limit(3);

    return jsonify({
        "leaderboard": [weekly_doc_to_json(doc) for doc in leaderboard]
    }), 200

@app.route("/getTouches", methods=["GET"])
def getTouches():
    username = request.args.get("username")
    user = collection_name.find_one({"username": username})

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"touches": user.get("touches", 0)}), 200

@app.route("/getVotingPair/<int:image_index>/<string:username>", methods=["GET"])
def getVotingPair(image_index, username):
    print("image_index received:", image_index)
    print("image_count:", image_count)
    if image_index < 0 or image_index >= image_count:
        return jsonify({"error": "Invalid image index"}), 400
    
    week_index = get_week_index()
    print("Looking for week_index:", week_index)

    all_docs = list(weekly_collection.find({"week_index": week_index}))

    candidates = [
        doc for doc in all_docs
        if len(doc.get("images", [])) > image_index
        and doc["images"][image_index] is not None and doc["username"] != username
    ]

    print("candidates found:", len(candidates))

    if len(candidates) < 2:
        return jsonify({"error": "Not enough submissions to vote"}), 400    
    
    if len(candidates) < 2:
        return jsonify({"error": "Not enough submissions to vote"}), 400
    
    pair = random.sample(candidates, 2)

    return jsonify({
        "image_index": image_index,
        "candidate_a": weekly_doc_to_json(pair[0]),
        "candidate_b": weekly_doc_to_json(pair[1])
    }), 200

@app.route("/submitVote/<int:image_index>", methods=["POST"])
def submitVote(image_index):
    if image_index < 0 or image_index >= image_count:
        return jsonify({"error": "Invalid image index"}), 400

    data = request.get_json(silent=True) or {}
    winner_username = data.get("winner_username", "").strip()

    if not winner_username:
        return jsonify({"error": "winner_username is required"}), 400

    week_index = get_week_index()

    doc = weekly_collection.find_one({
    "username": winner_username,
    "week_index": week_index,
    })

    result = weekly_collection.update_one(
        {
            "username": winner_username,
            "week_index": week_index
        },
        {
            "$inc": {
                f"image_touches.{image_index}": 1,
                "touches_total": 1
            }
        }
    )

    if result.matched_count == 0:
        return jsonify({"error": "Submission not found or image slot is empty"}), 404

    return jsonify({"message": "Vote recorded"}), 200


@app.route("/submitVoteAllTime/<int:image_index>", methods=["POST"])
def submitVoteAllTime(image_index):
    if image_index < 0 or image_index >= image_count:
        return jsonify({"error": "Invalid image index"}), 400

    data = request.get_json(silent=True) or {}
    winner_username = data.get("winner_username", "").strip()

    if not winner_username:
        return jsonify({"error": "winner_username is required"}), 400


    doc = collection_name.find_one({
    "username": winner_username,
    })

    result = collection_name.update_one(
        {
            "username": winner_username
        },
        {
            "$inc": {
                "touches": 1
            }
        }
    )

    if result.matched_count == 0:
        return jsonify({"error": "Submission not found or image slot is empty"}), 404

    return jsonify({"message": "Vote recorded"}), 200



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
                "file_id": str(img["file_id"]),"filename": img["filename"],"content_type": img["content_type"],"image_index": img["image_index"]
            })
    return jsonify({"pictures" : image})

@app.route("/uploadImageUserInfo/<username>/<int:image_index>", methods=["POST"])
def uploadImageUserInfo(username, image_index):
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
        "upload_date": datetime.utcnow(),
        "image_index": image_index
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


@app.route("/admin/setAdmin", methods=["POST"])
def setAdmin():
    """Set or revoke admin privileges for a user (admin-only)"""
    data = request.get_json(silent=True) or {}
    admin_username = data.get("admin_username", "").strip()
    target_username = data.get("target_username", "").strip()
    make_admin = data.get("make_admin", False)

    if not admin_username or not target_username:
        return jsonify({"error": "Both admin_username and target_username are required"}), 400

    # Check if requesting user is admin
    if not is_admin(admin_username):
        return jsonify({"error": "Unauthorized: Admin privileges required"}), 403

    # Find target user
    target_user = collection_name.find_one({"username": target_username})
    if not target_user:
        return jsonify({"error": "Target user not found"}), 404

    # Update admin status
    collection_name.update_one(
        {"username": target_username},
        {"$set": {"is_admin": make_admin}}
    )

    action = "granted" if make_admin else "revoked"
    return jsonify({
        "message": f"Admin privileges {action} for user {target_username}",
        "user": JSONify_user(collection_name.find_one({"username": target_username}))
    }), 200


@app.route("/admin/deleteUser", methods=["DELETE"])
def deleteUser():
    """Delete a user account and all associated data (admin-only)"""
    data = request.get_json(silent=True) or {}
    admin_username = data.get("admin_username", "").strip()
    target_username = data.get("target_username", "").strip()

    if not admin_username or not target_username:
        return jsonify({"error": "Both admin_username and target_username are required"}), 400

    # Check if requesting user is admin
    if not is_admin(admin_username):
        return jsonify({"error": "Unauthorized: Admin privileges required"}), 403

    # Prevent admins from deleting themselves
    if admin_username == target_username:
        return jsonify({"error": "Cannot delete your own admin account"}), 400

    # Find target user
    target_user = collection_name.find_one({"username": target_username})
    if not target_user:
        return jsonify({"error": "Target user not found"}), 404

    try:
        # Delete all profile images from GridFS
        for image in target_user.get("images", []):
            if image is not None and "file_id" in image:
                try:
                    fs.delete(image["file_id"])
                except Exception:
                    pass

        # Delete all weekly submission images from GridFS
        weekly_docs = weekly_collection.find({"username": target_username})
        for weekly_doc in weekly_docs:
            for image in weekly_doc.get("images", []):
                if image is not None and "file_id" in image:
                    try:
                        weekly_fs.delete(image["file_id"])
                    except Exception:
                        pass

        # Delete all weekly submission documents
        weekly_collection.delete_many({"username": target_username})

        # Delete the user account
        result = collection_name.delete_one({"username": target_username})

        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete user"}), 500

        return jsonify({
            "message": f"User {target_username} and all associated data deleted successfully"
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error deleting user: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)