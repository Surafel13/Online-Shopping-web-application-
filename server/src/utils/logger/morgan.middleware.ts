// shared-kernel/logger/morgan.middleware.ts
import morgan from "morgan";
import type{ StreamOptions } from 'morgan';
import { logger } from "./logger.winston.js"

const stream: StreamOptions = {
    write: (message) => logger.http(message.trim()),
};

const skip = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'test';
};

const morganMiddleware = morgan(
    ':remote-addr :method :url :status :res[content-length] - :response-time ms',
    { stream, skip }
);

export default morganMiddleware;