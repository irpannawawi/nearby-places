import mysql.connector as mysql
import requests 
import random

hostname = 'localhost'
username = 'root'
password = ''
db = 'nearby_app'
db = mysql.connect(host=hostname, user=username, passwd=password, database=db)

# insert kategori
list_kategori = [
	(1, "Kantor Pemerintah Kabupaten/Kota"),
	(2, "Rumah Sakit"),
	(3, "Sekolah Menengah Atas"),
	(4, "Puskesmas"),
	(5, "Sekolah Menengah Pertama"),
	(6, "Kantor Pemerintah Kecamatan"),
	(7, "Sekolah Dasar"),
	(8, "Tempat Ibadah"),
	(9, "Kantor Pemerintah Kelurahan / Desa")
]

print('Starting...')
print('Generating kategori ..... ')
curkategori = db.cursor(buffered=True)
curkategori.executemany("INSERT INTO kategori(id_kategori, nama_kategori) VALUES(%s, %s)", list_kategori)
print('Generating kategori ..... OK ')

#fetch data kota / kabupaten 
endpoint_kota = 'https://data.jabarprov.go.id/api-backend/bigdata/diskominfo/od_kode_wilayah_dan_nama_wilayah_kota_kabupaten'
reqKota = requests.get(endpoint_kota)
dataKota = reqKota.json()['data']

def insertmany(data):
	sql = "INSERT INTO tempat(id_wilayah, id_kategori, level, nama_tempat, tempat_latitude, tempat_longitude) VALUES(%s, %s, %s, %s, %s, %s)"
	cur = db.cursor()
	cur.executemany(sql, data)
	db.commit()
	return cur.rowcount

def insert(data):
	sql = "INSERT INTO tempat(id_wilayah, id_kategori, level, nama_tempat, tempat_latitude, tempat_longitude) VALUES(%s, %s, %s, %s, %s, %s)"
	cur = db.cursor()
	cur.execute(sql, data)
	db.commit()
	return cur.rowcount

def get_id_wilayah(nama_kota):
	sql = "SELECT id_wilayah FROM wilayah WHERE kemendagri_kota_nama=%s"
	cur = db.cursor(buffered=True)
	cur.execute(sql, (nama_kota,))
	wilayah = cur.fetchone()
	return wilayah[0]

def get_id_wilayah_kecamatan(nama_kecamatan):
	sql = "SELECT id_wilayah FROM wilayah WHERE kemendagri_kecamatan_nama=%s"
	cur = db.cursor(buffered=True)
	cur.execute(sql, (nama_kecamatan,))
	wilayah = cur.fetchone()
	return wilayah[0]

def get_id_wilayah_desa(kode):
	sql = "SELECT id_wilayah FROM wilayah WHERE kemendagri_kelurahan_kode=%s"
	cur = db.cursor(buffered=True)
	cur.execute(sql, (kode,))
	wilayah = cur.fetchone()
	return wilayah[0]

def get_rand_coord(coord):
	if(random.randint(0,1) == 0 ):
		return round(float(coord)+random.uniform(0,0.4), 6)
	else:
		return round(float(coord)-random.uniform(0,0.4), 6)
		
def get_rand_coord_kec(coord):
	if(random.randint(0,1) == 0 ):
		return round(float(coord)+random.uniform(0.008,0.05), 6)
	else:
		return round(float(coord)-random.uniform(0.008,0.05), 6)
		
def get_rand_coord_desa(coord):
	if(random.randint(0,1) == 0 ):
		return round(float(coord)+random.uniform(0.005,0.009), 6)
	else:
		return round(float(coord)-random.uniform(0.005,0.009), 6)

print('Generating places kota .....  ')
data_kota = []
for kota in dataKota:
	# insert 1 Kantor Pemerintah Kabupaten/Kota
	if kota['kemendagri_kota_nama'] != "KOTA/KAB BELUM TERIDENTIFIKASI" :
		id_wilayah = get_id_wilayah(kota['kemendagri_kota_nama'])
		id_kategori = 1
		level = 'Kabupaten/Kota'
		nama_tempat = 'Kantor Pemerintahan KOTA/KAB' + kota['kemendagri_kota_nama']
		latitude = str(kota['latitude'])
		longitude = str(kota['longitude'])
		# tampung data kantor walikota
		data_kota.append((id_wilayah, id_kategori, level, nama_tempat, latitude, longitude))
		# tampung rumahsakit
		urutRumahsakit = 1
		while urutRumahsakit <= 3:
			nama_rumahsakit = "Rumah Sakit "+kota['kemendagri_kota_nama']+" "+str(urutRumahsakit)
			data_rumah_sakit = (id_wilayah, 2, level, nama_rumahsakit, get_rand_coord(latitude), get_rand_coord(longitude))
			data_kota.append(data_rumah_sakit)
			urutRumahsakit += 1
		urutSMA = 1
		while urutSMA <= 20:
			nama_sma = "SMA "+kota['kemendagri_kota_nama']+" "+str(urutSMA)
			data_sma = (id_wilayah, 3, level, nama_sma, get_rand_coord(latitude), get_rand_coord(longitude))
			data_kota.append(data_sma)
			urutSMA+=1
