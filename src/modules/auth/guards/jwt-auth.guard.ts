import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthUser } from "../../../common/interfaces/index";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = AuthUser>(
    err: Error | null,
    user: TUser | false,
    info: Error | undefined,
  ): TUser {
    if (err) {
      console.log("❌ JWT GUARD - Error occurred:", err.message);
      throw err;
    }

    if (info) {
      console.log("❌ JWT GUARD - Info/Error:", info);
      if (info.message === "No auth token") {
        throw new UnauthorizedException("No authorization token provided");
      }
      if (info.message === "jwt malformed") {
        throw new UnauthorizedException("Invalid token format");
      }
      if (info.message === "jwt expired") {
        throw new UnauthorizedException("Token has expired");
      }
      throw new UnauthorizedException(info.message || "Authentication failed");
    }

    if (!user) {
      console.log("❌ JWT GUARD - No user returned from strategy");
      throw new UnauthorizedException("Invalid token");
    }

    return user;
  }
}
