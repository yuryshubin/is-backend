export enum ErrorKind {
   unprocessable = 422,
   internal = 500,
   invalidParameter = 400,
}

export class ISError implements Error {
   name: string;
   message: string;
   stack?: string;
   code: number;

   constructor(errorOrMessage: Error | string, kind: ErrorKind) {
      if (errorOrMessage instanceof Error) {
         this.name = errorOrMessage.name;
         this.message = errorOrMessage.message;
         this.stack = errorOrMessage.stack;
      } else {
         this.name = '';
         this.message = errorOrMessage;
      }
      this.code = kind;
   }
}
