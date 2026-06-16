// shared-kernel/logger/winston.logger.ts
import winston from 'winston';

// Define custom log levels if necessary (default npm levels used here)
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3, // Morgan logs will sit under the 'http' classification level
    debug: 4,
};

// Choose color schemas for development terminal outputs
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston.addColors(colors);

// Configure structural formatting layouts
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    // Render logs as structured JSON objects in production for easy parsing later
    process.env.NODE_ENV === 'production' 
        ? winston.format.json() 
        : winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.printf((info) => `[${info.timestamp}] [${info.level}]: ${info.message}`)
          )
);

// Define where logs should be directed (Transports)
const transports = [
    // 1. Always output to the standard runtime console
    new winston.transports.Console(),
    
    // 2. Persist critical application error logs into an isolated file
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
    }),
    
    // 3. Persist ALL application operations into a general combined log file
    new winston.transports.File({ filename: 'logs/combined.log' }),
];

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'http',
    levels,
    format,
    transports,
});