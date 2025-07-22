import type { Admin } from "../models/admin.model"
import type { Server } from "socket.io"

declare global {
  namespace Express {
    interface Request {
      admin?: typeof Admin
      io: Server
      startTime: number
    }
  }
}
