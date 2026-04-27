import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      /**
       * Changed:
       * Now validates body, params, query and cookies.
       * This is required for module-level validation like employee id params and status query.
       */
      const parsedData = (await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies,
      })) as {
        body?: unknown;
        params?: unknown;
        query?: unknown;
        cookies?: unknown;
      };

      if (parsedData.body !== undefined) {
        req.body = parsedData.body;
      }

      if (parsedData.params !== undefined) {
        req.params = parsedData.params as typeof req.params;
      }

      if (parsedData.query !== undefined) {
        req.query = parsedData.query as typeof req.query;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
