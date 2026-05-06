from pymongo import MongoClient
from config import get_settings

settings = get_settings()
client = MongoClient(settings.MONGO_URI)
db = client[settings.DATABASE_NAME]