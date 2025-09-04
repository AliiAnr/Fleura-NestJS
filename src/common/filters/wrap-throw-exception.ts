import { HttpException, HttpStatus } from "@nestjs/common";
import { ResponseWrapper } from "../wrapper/response.wrapper";

export function wrapAndThrowHttpException(error: any): never {
  const status =
    error instanceof HttpException
      ? error.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

  const message =
    error instanceof HttpException
      ? error.message
      : error?.message || "Internal server error";

  throw new HttpException(new ResponseWrapper(status, message), status);
}
