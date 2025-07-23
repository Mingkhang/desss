import { Server } from 'socket.io';
import { IAdmin } from '../../models/admin.model';

declare global {
  namespace Express {
    interface Request {
      io: Server;
      admin?: IAdmin;
    }
  }
}