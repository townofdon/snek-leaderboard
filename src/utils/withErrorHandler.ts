import { RequestHandler } from "express";

export const withErrorHandler = (endpoint: RequestHandler) => {
    const handler: RequestHandler = async (req, res, next) => {
        try {
            await endpoint(req, res, next);
        } catch (err) {
            next(err);
        }
    }
    return handler;
}
