/**
 * IntelliStyle Api
 * IntelliStyle Api
 *
 * OpenAPI spec version: 1.0.0
 * Contact: crusher83@gmail.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { GarmentItem } from './garmentItem';

export interface SearchResponse { 
    items: Array<GarmentItem>;
    currentPage: number;
    totalPages: number;
}