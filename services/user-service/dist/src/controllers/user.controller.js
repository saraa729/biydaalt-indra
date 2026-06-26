import * as userService from "../services/user.service.js";
export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to get users" });
    }
};
export const getUserById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to get user" });
    }
};
export const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to create user" });
    }
};
export const updateUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await userService.updateUser(id, req.body);
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update user" });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await userService.deleteUser(id);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
};
export const getAllRoles = async (req, res) => {
    try {
        const roles = await userService.getAllRoles();
        res.status(200).json({ success: true, data: roles });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to get roles" });
    }
};
