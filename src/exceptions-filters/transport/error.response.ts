export class ErrorResponse {
  statusCode!: number;
  timestamp!: string;
  path!: string;
  message: string | undefined;
}
