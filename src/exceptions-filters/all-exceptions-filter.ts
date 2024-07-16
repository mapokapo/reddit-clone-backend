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
import { ErrorResponse } from "./transport/error.response";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    if (exception instanceof HttpException) {
      const responseBody: ErrorResponse = {
        statusCode: exception.getStatus(),
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()) as unknown as string,
        message: exception.message,
      };

      if (exception instanceof BadRequestException) {
        const exceptionResponse = exception.getResponse();
        let message: string | undefined;

        if (typeof exceptionResponse === "string") {
          message = exceptionResponse;
        } else if ("message" in exceptionResponse) {
          message = exceptionResponse.message as string;
        }

        responseBody.message = message;
      }

      return httpAdapter.reply(
        ctx.getResponse(),
        responseBody,
        exception.getStatus()
      ) as unknown as undefined;
    } else {
      if (exception instanceof QueryFailedError) {
        if (exception.message.includes("UNIQUE constraint failed")) {
          return httpAdapter.reply(
            ctx.getResponse(),
            {
              statusCode: HttpStatus.BAD_REQUEST,
              timestamp: new Date().toISOString(),
              path: httpAdapter.getRequestUrl(
                ctx.getRequest()
              ) as unknown as string,
              message: "Resource already exists",
            },
            HttpStatus.BAD_REQUEST
          ) as unknown as undefined;
        }
      }

      console.error(exception);

      return httpAdapter.reply(
        ctx.getResponse(),
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
          path: httpAdapter.getRequestUrl(
            ctx.getRequest()
          ) as unknown as string,
          message: "Internal server error",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      ) as unknown as undefined;
    }
  }
}
