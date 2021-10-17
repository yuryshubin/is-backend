import {ISGarmentItem} from './ISGarmentItem';
import mongoose, {Schema} from 'mongoose';
import {PagingResult} from './PagingResult';
import {ErrorKind, ISError} from './ISError';
import {ISMongoDB} from './ISMongoDB';

export class GarmentItemsManager {
   // private static readonly connectionString = 'mongodb+srv://cluster0.6oywu.mongodb.net/intellistyle?authSource=%24external&authMechanism=MONGODB-AWS' +;

   private static readonly defaultLimit = 20;
   private static readonly collectionGarmentItems = 'garment_items';

   private static get schema(): Schema {
      // const ImageSchema = new Schema({
      // 	url: String,
      // 	path: String,
      // 	checksum: Number
      // });

      return new Schema({
         // product_categories_mapped: [String],
         _id: Schema.Types.ObjectId,
         product_id: Number,
         url: String,
         gender: String, //Gender;
         price: Number,
         product_description: String,
         image_urls: [String],
         // product_imgs_src: [String],
         // source: String,
         // product_categories: [String],
         // images: [ImageSchema],
         // position: [String],
         product_title: String,
         brand: String,
         currency_code: String, //Currency,
         stock: Number,
      });
   }

   static async search(criteria: string, page?: number, limit?: number): Promise<PagingResult<ISGarmentItem>> {
      return new Promise<PagingResult<ISGarmentItem>>(async (resolve, reject) => {
         try {
            const connection = await ISMongoDB.connect();
            connection.on('error', (error) => {
               throw new ISError(error, ErrorKind.internal);
            });

            const actualPage = page || 1;
            const actualLimit = limit || this.defaultLimit;

            console.info('get model');
            let model = mongoose.models[this.collectionGarmentItems];
            console.info('the model: ', model);

            if (!model) {
               console.info('register model');
               model = mongoose.model(this.collectionGarmentItems, this.schema);
            } else {
               console.info('model exists');
            }

            const filter = {product_title: {$regex: new RegExp(criteria, 'i')}};
            const skip = (actualPage - 1) * actualLimit;

            const count = await model.countDocuments(filter);
            if (!count) {
               const result: PagingResult<ISGarmentItem> = {
                  items: [],
                  totalPages: Math.ceil(count / actualLimit),
                  currentPage: actualPage,
               };
               resolve(result);
            }

            if (count - skip <= 0) {
               console.info(`count: ${count} skip: ${skip} actualPage: ${actualPage}`);
               throw new ISError('Page out of bounds', ErrorKind.unprocessable);
            }

            const items: ISGarmentItem[] = (await model.find(filter).limit(actualLimit).skip(skip).exec()).map(
               (value) => {
                  value._id = value._id.toString();
                  return value;
               }
            );

            console.info(`skipped: ${(actualPage - 1) * actualLimit} items count: ${items.length} / ${count}`);

            const result: PagingResult<ISGarmentItem> = {
               items,
               totalPages: Math.ceil(count / actualLimit),
               currentPage: actualPage,
            };
            resolve(result);
         } catch (e) {
            reject(e);
         }
      });
   }
}
