import sqlite3

conn = sqlite3.connect('backend/astraconvoy.db')
c = conn.cursor()

# Clear existing and add fresh links
c.execute('DELETE FROM driver_access')
c.execute('INSERT INTO driver_access (convoy_id, access_code, driver_name) VALUES (4, "DRV-4444", "Demo Driver")')
c.execute('INSERT INTO driver_access (convoy_id, access_code, driver_name) VALUES (5, "DRV-5555", "Demo Driver")')
c.execute('INSERT INTO driver_access (convoy_id, access_code, driver_name) VALUES (6, "DRV-6666", "Demo Driver")')

conn.commit()
conn.close()
print('Linked 3 convoys to Demo Driver')
