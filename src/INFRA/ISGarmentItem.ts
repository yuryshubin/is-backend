enum Gender {
   men = 'men',
   women = 'women',
   children = 'children',
}

export interface Image {
   url: string;
   path: string;
   checksum: number;
}

enum Currency {
   usd = 'USD',
   euro = 'EURO',
   pounds = 'POUNDS',
}

export interface ISGarmentItem {
   _id: string;
   // product_categories_mapped: string[];
   product_id: number;
   url: string;
   gender: Gender;
   product_description: string;
   image_urls: string[];
   // product_imgs_src: string[];
   // source: string,
   // product_categories: string[];
   // images: Image[];
   // position: string[];
   product_title: string;
   brand: string;
   price: number;
   currency_code: Currency;
   stock: number;
}
