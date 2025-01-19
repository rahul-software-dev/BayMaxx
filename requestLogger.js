// utils/requestLogger.js

const logger = require('./logger');

/**
 * Request Logger Middleware
 * Logs detailed request and response data along with user information and processing time.
 */
const requestLogger = (req, res, next) => {
    const start = Date.now(); // Capture the start time for response time calculation

    // Collect common request data
    const { method, originalUrl, ip, headers, query, body } = req;
    
    // Default user info if not authenticated
    const user = req.user || { id: 'guest', role: 'guest' };  

    // Log request details
    logger.info('Request Received', {
        timestamp: new Date().toISOString(),
        ip,
        method,
        originalUrl,
        headers: {
            'User-Agent': headers['user-agent'],
            'Content-Type': headers['content-type'],
        },
        queryParams: query,
        requestBody: body,
        user: {
            id: user.id,
            role: user.role,
        },
    });

    // Override res.send to log response details
    const originalSend = res.send;
    res.send = function (body) {
        const responseTime = Date.now() - start; // Calculate the response time
        const statusCode = res.statusCode;

        // Log the response details (including status and response time)
        logger.info('Response Sent', {
            timestamp: new Date().toISOString(),
            statusCode,
            responseTime: `${responseTime}ms`,
            responseBody: body, // Optionally exclude this in production for sensitive data
            user: {
                id: user.id,
                role: user.role,
            },
            request: {
                method,
                originalUrl,
                queryParams: query,
            }
        });

        originalSend.call(res, body); // Send the response
    };

    // Handle errors by logging them
    res.on('finish', () => {
        if (res.statusCode >= 400) {
            // Log errors or non-2xx responses
            logger.error('Request Failed', {
                timestamp: new Date().toISOString(),
                method,
                originalUrl,
                statusCode: res.statusCode,
                errorMessage: res.statusMessage,
                user: {
                    id: user.id,
                    role: user.role,
                },
            });
        }
    });

    // Continue with the next middleware or route handler
    next();
};

module.exports = requestLogger;