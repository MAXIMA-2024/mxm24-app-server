import { ZodError } from "zod";
import type { Response } from "express";

export enum Responses {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  FORBIDDEN = 403,
  CONFLICT = 409,
  VALIDATION_ERROR = 422,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Creates a response model object.
 *
 * @template T - The type of the data property.
 * @param {Responses} code - The response code.
 * @param {string} message - The response message.
 * @param {T} [data] - The optional data property.
 * @returns {object} - The response model object.
 */
const responseModel = <T>(code: Responses, message: string, data?: T) => {
  return {
    code,
    message,
    data,
  };
};

/**
 * Sends a success response with optional data.
 *
 * @template T - The type of the data to be included in the response.
 * @param {Response} res - The Express response object.
 * @param {string} message - The success message to be included in the response.
 * @param {T} [data] - The optional data to be included in the response.
 * @returns {Response} - The Express response object.
 */
export const success = <T>(res: Response, message: string, data?: T) => {
  return res
    .status(Responses.SUCCESS)
    .json(responseModel<T>(Responses.SUCCESS, message, data));
};

/**
 * Sends a '201 Created' response with the provided message and optional data.
 * @template T - The type of the optional data.
 * @param res - The response object.
 * @param message - The message to be included in the response.
 * @param data - Optional data to be included in the response.
 * @returns The response object with the '201 Created' status and JSON body.
 */
export const created = <T>(res: Response, message: string, data?: T) => {
  return res
    .status(Responses.CREATED)
    .json(responseModel<T>(Responses.CREATED, message, data));
};

/**
 * Sends a bad request response with the specified message.
 * @param res - The response object.
 * @param message - The error message to be sent.
 * @returns The response object with the bad request status and error message.
 */
export const badRequest = (res: Response, message: string) => {
  return res
    .status(Responses.BAD_REQUEST)
    .json(responseModel(Responses.BAD_REQUEST, message));
};

/**
 * Sends an unauthorized response with the specified message.
 * @param res - The response object.
 * @param message - The error message to send.
 * @returns The response object with the unauthorized status code and error message.
 */
export const unauthorized = (res: Response, message: string) => {
  return res
    .status(Responses.UNAUTHORIZED)
    .json(responseModel(Responses.UNAUTHORIZED, message));
};

/**
 * Sends a not found response with the specified message.
 * @param res - The response object.
 * @param message - The error message to be sent.
 * @returns The response object with the not found status and error message.
 */
export const notFound = (res: Response, message: string) => {
  return res
    .status(Responses.NOT_FOUND)
    .json(responseModel(Responses.NOT_FOUND, message));
};

/**
 * Sends a forbidden response with the specified message.
 * @param res - The response object.
 * @param message - The message to include in the response.
 * @returns The response object with the appropriate status code and message.
 */
export const forbidden = (res: Response, message: string) => {
  return res
    .status(Responses.FORBIDDEN)
    .json(responseModel(Responses.FORBIDDEN, message));
};

/**
 * Sends a 409 Conflict response with the provided message.
 * @param res - The response object.
 * @param message - The error message to be sent in the response.
 * @returns The response object with the appropriate status code and message.
 */
export const conflict = (res: Response, message: string) => {
  return res
    .status(Responses.CONFLICT)
    .json(responseModel(Responses.CONFLICT, message));
};

/**
 * Sends a validation error response.
 * @param res - The response object.
 * @param message - The error message.
 * @returns The response object with the validation error status and message.
 */
export const validationError = (res: Response, message: string) => {
  return res
    .status(Responses.VALIDATION_ERROR)
    .json(responseModel(Responses.VALIDATION_ERROR, message));
};

/**
 * Sends an internal server error response.
 *
 * @param res - The response object.
 * @returns The response object with the internal server error status and message.
 */
export const internalServerError = (res: Response) => {
  return res
    .status(Responses.INTERNAL_SERVER_ERROR)
    .json(
      responseModel(Responses.INTERNAL_SERVER_ERROR, "Internal Server Error")
    );
};

/**
 * Parses a ZodError object and returns the flattened field errors as a string.
 * @param error - The ZodError object to parse.
 * @returns A string representation of the flattened field errors.
 */
export const parseZodError = <T = any>(error: ZodError<T>) => {
  const flattened = error.flatten();

  const fieldErrors = Object.keys(flattened.fieldErrors)
    .map((key) => `${key}: ${flattened.fieldErrors[key as keyof true]}`)
    .join(", ");

  return fieldErrors;
};
