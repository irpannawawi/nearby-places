import mysql.connector as mysql

hostname = 'localhost'
username = 'root'
password = ''
db = 'nearby_app'
db = mysql.connect(host=hostname, user=username, passwd=password, database=db)

#  "TRUNCATE ` kategori `"
print('Drop all data .....  ')

l = db.cursor(buffered=True).execute("SET FOREIGN_KEY_CHECKS = 0");
m = db.cursor(buffered=True).execute("TRUNCATE TABLE kategori");
m = db.cursor(buffered=True).execute("TRUNCATE TABLE tempat");
n = db.cursor(buffered=True).execute("SET FOREIGN_KEY_CHECKS = 1");
db.close()
print('Drop all data .....  OK')