insertmany(data_kota)
print('Generating places kota .....  OK')

print('Generating places Kecamatan .....  ')
# ======== places di kecamatan =======
#fetch data Kecamatan
endpoint_kecamatan = 'https://data.jabarprov.go.id/api-backend/bigdata/diskominfo/od_16357_kode_wilayah_dan_nama_wilayah_kecamatan?limit=9999'
reqKec = requests.get(endpoint_kecamatan)
dataKec = reqKec.json()['data']
for kec in dataKec:
	if kec['kemendagri_kecamatan_nama'] != "KECAMATAN BELUM TERIDENTIFIKASI" :
		nama_kecamatan = kec['kemendagri_kecamatan_nama']
		latitude = kec['latitude']
		longitude = kec['longitude']
		id_wilayah = get_id_wilayah_kecamatan(kec['kemendagri_kecamatan_nama'])
		level = "Kecamatan"
		nama_kantor_kecamatan = "Kantor Pemerintahan Kecamatan "+nama_kecamatan
		insert((id_wilayah, 6, level, nama_kantor_kecamatan, latitude, longitude))

		# add data 5 puskesmas
		urutPuskes = 1
		while urutPuskes <= 5:
			nama_puskes = "Puskesmas "+nama_kecamatan+" "+str(urutPuskes)
			data_puskes = (id_wilayah, 4, level, nama_puskes, get_rand_coord_kec(latitude), get_rand_coord_kec(longitude))
			urutPuskes+=1
			insert(data_puskes)

		# add data 3 SMP
		urutSMP = 1
		while urutSMP <= 3:
			nama_smp = "SMP "+nama_kecamatan+str(urutSMP)
			data_smp = (id_wilayah, 5, level, nama_smp, get_rand_coord_kec(latitude), get_rand_coord_kec(longitude))
			urutSMP+=1
			insert(data_smp)
print('Generating places Kecamatan .....  OK')

print('Generating places Desa .....  ')
# ======== places di desa =======
#fetch data Desa 

endpoint_desa 	= 'https://data.jabarprov.go.id/api-backend/bigdata/diskominfo/od_kode_wilayah_dan_nama_wilayah_desa_kelurahan?limit=99999'
reqDesa 		= requests.get(endpoint_desa)
dataDesa 		= reqDesa.json()['data']
len_desa = len(dataDesa)
urut = 1
for desa in dataDesa:
	
	if(desa['kemendagri_kelurahan_nama'] != 'KELURAHAN BELUM TERIDENTIFIKASI' and desa['latitude'] != None ):
		print('inserting data desa '+str(urut)+'/'+str(len_desa))
		urut+=1
		nama_desa 			= desa['kemendagri_kelurahan_nama']
		id_wilayah 			= get_id_wilayah_desa(desa['kemendagri_kelurahan_kode'])
		level 				= 'Kelurahan / Desa'
		nama_kantor_desa 	= "Kantor Pemerintahan "+nama_desa
		latitude 			= desa['latitude']
		longitude 			= desa['longitude']
		insert((id_wilayah, 9, level, nama_kantor_desa, latitude, longitude))

		# add 5 SD
		urutSD = 1
		while urutSD <= 5:
			nama_sd = 'SD '+nama_desa+' '+str(urutSD)
			data_sd = (id_wilayah, 7, level, nama_sd, get_rand_coord_desa(latitude), get_rand_coord_desa(longitude))
			urutSD+=1
			insert(data_sd)

		# Add 20 Tempat ibadah
		urutTI = 1
		while urutTI <= 20:
			nama_tempat_ibadah = 'Tempat Ibadah '+nama_desa+' '+str(urutTI)
			data_tempat_ibadah = (id_wilayah, 8, level, nama_tempat_ibadah, get_rand_coord_desa(latitude), get_rand_coord_desa(longitude))
			urutTI+=1
			insert(data_tempat_ibadah)
print('Generating places Desa .....  OK')
print(len(dataDesa))
