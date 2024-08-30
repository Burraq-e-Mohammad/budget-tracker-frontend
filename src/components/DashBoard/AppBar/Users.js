import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    TextField,
    IconButton,
    InputLabel,
    MenuItem,
    FormControl,
    Select
} from "@mui/material";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Pagination from '@mui/material/Pagination'; // Import the MUI Pagination component
import Stack from '@mui/material/Stack'; // Import Stack for layout
import './Users.css'; // Import the CSS file
import axios from 'axios'; // Import axios for API calls

const Users = () => {
    const [users, setUsers] = useState([]); // State to hold the list of users
    const [openDialog, setOpenDialog] = useState(false); // State to manage dialog open/close
    const [dialogType, setDialogType] = useState(""); // State to track the type of dialog (add, edit, delete)
    const [currentUser, setCurrentUser] = useState({}); // State to hold the currently selected user for edit/delete
    const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", number: "", role: "" }); // State to manage form inputs
    const [sortBy, setSortBy] = useState('All'); // State to manage sorting
    const [selectedDate, setSelectedDate] = useState(null); // State to manage date filter
    const [search, setSearch] = useState(""); // State to manage search input
    const [currentPage, setCurrentPage] = useState(1); // Track current page
    const itemsPerPage = 5; // Number of items per page

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleOpenDialog = (type, user = {}) => {
        setDialogType(type);
        setCurrentUser(user);
        setNewUser(type === "edit" ? { ...user } : { firstName: "", lastName: "", email: "", number: "", role: "" });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewUser({ firstName: "", lastName: "", email: "", number: "", role: "" });
    };

    const handleAddUser = async () => {
        try {
            await axios.post('http://localhost:4000/api/users', newUser);
            fetchUsers();
            alert("User added successfully!");
        } catch (error) {
            console.error("Error adding user:", error);
        }
        handleCloseDialog();
    };

    const handleEditUser = async () => {
        try {
            await axios.put(`http://localhost:4000/api/users/${currentUser._id}`, newUser);
            fetchUsers();
            alert("User updated successfully!");
        } catch (error) {
            console.error("Error updating user:", error);
        }
        handleCloseDialog();
    };

    const handleDeleteUser = async () => {
        try {
            await axios.delete(`http://localhost:4000/api/users/${currentUser._id}`);
            fetchUsers();
            alert("User deleted successfully!");
        } catch (error) {
            console.error("Error deleting user:", error);
        }
        handleCloseDialog();
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users
        .filter(user =>
            user.firstName.toLowerCase().includes(search.toLowerCase()) ||
            user.lastName.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        )
        .slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <div className="table-container">
            <div className="filters-container">
                <FormControl>
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
                    style={{ marginLeft: '10px', marginRight: '10px', height: '40px', width: '220px' }}
                />
                <TextField
                    className="search-box"
                    label="Search"
                    variant="outlined"
                    style={{ marginLeft: '10px', marginRight: '10px' }} // Remove height from here
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={() => {}} variant="contained" color="primary">Apply</Button>
            </div>
            <button
                className="add-user-button"
                onClick={() => handleOpenDialog("add")}
            >
                Add User
            </button>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Number</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.map((user) => (
                        <tr key={user._id}>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.number}</td>
                            <td>{user.role}</td>
                            <td>
                                <IconButton onClick={() => handleOpenDialog("edit", user)}>
                                    <FaEdit color="purple" />
                                </IconButton>
                                <IconButton onClick={() => handleOpenDialog("delete", user)}>
                                    <FaTrash color="red" />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* MUI Pagination */}
            <Stack spacing={2} sx={{ alignItems: 'center', marginTop: '20px' }}>
                <Pagination
                    count={Math.ceil(users.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Stack>

            {/* Dialog Component */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {dialogType === "add" && "Add User"}
                    {dialogType === "edit" && "Edit User"}
                    {dialogType === "delete" && "Delete User"}
                </DialogTitle>
                <DialogContent>
                    {dialogType !== "delete" ? (
                        <form>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="First Name"
                                fullWidth
                                value={newUser.firstName}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, firstName: e.target.value })
                                }
                            />
                            <TextField
                                margin="dense"
                                label="Last Name"
                                fullWidth
                                value={newUser.lastName}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, lastName: e.target.value })
                                }
                            />
                            <TextField
                                margin="dense"
                                label="Email"
                                type="email"
                                fullWidth
                                value={newUser.email}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, email: e.target.value })
                                }
                            />
                            <TextField
                                margin="dense"
                                label="Number"
                                type="tel"
                                fullWidth
                                value={newUser.number}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, number: e.target.value })
                                }
                            />
                            <TextField
                                margin="dense"
                                label="Role"
                                fullWidth
                                value={newUser.role}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, role: e.target.value })
                                }
                            />
                        </form>
                    ) : (
                        <DialogContentText>
                            Are you sure you want to delete this user?
                        </DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    {dialogType === "add" && (
                        <Button onClick={handleAddUser} color="primary">
                            Add
                        </Button>
                    )}
                    {dialogType === "edit" && (
                        <Button onClick={handleEditUser} color="primary">
                            Update
                        </Button>
                    )}
                    {dialogType === "delete" && (
                        <Button onClick={handleDeleteUser} color="secondary">
                            Delete
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Users;
