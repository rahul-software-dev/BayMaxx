const logger = require('../utils/logger');

// Custom Error Class for Operational Errors
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error Handling Middleware
const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    // If statusCode or message isn't set, use defaults
    if (!statusCode) statusCode = 500;
    if (!message) message = 'Internal Server Error';

    // Log detailed error in non-production environments
    if (process.env.NODE_ENV !== 'production') {
        logger.error({
            message: err.message,
            stack: err.stack,
            route: req.originalUrl,
            method: req.method,
        });
    } else {
        // Minimal logging for production
        logger.error({
            message: err.message,
            route: req.originalUrl,
            method: req.method,
        });
    }

    // Send JSON response to the client
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Something went wrong' : message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }), // Include stack trace in development
    });
};

// Catch-All Route for Undefined Endpoints
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Cannot find ${req.originalUrl} on this server`,
    });
};

module.exports = {
    errorHandler,
    notFoundHandler,
    AppError,
};