
import { BaseModel, column, belongsTo, BelongsTo} from '@ioc:Adonis/Lucid/Orm'
import Wilayah from 'App/Models/Wilayah'

export default class Tempat extends BaseModel {
  public static table = 'tempat'

  @column({ isPrimary: true })
  public id_tempat: number

  @column()
  public id_wilayah: string

  @column()
  public id_kategori: string

  @column()
  public nama_tempat: string

  @column()
  public tempat_latitude: string
  
  @column()
  public tempat_longitude: string

  @belongsTo(() => Wilayah, {
    foreignKey: 'id_wilayah',
    localKey: 'id_wilayah'
  })
  public wilayah: BelongsTo<typeof Wilayah>
}
