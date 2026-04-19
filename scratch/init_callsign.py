import sqlite3

conn = sqlite3.connect('backend/astraconvoy.db')
c = conn.cursor()

# Map all existing driver records to the new call sign format
c.execute('UPDATE driver_access SET driver_name = "DEMO-UNIT"')

conn.commit()
conn.close()
print('Call Sign Protocol Initialized: All units mapped to DEMO-UNIT')
