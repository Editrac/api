import { UserDocument } from "../../src/modules/organisation/models/user-model";

declare global {
  namespace Express {
    interface Request {
      user: UserDocument
    }
  }
}

