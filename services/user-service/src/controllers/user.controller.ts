import type { Request, Response } from "express";
import * as userService from "../services/user.service.js";

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid id");
  }
  return id;
}

function handleError(res: Response, error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  const status =
    message === "Invalid id"
      ? 400
      : message === "User not found"
        ? 404
        : message === "A user with this email already exists"
          ? 409
          : message === "Role not found"
            ? 404
            : message === "Role is assigned to users and cannot be deleted"
              ? 409
              : message.includes("required")
                ? 400
                : 500;

  return res.status(status).json({ success: false, message });
}

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    handleError(res, error, "Failed to get users");
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    handleError(res, error, "Failed to get user");
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    handleError(res, error, "Failed to create user");
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const user = await userService.updateUser(id, req.body);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    handleError(res, error, "Failed to update user");
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    handleError(res, error, "Failed to delete user");
  }
};

export const getAllRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await userService.getAllRoles();
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    console.error(error);
    handleError(res, error, "Failed to get roles");
  }
};
