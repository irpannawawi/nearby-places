import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Kategoris extends BaseSchema {
  protected tableName = 'kategori'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_kategori')
      table.string('nama_kategori', 155)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
