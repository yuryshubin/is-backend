import mongoose, {Connection} from 'mongoose';

let connection: Connection | undefined;

export class ISMongoDB {
   private static readonly connectionString =
      'mongodb+srv://crusher83:Hello123@cluster0.6oywu.mongodb.net/intellistyle?retryWrites=true&w=majority';

   static async connect(): Promise<Connection> {
      if (!connection) {
         await mongoose.connect(this.connectionString);
         connection = mongoose.connection;
      }
      return connection;
   }
}
