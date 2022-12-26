import { NextFunction, Request, Response } from "express";
import { ApiError } from "../helpers/HttpErrors";


export async function ExceptionHandler(
	error: ApiError,
	req: Request,
	res: Response,
	next: NextFunction
) {
    console.log(error)
	const statusCode = error.statusCode ?? 500;
	const message = error.statusCode ? error.message : 'Internal server error';
	return res.status(statusCode).json({ message, statusCode });
}