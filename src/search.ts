import {APIGatewayProxyEvent} from 'aws-lambda';
import {GarmentItemsManager} from './INFRA/GarmentItemsManager';
import {ErrorKind, ISError} from './INFRA/ISError';
import {onErrorResponse, onSuccessResponse} from './INFRA/ResponseUtils';
import {ISGarmentItemMapper} from './api/Mappers/GarmentItemMapper';
import {SearchResponse} from './api/model/searchResponse';

const validateParameters = async (
   event: APIGatewayProxyEvent
): Promise<{criteria: string; page?: number; limit?: number}> => {
   console.info(`event: `, event);
   if (!event.queryStringParameters) throw new ISError('No parameters', ErrorKind.invalidParameter);

   const criteria = event.queryStringParameters['criteria'];
   if (!criteria || criteria.length < 1)
      throw new ISError('Criteria should be greater than 5', ErrorKind.unprocessable);

   const page = parseInt(event.queryStringParameters['page'] || '');
   if (page != undefined && page <= 0) throw new ISError('Page must be greater than 0', ErrorKind.unprocessable);

   const limit = parseInt(event.queryStringParameters['limit'] || '');
   if (limit != undefined && limit <= 0) throw new ISError('Limit must be positive', ErrorKind.unprocessable);

   return {
      criteria,
      page,
      limit,
   };
};

exports.handler = async (event: APIGatewayProxyEvent) => {
   try {
      console.info(event);
      const params = await validateParameters(event);
      console.info(`params: ${params}`);
      const response = await GarmentItemsManager.search(params.criteria, params.page, params.limit);

      const searchResponse: SearchResponse = {
         items: ISGarmentItemMapper.convertTo(response.items),
         currentPage: response.currentPage,
         totalPages: response.totalPages,
      };
      return onSuccessResponse(searchResponse);
   } catch (error) {
      return onErrorResponse(error, event);
   }
};
