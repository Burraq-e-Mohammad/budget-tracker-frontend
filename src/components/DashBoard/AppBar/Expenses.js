import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
    IconButton,
    MenuItem,
    Select,
    InputLabel,
    FormControl
} from "@mui/material";
import LinearProgress from './LinearProgress';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import './Expenses.css';
import axios from 'axios';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentExpense, setCurrentExpense] = useState({
        transactionName: '',
        price: '',
        date: ''
    });
    const [selectedDate, setSelectedDate] = useState(null);
    const [sortBy, setSortBy] = useState('All');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/expenses/budget-entries', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExpenses(response.data.budgetEntries);
            setFilteredExpenses(response.data.budgetEntries);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    };

    const handleOpenDialog = (expense = { transactionName: '', price: '', date: '' }) => {
        setIsEditing(!!expense._id);
        setCurrentExpense(expense);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setIsEditing(false);
        setCurrentExpense({ transactionName: '', price: '', date: '' });
    };

    const handleSubmit = async () => {
        try {
            if (isEditing) {
                await axios.put(`http://localhost:4000/api/expenses/update-budget/${currentExpense._id}`, currentExpense, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Expense updated successfully!");
            } else {
                await axios.post('http://localhost:4000/api/expenses/add-budget', currentExpense, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Expense added successfully!");
            }
            fetchExpenses();
        } catch (error) {
            console.error("Error saving expense:", error);
        }
        handleCloseDialog();
    };

    const handleDeleteExpense = async (expenseId) => {
        try {
            await axios.delete(`http://localhost:4000/api/expenses/delete-budget/${expenseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchExpenses();
            alert("Expense deleted successfully!");
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    const handleSort = () => {
        let sortedData = [...expenses];

        if (sortBy === 'Date') {
            sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortBy === 'Expenditure') {
            sortedData.sort((a, b) => b.price - a.price);
        }

        if (selectedDate) {
            sortedData = sortedData.filter(item => new Date(item.date).toDateString() === new Date(selectedDate).toDateString());
        }

        setFilteredExpenses(sortedData);
    };

    const handleFilterBySearch = () => {
        const filteredData = expenses.filter(item => item.transactionName.toLowerCase().includes(search.toLowerCase()));
        setFilteredExpenses(filteredData);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <div className="table-container">
            <div className="options-container">
                <button
                    className="add-expense-button"
                    onClick={() => handleOpenDialog()}
                >
                    Add Expense
                </button>
                <FormControl variant="outlined" style={{ marginLeft: '10px', marginRight: '10px', height: '40px' }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        label="Sort By"
                        style={{ height: '40px' }}
                    >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Date">Date</MenuItem>
                        <MenuItem value="Expenditure">Expenditure</MenuItem>
                    </Select>
                </FormControl>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Filter by Date"
                    style={{ marginLeft: '10px', marginRight: '10px', height: '50px', width: '220px' }}
                />
                <TextField
                    className="search-box"
                    label="Search"
                    variant="outlined"
                    style={{ marginLeft: '10px', marginRight: '10px' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={handleSort} variant="contained" color="primary">Apply</Button>
                <Button onClick={handleFilterBySearch} variant="contained" color="primary">Search</Button>
            </div>
            <table className="expense-table">
                <thead>
                    <tr>
                        <th>Expense</th>
                        <th>Total Expenditure</th>
                        <th>Price(PKR)</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentData.map((item) => (
                        <tr key={item._id}>
                            <td>{item.transactionName}</td>
                            <td>
                                <LinearProgress value={item.price} />
                            </td>
                            <td>{item.price}</td>
                            <td>{item.date}</td>
                            <td>
                                <IconButton onClick={() => handleOpenDialog(item)}>
                                    <FaEdit color="purple" />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteExpense(item._id)}>
                                    <FaTrash color="red" />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Stack spacing={2} sx={{ alignItems: 'center', marginTop: '20px' }}>
                <Pagination
                    count={Math.ceil(filteredExpenses.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Stack>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {isEditing ? "Edit Expense" : "Add Expense"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Transaction Name"
                        fullWidth
                        value={currentExpense.transactionName}
                        onChange={(e) =>
                            setCurrentExpense({ ...currentExpense, transactionName: e.target.value })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Price(PKR)"
                        fullWidth
                        value={currentExpense.price}
                        onChange={(e) =>
                            setCurrentExpense({ ...currentExpense, price: e.target.value })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={currentExpense.date}
                        onChange={(e) =>
                            setCurrentExpense({ ...currentExpense, date: e.target.value })
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        {isEditing ? "Update" : "Add"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Expenses;
