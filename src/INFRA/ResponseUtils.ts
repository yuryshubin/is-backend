import {APIGatewayProxyEvent} from 'aws-lambda';
import {ISError} from './ISError';

export function onErrorResponse(error: Error | any, event: APIGatewayProxyEvent): {[key: string]: any} {
   console.error(error, event);
   const body = {message: error instanceof Error ? error.message : 'Unknown Error'};

   return {
      statusCode: error instanceof ISError ? error.code : 500,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify(body),
   };
}

export function onSuccessResponse(data: any | undefined): {[key: string]: any} {
   console.info(`${JSON.stringify(data)}`);
   return {
      statusCode: 200,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify(data),
   };
}
