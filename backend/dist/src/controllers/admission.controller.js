import { admissionService } from "../services/admission.service.js";
function handleError(res, error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Program not found." ? 404 : message === "Invalid id" ? 400 : 400;
    return res.status(status).json({ message });
}
function parseId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid id");
    }
    return id;
}
function parseNumber(value, fieldName) {
    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0) {
        throw new Error(`${fieldName} must be a positive integer`);
    }
    return num;
}
function parseStatus(value) {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }
    const status = String(value).toUpperCase();
    if (status === "PENDING" || status === "APPROVED" || status === "REJECTED") {
        return status;
    }
    throw new Error("Invalid admission status.");
}
export const admissionController = {
    async list(_req, res) {
        try {
            const admissions = await admissionService.listAdmissions();
            return res.json(admissions);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async getById(req, res) {
        try {
            const id = parseId(req.params.id);
            const admission = await admissionService.getAdmissionById(id);
            if (!admission) {
                return res.status(404).json({ message: "Admission not found" });
            }
            return res.json(admission);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async create(req, res) {
        try {
            const admission = await admissionService.createAdmission({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                programId: parseNumber(req.body.programId, "programId"),
                message: req.body.message,
            });
            return res.status(201).json(admission);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async update(req, res) {
        try {
            const id = parseId(req.params.id);
            const reviewedById = req.user?.id;
            const status = parseStatus(req.body.status);
            const admission = await admissionService.updateAdmission(id, {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                programId: req.body.programId !== undefined ? parseNumber(req.body.programId, "programId") : undefined,
                message: req.body.message,
                status,
                reviewedById,
            });
            if (!admission) {
                return res.status(404).json({ message: "Admission not found" });
            }
            return res.json(admission);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async remove(req, res) {
        try {
            const id = parseId(req.params.id);
            const deleted = await admissionService.deleteAdmission(id);
            if (!deleted) {
                return res.status(404).json({ message: "Admission not found" });
            }
            return res.json({ deleted });
        }
        catch (error) {
            return handleError(res, error);
        }
    },
};
