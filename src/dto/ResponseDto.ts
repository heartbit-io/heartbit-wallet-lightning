import { HttpCodes } from '../enums/HttpCodes';

class ResponseDto<T> {
	success: boolean;

	statusCode: HttpCodes;

	message: string;

	data: T;

	constructor(
		success: boolean,
		statusCode: HttpCodes,
		message: string | any,
		data: T,
	) {
		this.success = success;
		this.statusCode = statusCode;
		this.message = message;
		this.data = data;
	}
}

export default ResponseDto;
