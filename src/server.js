const config = require('./constants.js');
const { HTML_FILE_PATH, ROOMMATES_JSON_PATH, EXPENSES_JSON_PATH, ACTIVITIES_JSON_PATH } = config;
const express = require('express');
const fs = require('fs');

//*import
const { handleError } = require('./utils.js');
const { addRoommate, addExpense, editExpense, deleteExpense } = require('./functions.js');
//*import

const app = express();
const PORT = 3000;

//!middlewares
app.use((err, req, res, next) => {
    handleError(res, err);
});
app.use(express.static('public'));
app.use(express.json());
//!middlewares

app.get('/', (req, res) => {
    res.sendFile(HTML_FILE_PATH, { root: __dirname });
});

app.get('/roommates', (req, res) => {
    try {
        const result = JSON.parse(fs.readFileSync(ROOMMATES_JSON_PATH, 'utf8'));
        res.json(result);
    } catch (error) {
        console.error('Error reading roommates JSON:', error);
        handleError(res, error, 500);
    }
});

app.get('/expenses', (req, res) => {
    try {
        const result = JSON.parse(fs.readFileSync(EXPENSES_JSON_PATH, 'utf8'));
        res.json(result);
    } catch (error) {
        console.error('Error reading expenses JSON:', error);
        handleError(res, error, 500);
    }
});

app.get('/activities', (req, res) => {
    try {
        const result = JSON.parse(fs.readFileSync(ACTIVITIES_JSON_PATH, 'utf8'));
        res.json(result);
    } catch (error) {
        console.error('Error reading activities JSON:', error);
        handleError(res, error, 500);
    }
});

//* CRUD
app.post('/roommate', async (req, res) => {
    try {
        const result = await addRoommate();
        res.json(result);
    } catch (error) {
        handleError(res, error, 500);
    }
});

app.post('/expense', async (req, res) => {
    try {
        const result = await addExpense(req.body);
        res.json(result);
    } catch (error) {
        handleError(res, error, 500);
    }
});

app.put('/expense/:id', async (req, res) => {
    try {
        const result = await editExpense(req.body);
        res.json(result);
    } catch (error) {
        handleError(res, error, 500);
    }
});

app.delete('/expense/:id', async (req, res) => {
    try {
        const result = await deleteExpense(req.params.id);
        res.json(result);
    } catch (error) {
        handleError(res, error, 500);
    }
});
//* CRUD

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
