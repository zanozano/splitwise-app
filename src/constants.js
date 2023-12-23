const path = require('path');

const config = {
    HTML_FILE_PATH: path.join(__dirname, 'public', 'index.html'),
    ROOMMATES_JSON_PATH: path.join(__dirname, 'data', 'roommates.json'),
    EXPENSES_JSON_PATH: path.join(__dirname, 'data', 'expenses.json'),
    ACTIVITIES_JSON_PATH: path.join(__dirname, 'data', 'activities.json'),
};

module.exports = config;
