from pymongo import MongoClient
CONNECTION_STRING = "mongodb+srv://TreeHugger:admin@touchgrassmain.lzxzeib.mongodb.net/?appName=TouchGrassMain"
client = MongoClient(CONNECTION_STRING)
#client.admin.command("ping")
database = client['User_info']
collection_name = database['login']
print("Connection successful")

testDocument = {"username": "micahel", "password": "ber"}
collection_name.insert_one(testDocument)

print("insertion successful")