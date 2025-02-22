require('dotenv').config();
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

// Define custom levels and colors for system logs.
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4
  },
  colors: {
    fatal: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue'
  }
};

winston.addColors(customLevels.colors);

// Determine environment and logging level.
// Production defaults to 'warn' for system logs; development defaults to 'debug'.
const env = process.env.NODE_ENV || 'development';
const logLevel = process.env.LOG_LEVEL || (env === 'production' ? 'warn' : 'debug');

// Define a custom log format.
const logFormat = printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

/**
 * System Logger: Handles errors, warnings, etc.
 */
let systemTransports = [];

if (env === 'production') {
  // In production, log errors and combined logs to separate daily rotating files.
  systemTransports.push(
    new DailyRotateFile({
      level: 'error',
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new transports.Console({
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
    })
  );
} else {
  // In development, output to the console with colorization.
  systemTransports.push(
    new transports.Console({
      format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
    })
  );
}

const systemLogger = createLogger({
  levels: customLevels.levels,
  level: logLevel,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: systemTransports,
  exceptionHandlers: env === 'production'
    ? [
        new DailyRotateFile({
          filename: 'logs/exceptions-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d'
        }),
        new transports.Console({
          format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
        })
      ]
    : [
        new transports.Console({
          format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
        })
      ],
  exitOnError: false
});

/**
 * Business Logger: Captures business metrics such as user actions.
 * Best practice is to keep these separate from system logs.
 */
// Business Logger: Captures business metrics such as user actions.
let businessTransports = [];

if (env === 'production') {
  businessTransports.push(
    new DailyRotateFile({
      filename: 'logs/business-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  );
} else {
  businessTransports.push(
    new transports.Console({
      format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
    })
  );
}

// Updated business logger: Use JSON formatting to output rich metadata.
const businessLogger = createLogger({
  level: 'info', // Log all business events at "info" level.
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()  // Output logs as JSON objects.
  ),
  transports: businessTransports,
  exitOnError: false
});
// Export both logger instances for use in your application.
module.exports = { systemLogger, businessLogger };