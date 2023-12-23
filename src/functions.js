const config = require('./constants.js');
const { ROOMMATES_JSON_PATH, EXPENSES_JSON_PATH } = config;
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { promises: fsPromises } = require('fs');

//*import
const { handleErrorResponse } = require('./utils.js');
//*import

const addRoommate = async () => {
	try {
		const { data } = await axios.get('https://randomuser.me/api');
		const { title, first, last } = data.results[0].name;
		const newRoommate = {
			id: uuidv4().slice(30),
			name: `${title} ${first} ${last}`,
			debt: 0,
		};
		const roommatesJSON = JSON.parse(await fsPromises.readFile(ROOMMATES_JSON_PATH, 'utf8'));
		const updatedRoommatesJSON = {
			...roommatesJSON,
			roommates: [...roommatesJSON.roommates, newRoommate]
		};
		await fsPromises.writeFile(ROOMMATES_JSON_PATH, JSON.stringify(updatedRoommatesJSON, null, 2));
		return newRoommate;
	} catch (error) {
		handleErrorResponse(error, 'adding roommate');
	}
};

const addExpense = async (req) => {
	try {
		const newExpense = {
			id: uuidv4().slice(30),
			roommate: req.roommate,
			activity: req.activity,
			amount: req.amount,
		};
		const expensesJSON = JSON.parse(await fsPromises.readFile(EXPENSES_JSON_PATH, 'utf8'));
		const updatedExpensesJSON = {
			...expensesJSON,
			expenses: [...expensesJSON.expenses, newExpense]
		};
		await fsPromises.writeFile(EXPENSES_JSON_PATH, JSON.stringify(updatedExpensesJSON, null, 2));
		updateRoommateDebt(newExpense.roommate);
		return newExpense;
	} catch (error) {
		handleErrorResponse(error, 'adding expense');
	}
};

const editExpense = async (req) => {
	try {
		const expensesJSON = JSON.parse(await fsPromises.readFile(EXPENSES_JSON_PATH, 'utf8'));
		const editedExpenseJSON = expensesJSON.expenses.find(expense => expense.id === req.id);
		if (editedExpenseJSON) {
			Object.assign(editedExpenseJSON, req);
			await fsPromises.writeFile(EXPENSES_JSON_PATH, JSON.stringify(expensesJSON, null, 2));
			updateRoommateDebt(editedExpenseJSON.roommate);
			return editedExpenseJSON;
		} else {
			throw new Error('Expense not found');
		}
	} catch (error) {
		handleErrorResponse(error, 'editing expense');
	}
};

const deleteExpense = async (req) => {
	try {
		const expensesJSON = JSON.parse(await fsPromises.readFile(EXPENSES_JSON_PATH, 'utf8'));
		const deletedExpense = expensesJSON.expenses.find(expense => expense.id === req);
		if (!deletedExpense) {
			throw new Error('Expense not found');
		}
		const filterExpensesJSON = expensesJSON.expenses.filter((expense) => expense.id !== req);
		const newExpensesJSON = { expenses: filterExpensesJSON };

		await fsPromises.writeFile(EXPENSES_JSON_PATH, JSON.stringify(newExpensesJSON, null, 2));
		updateRoommateDebt(deletedExpense.roommate);
		return newExpensesJSON;
	} catch (error) {
		handleErrorResponse(error, 'deleting expense');
	}
};

const updateRoommateDebt = async (roommateName) => {
	try {
		const expensesJSON = JSON.parse(await fsPromises.readFile(EXPENSES_JSON_PATH, 'utf8'));
		const roommatesJSON = JSON.parse(await fsPromises.readFile(ROOMMATES_JSON_PATH, 'utf8'));

		const totalExpensesForRoommate = expensesJSON.expenses
			.filter(expense => expense.roommate === roommateName)
			.reduce((total, expense) => total + expense.amount, 0);

		const updatedRoommatesJSON = {
			...roommatesJSON,
			roommates: roommatesJSON.roommates.map(roommate => {
				if (roommate.name === roommateName) {
					return {
						...roommate,
						debt: totalExpensesForRoommate,
					};
				}
				return roommate;
			}),
		};

		await fsPromises.writeFile(ROOMMATES_JSON_PATH, JSON.stringify(updatedRoommatesJSON, null, 2));
		return updatedRoommatesJSON;
	} catch (error) {
		handleErrorResponse(error, 'updating roommate debt');
	}
};

module.exports = { addRoommate, addExpense, editExpense, deleteExpense };

