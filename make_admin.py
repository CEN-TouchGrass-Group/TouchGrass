#!/usr/bin/env python3
"""
Helper script to grant admin privileges to a user.
Run this script to manually set a user as admin in the database.

Usage: python make_admin.py <username>
"""

import sys
from pymongo import MongoClient

CONNECTION_STRING = "mongodb+srv://TreeHugger:admin@touchgrassmain.lzxzeib.mongodb.net/?appName=TouchGrassMain"

def make_admin(username):
    client = MongoClient(CONNECTION_STRING)
    database = client["User_info"]
    collection_name = database["login"]
    
    user = collection_name.find_one({"username": username})
    
    if not user:
        print(f"❌ Error: User '{username}' not found in database")
        return False
    
    # Update user to be admin
    result = collection_name.update_one(
        {"username": username},
        {"$set": {"is_admin": True}}
    )
    
    if result.modified_count > 0:
        print(f"✅ Success: User '{username}' is now an admin!")
        return True
    else:
        print(f"ℹ️  User '{username}' was already an admin")
        return True

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python make_admin.py <username>")
        sys.exit(1)
    
    username = sys.argv[1]
    success = make_admin(username)
    sys.exit(0 if success else 1)
