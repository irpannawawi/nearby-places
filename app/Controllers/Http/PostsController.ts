import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Wilayah from 'App/Models/Wilayah'
import Tempat from 'App/Models/Tempat'
import getDistance from 'geolib/es/getDistance';
import isPointWithinRadius from 'geolib/es/isPointWithinRadius';

const axios = require('axios').default;
export default class PostsController {
	public async index({ request, response }: HttpContextContract) {
		// parsing query parameters
		const req = request.qs()
		const cur_lat = req.latitude
		const cur_lng = req.longitude
		const kategori = req.kategori
		const lokasi_user = { latitude: cur_lat, longitude: cur_lng}
		let data_kecamatan = {}
		let kota = []
		
		// cari data kabupaten / kota terdekat dari user
		try{
			data_kecamatan = await axios.get('https://data.jabarprov.go.id/api-backend/bigdata/diskominfo/od_kode_wilayah_dan_nama_wilayah_kota_kabupaten')
			kota = data_kecamatan.data.data
			const lokasi_kota = {}

			for ( let i = 0; i < kota.length; i++ ){

				// error handler wilayah belum tercatat 
				if(kota[i].latitude == null){
					kota.splice(i,1)
				}else{
					lokasi_kota.latitude = kota[i].latitude
					lokasi_kota.longitude = kota[i].longitude

					const distance = getDistance(lokasi_user, lokasi_kota, 1)

					kota[i].distance = distance
				}
			}
			kota.sort((a, b) => {
				return a.distance - b.distance 
			} )
		}
		catch(error){
			console.log(error)
		}

		// cari tempat di 
		// const listLokasi = await Database.rawQuery("SELECT tempat.*, wilayah.kemendagri_kota_kode FROM tempat INNER JOIN wilayah ON tempat.id_wilayah=wilayah.id_wilayah WHERE wilayah.kemendagri_kota_kode="+kode_kota)

		// // wilayah 
		// const dataWilayah = await Wilayah.query()
		// 								.where('kemendagri_kota_kode', kota[0].kemendagri_kota_kode) // kota 1
		// 								.orWhere('kemendagri_kota_kode', kota[1].kemendagri_kota_kode) // kota 2
		// 								.orWhere('kemendagri_kota_kode', kota[2].kemendagri_kota_kode) // kota 3
		// 								.has('tempat')
		// 								.preload('tempat')

		// kecamatan terdekat 
		const listKecamatan_kota1 = await axios.get(`https://data.jabarprov.go.id/api-backend/bigdata/diskominfo/od_16357_kode_wilayah_dan_nama_wilayah_kecamatan?where={ "kemendagri_kota_kode": ${kota[0].kemendagri_kota_kode}}`)
		const listKecamatan_kota2 = await axios.get(`https://data.jabarprov.go.id/api-backend/bigdata/diskominfo/od_16357_kode_wilayah_dan_nama_wilayah_kecamatan?where={ "kemendagri_kota_kode": ${kota[1].kemendagri_kota_kode}}`)
		const dataKecamatan = [...listKecamatan_kota1.data.data, ...listKecamatan_kota2.data.data]
		const lokasi_kecamatan = {}
		for (let i = 0; i < dataKecamatan.length; i++){
			if(dataKecamatan[i].latitude == null ){
				dataKecamatan.splice(i, 1)
			}else{
				lokasi_kecamatan.latitude = dataKecamatan[i].latitude
				lokasi_kecamatan.longitude = dataKecamatan[i].longitude

				const distance = getDistance(lokasi_user, lokasi_kecamatan, 1)

				dataKecamatan[i].distance = distance / 1000
			}
		}

		dataKecamatan.sort((a,b)=>{
			return a.distance - b.distance
		})

		// cari lokasi dalam radius 5KM

		const kec = await Wilayah.query()
									// .where('id_kategori', kategori?kategori??``)
									.where('kemendagri_kecamatan_kode', dataKecamatan[0].kemendagri_kecamatan_kode)
									.preload('tempat')
									.has('tempat')
		const kec2 = await Wilayah.query()
									.where('kemendagri_kecamatan_kode', dataKecamatan[1].kemendagri_kecamatan_kode)
									.preload('tempat')
									.has('tempat')
		let listKec = [...kec, ...kec2]

		let tempatTerdekat = []

		for (let i = 0; i < listKec.length; i++){
			for (let p = 0; p < listKec[i].tempat.length; p++){
				const tempat = listKec[i].tempat[p]
				const kecamatan = listKec[i]
				let lokasi_tempat = { 
					latitude: tempat.tempat_latitude, 
					longitude: tempat.tempat_longitude
				}
				let inRadius = getDistance(lokasi_tempat, lokasi_user)
				console.log(`${tempat.nama_tempat} berjarak ${getDistance(lokasi_user, lokasi_tempat) / 1000} Km`)
				if(inRadius <= 5000){
					tempatTerdekat.push({
						id: tempat.id_tempat,
					    name: tempat.nama_tempat,
					    category_id: tempat.id_kategori,
					    city_name: kecamatan.kemendagri_kota_nama,
					    district_name: kecamatan.kemendagri_kecamatan_nama,
					    latitude: tempat.tempat_latitude,
					    longitude: tempat.tempat_longitude
					})
				}
			}
		}
		
		if(kategori != undefined && kategori != null && kategori != ''){
			tempatTerdekat = tempatTerdekat.filter(el => el.category_id == kategori )
		}
		response.send({data: tempatTerdekat, kat: `${kategori}`, total: tempatTerdekat.length })
	}
	public async addTempat({request, response}: HttpContextContract) {
		const data = request.body()
		
		const insertid = await Tempat.create(data)
		return response.send({data: insertid})
	}

}
