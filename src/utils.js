//* Handle Error
const handleError = (res, error, statusCode = 500) => {
    console.error('Error:', error);
    res.status(statusCode).json({ error: error.message });
};

const handleErrorResponse = (error, operation) => {
    console.error(`Error ${operation}:`, error);
    throw error;
};

module.exports = { handleError, handleErrorResponse };
