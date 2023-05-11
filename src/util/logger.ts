import { config, createLogger, format, info, level, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import env from '../config/env';

const logFormat = format.combine(
	format.colorize(),
	format.timestamp(),
	format.align(),
	format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
);

const transport: DailyRotateFile = new DailyRotateFile({
	filename: 'heartbit-%DATE%.log',
	frequency: '24h',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '20m',
	maxFiles: '10d',
	dirname: 'logs',
});

transport.on('rotate', function (oldFilename, newFilename) {
	// do something fun
});

const logger = createLogger({
	transports: [transport],
});

if (env.NODE_ENV !== 'production') {
	logger.add(
		new transports.Console({
			format: format.simple(),
		}),
	);
}

export default logger;
