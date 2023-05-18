import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { HttpCodes } from '../enums/HttpCodes';
import ResponseDto from '../dto/ResponseDto';

class HttpValidator {
	static validate(req: Request, res: Response, next: NextFunction) {
		const error = validationResult(req);
		if (!error.isEmpty()) {
			return res
				.status(HttpCodes.BAD_REQUEST)
				.json(
					new ResponseDto(false, HttpCodes.BAD_REQUEST, error.array(), null),
				);
		}
		next();
	}
}
export default HttpValidator;
