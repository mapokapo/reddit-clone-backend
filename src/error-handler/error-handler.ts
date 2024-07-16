import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { QueryFailedError } from "typeorm";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    if (exception instanceof HttpException) {
      const responseBody = {
        statusCode: exception.getStatus(),
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      };

      if (exception instanceof BadRequestException) {
        responseBody["message"] = exception.getResponse()["message"];
      }

      return httpAdapter.reply(
        ctx.getResponse(),
        responseBody,
        exception.getStatus()
      );
    } else {
      if (exception instanceof QueryFailedError) {
        if (exception.message.includes("UNIQUE constraint failed")) {
          return httpAdapter.reply(
            ctx.getResponse(),
            {
              statusCode: HttpStatus.BAD_REQUEST,
              timestamp: new Date().toISOString(),
              path: httpAdapter.getRequestUrl(ctx.getRequest()),
              message: "Resource already exists",
            },
            HttpStatus.BAD_REQUEST
          );
        }
      }

      console.error(exception);

      return httpAdapter.reply(
        ctx.getResponse(),
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
          path: httpAdapter.getRequestUrl(ctx.getRequest()),
          message: "Internal server error",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
