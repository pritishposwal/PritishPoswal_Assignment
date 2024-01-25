from faker import Faker
import mysql.connector
from datetime import datetime, timedelta
import random

# Initialize Faker instance for India
fake = Faker(locale="en_IN")

# Database connection parameters
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",  # replace with your MySQL root password
    database="leaderboard"
)
cursor = db.cursor()

# Function to generate a random timestamp within the last 3 weeks
def generate_timestamps():
    base = datetime.today()
    three_weeks_ago = base - timedelta(weeks=3)
    random_date = three_weeks_ago + timedelta(
        seconds=random.randint(0, int((base - three_weeks_ago).total_seconds())))
    return random_date

# Generate and insert data
insert_stmt = (
    "INSERT INTO users (UID, Name, Score, Country, TimeStamp) "
    "VALUES (%s, %s, %s, %s, %s)"
)

for _ in range(100000):  # Number of records to generate
    data = (
        fake.uuid4(),  # UID
        fake.name(),  # Name
        random.randint(0, 1000000),  # Score
        fake.country_code(representation="alpha-2"),  # Country ISO Code
        generate_timestamps()  # Timestamps for the last 3 weeks
    )
    cursor.execute(insert_stmt, data)

# Commit the changes to the database
db.commit()

# Close the connection
cursor.close()
db.close()
