from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
CONNECTION_STRING = "mongodb+srv://TreeHugger:admin@touchgrassmain.lzxzeib.mongodb.net/?appName=TouchGrassMain"
client = MongoClient(CONNECTION_STRING)
database = client['User_info']
collection_name = database['login']
#print("Connection successful")

app = Flask(__name__)
CORS(app)

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
    
    collection_name.insert_one({"username": newUsername, "password": newPassword})

    return jsonify({"message": "Account created successfully"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
