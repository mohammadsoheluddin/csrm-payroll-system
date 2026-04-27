import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      /**
       * Changed:
       * Validates body, params, query and cookies together.
       *
       * Important:
       * We do not assign req.query because in this runtime it is getter-only.
       */
      const parsedData = (await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies,
      })) as {
        body?: unknown;
        params?: Record<string, string>;
        query?: unknown;
        cookies?: unknown;
      };

      if (parsedData.body !== undefined) {
        req.body = parsedData.body;
      }

      if (parsedData.params !== undefined) {
        Object.assign(req.params, parsedData.params);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
