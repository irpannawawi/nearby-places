import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Kategori extends BaseModel {
  public static table = 'kategori'
  @column({ isPrimary: true })
  public id_kategori: number

  @column()
  public nama_kategori: string
  
}
