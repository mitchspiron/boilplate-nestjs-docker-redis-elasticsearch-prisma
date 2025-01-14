export interface ResponseGlobalInterface<T> {
  data: T;
  message: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  status: string;
}
