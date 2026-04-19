import sqlite3

conn = sqlite3.connect('backend/astraconvoy.db')
c = conn.cursor()

# Create tactical_messages table if missing
c.execute('''CREATE TABLE IF NOT EXISTS tactical_messages
             (id INTEGER PRIMARY KEY AUTOINCREMENT,
              convoy_id TEXT NOT NULL,
              sender TEXT NOT NULL,
              content TEXT NOT NULL,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')

conn.commit()

# Show all tables
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in c.fetchall()]
print("Tables in DB:", tables)

# Check messages
c.execute("SELECT COUNT(*) FROM tactical_messages")
print("Message count:", c.fetchone()[0])

# Check convoys
c.execute("SELECT id, convoy_name FROM convoys")
rows = c.fetchall()
print("Convoys:", rows)

conn.close()
print("DB fixed and ready!")
