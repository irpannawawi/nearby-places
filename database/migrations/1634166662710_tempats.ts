import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tempats extends BaseSchema {
  protected tableName = 'tempat'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_tempat')
      table.integer('id_wilayah').unsigned()  
      table.integer('id_kategori').unsigned()  
      table.string('level', 155)  
      table.string('nama_tempat', 155)  
      table.string('tempat_latitude', 155)  
      table.string('tempat_longitude', 155)  
      table.foreign('id_wilayah').references('wilayah.id_wilayah')
      table.foreign('id_kategori').references('kategori.id_kategori')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
