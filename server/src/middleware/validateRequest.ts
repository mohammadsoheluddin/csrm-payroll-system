import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

type TParsedRequest = {
  body?: unknown;
  params?: Record<string, string>;
  query?: unknown;
  cookies?: unknown;
};

const validateRequest = (schema: z.ZodType<unknown>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsedData = (await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies,
      })) as TParsedRequest;

      if (Object.prototype.hasOwnProperty.call(parsedData, "body")) {
        req.body = parsedData.body;
      }

      if (
        parsedData.params &&
        typeof parsedData.params === "object" &&
        !Array.isArray(parsedData.params)
      ) {
        Object.assign(req.params, parsedData.params);
      }

      /**
       * Important:
       * Do not assign req.query directly.
       * In Express 5, req.query can behave as getter-only depending on runtime/type setup.
       * We validate query above, but keep the original req.query object untouched.
       */

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
