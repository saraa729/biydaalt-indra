import type { Request, Response } from "express";
import * as roleService from "../services/role.service.js";

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
      : message === "Role not found"
        ? 404
        : message === "Role already exists"
          ? 409
          : message === "Role is assigned to users and cannot be deleted"
            ? 409
            : message === "Invalid role name"
              ? 400
              : message.includes("required")
                ? 400
                : 500;

  return res.status(status).json({ success: false, message });
}

export const getAllRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await roleService.listRoles();
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    console.error(error);
    handleError(res, error, "Failed to get roles");
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const role = await roleService.getRoleById(id);

    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    res.status(200).json({ success: true, data: role });
  } catch (error) {
    console.error(error);
    handleError(res, error, "Failed to get role");
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    console.error(error);
    handleError(res, error, "Failed to create role");
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const role = await roleService.updateRole(id, req.body);

    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    res.status(200).json({ success: true, data: role });
  } catch (error) {
    console.error(error);
    handleError(res, error, "Failed to update role");
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const deleted = await roleService.deleteRole(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    res.status(200).json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    console.error(error);
    handleError(res, error, "Failed to delete role");
  }
};
