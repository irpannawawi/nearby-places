import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Wilayahs extends BaseSchema {
  protected tableName = 'wilayah'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_wilayah').primary(),
      table.string('kemendagri_provinsi_kode', 155)
      table.string('kemendagri_kota_kode', 155)
      table.string('kemendagri_kecamatan_kode', 155)
      table.string('kemendagri_kelurahan_kode', 155)
      table.string('kemendagri_provinsi_nama', 155)
      table.string('kemendagri_kota_nama', 155)
      table.string('kemendagri_kecamatan_nama', 155)
      table.string('kemendagri_kelurahan_nama', 155)
      table.string('latitude', 155)
      table.string('longitude', 155)
      table.string('kode_pos', 155)      
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
