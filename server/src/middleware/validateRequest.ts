import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      /**
       * Changed:
       * We validate body, params, query and cookies together.
       *
       * Important fix:
       * req.query is getter-only in this runtime, so we must not assign:
       * req.query = parsedData.query
       *
       * Query validation still works, but we keep the original req.query object.
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

      /**
       * Body can be safely replaced.
       * This keeps Zod transformations such as trim(), lowercase(), uppercase().
       */
      if (parsedData.body !== undefined) {
        req.body = parsedData.body;
      }

      /**
       * Params should not be directly replaced in some Express runtimes.
       * Mutating existing params object is safer.
       */
      if (parsedData.params !== undefined) {
        Object.assign(req.params, parsedData.params);
      }

      /**
       * Do not assign req.query.
       * It can throw:
       * Cannot set property query of #<IncomingMessage> which has only a getter
       *
       * Query is already validated above.
       */

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
