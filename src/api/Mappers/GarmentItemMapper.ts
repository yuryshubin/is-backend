import {ISGarmentItem} from '../../INFRA/ISGarmentItem';
import {GarmentItem} from '../model/garmentItem';

export class ISGarmentItemMapper {
   static convertTo(items: ISGarmentItem[]): GarmentItem[] {
      return items.map((item) => {
         return {
            id: item._id,
            productID: item.product_id,
            url: item.url,
            gender: item.gender,
            description: item.product_description,
            image_urls: item.image_urls,
            title: item.product_title,
            brand: item.brand,
            price: item.price,
            currency: item.currency_code,
            stock: item.stock,
         };
      });
   }
}
