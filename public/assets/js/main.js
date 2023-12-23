const API_URL = 'http://localhost:3000';
let roommates = [];
let expenses = [];
let activities = [];
let expenseId = null;

const fetchData = async (url, options) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        showMessage('error', 'Error', 'Something went wrong!');
        throw error;
    }
};

const showMessage = (icon, title, text) => {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        showConfirmButton: false,
        timer: 1500
    });
};

const resetModalFields = () => {
    $('#roommatesSelectModal').val('');
    $('#activityModal').val('');
    $('#amountModal').val('');
};

const getRoommates = async () => {
    try {
        const res = await fetch(`${API_URL}/roommates`);
        const data = await res.json();
        roommates = data.roommates;
    } catch (error) {
        console.error('Error fetching roommates:', error);
    }
};

const getExpenses = async () => {
    try {
        const res = await fetch(`${API_URL}/expenses`);
        const data = await res.json();
        expenses = data.expenses;
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
};

const getActivities = async () => {
    try {
        const res = await fetch(`${API_URL}/activities`);
        const data = await res.json();
        activities = data.activities;
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
};


const addRoommate = async () => {
    try {
        await fetchData(`${API_URL}/roommate`, { method: 'POST' });
        showMessage('success', 'Success', 'Roommate added successfully!');
        renderData();
    } catch (error) {
        showMessage('error', 'Error', `Failed to add roommate. ${error.message}`);
    }
};

const addExpense = async () => {
    const roommateSelected = $('#roommatesSelect').val();
    const activity = $('#activity').val();
    const amount = Number($('#amount').val());

    if (roommateSelected && activity && amount !== 0 && amount > 0) {
        const newExpense = {
            roommate: roommateSelected,
            activity: activity,
            amount: amount,
        };

        try {
            await fetchData(`${API_URL}/expense`, {
                method: 'POST',
                body: JSON.stringify(newExpense),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            showMessage('success', 'Success', 'Expense created successfully');
            $('#amount').val(0);
            renderData();

        } catch (error) {
            showMessage('error', 'Error creating expense', 'Something went wrong!');
            console.log('Error creating expense:', error);
        }
    } else {
        showMessage('warning', 'Incomplete Fields', 'Please complete all fields before submitting.');
    }
};

const editExpense = (id) => {
    expenseId = id
    const { roommate, activity, amount } = expenses.find((expense) => expense.id == id);
    $('#roommatesSelectModal').val(roommate);
    $('#activityModal').val(activity);
    $('#amountModal').val(amount);
};

const updateExpense = async () => {
    const roommateSelected = $('#roommatesSelectModal').val();
    const activity = $('#activityModal').val();
    const amount = Number($('#amountModal').val());

    if (isNaN(amount) || amount < 0) {
        showMessage('error', 'Invalid Amount', 'Please enter a valid positive number for the amount.');
        return;
    }

    const newExpense = {
        id: expenseId,
        roommate: roommateSelected,
        activity: activity,
        amount: amount,
    };

    try {
        await fetchData(`http://localhost:3000/expense/${expenseId}`, {
            method: 'PUT',
            body: JSON.stringify(newExpense),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        showMessage('success', 'Expense edited successfully', '');
        $('#exampleModal').modal('hide');
        renderData();
    } catch (error) {
        showMessage('error', 'Error', `Failed to edit expense. ${error.message}`);
    }
};

const deleteExpense = async (id) => {
    try {
        if (id) {
            await fetchData(`${API_URL}/expense/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            showMessage('success', 'Success', 'Expense deleted successfully');
        } else {
            showMessage('error', 'Error', 'Something went wrong!');
        }
        renderData();
    } catch (error) {
        showMessage('error', 'Error', `Failed to delete expense. ${error.message}`);
    }
};

const renderData = async () => {
    try {
        await getRoommates();
        await getExpenses();
        await getActivities();
        $('#roommates').html('');
        $('#roommatesSelect').html('');
        $('#roommatesSelectModal').html('');

        $('#roommatesSelect').append(`<option value="" disabled selected>Select an option</option>`);
        $('#roommatesSelectModal').append(`<option value="" disabled selected>Select an option</option>`);
        roommates.forEach((roommate) => {
            $('#roommatesSelect').append(`
                <option value="${roommate.name}">${roommate.name}</option>
            `);
            $('#roommatesSelectModal').append(`
                <option value="${roommate.name}">${roommate.name}</option>
            `);
            $('#roommates').append(`
                <tr>
                    <td>${roommate.name}</td>
                    <td class="text-danger">${roommate.debt ? roommate.debt : '-'}</td>
                </tr>
            `);
        });

        $('#activity').append(`<option value="" disabled selected>Select an option</option>`);
        activities.forEach((activity) => {
            $('#activity').append(`
                <option value="${activity}">${activity}</option>
            `);
            $('#activityModal').append(`
                <option value="${activity}">${activity}</option>
            `);
        });


        $('#expenseList').html('');
        expenses.forEach((expense) => {
            $('#expenseList').append(`
                <tr>
                    <td>${expense.roommate}</td>
                    <td>${expense.activity}</td>
                    <td>${expense.amount}</td>
                    <td>
                        <span class="btn-container">
                            <i class="fas fa-edit text-warning btn-container__icon" onclick="editExpense('${expense.id}')" data-toggle="modal" data-target="#exampleModal"></i>
                            <i class="fas fa-trash-alt text-danger btn-container__icon" onclick="deleteExpense('${expense.id}')"></i>
                        </span>
                    </td>
                </tr>
            `);
        });

        resetModalFields();
    } catch (error) {
        console.log(error);
    }
};

renderData();
