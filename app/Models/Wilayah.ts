import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Tempat from 'App/Models/Tempat'
export default class Wilayah extends BaseModel {
  public static table = 'wilayah'
  
  @column({ isPrimary: true })
  public id_wilayah: number  
  
  @column()
  public kemendagri_provinsi_kode: string  
  
  @column()
  public kemendagri_kota_kode: string  
  
  @column()
  public kemendagri_kecamatan_kode: string  
  
  @column()
  public kemendagri_kelurahan_kode: string  
  
  @column()
  public kemendagri_provinsi_nama: string  
  
  @column()
  public kemendagri_kota_nama: string  
  
  @column()
  public kemendagri_kecamatan_nama: string  
  
  @column()
  public kemendagri_kelurahan_nama: string  
  
  @column()
  public latitude: string  
  
  @column()
  public longitude: string  
  
  @column()
  public kode_pos: string  

  @hasMany(() => Tempat, {
    foreignKey: 'id_wilayah',localKey: 'id_wilayah'
  })
  public tempat: HasMany<typeof Tempat>
}
