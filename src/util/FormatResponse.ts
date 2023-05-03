import { HttpCodes } from './HttpCodes';

class FormatResponse {
	success: boolean;

	statusCode: HttpCodes;

	message: string;

	data: null | object;

	constructor(
		success: boolean,
		statusCode: HttpCodes,
		message: string | any,
		data: object | null,
	) {
		this.success = success;
		this.statusCode = statusCode;
		this.message = message;
		this.data = data;
	}
}

export default FormatResponse;
