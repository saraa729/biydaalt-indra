import prisma from "../config/db.js";
const parseId = (value) => {
    if (Array.isArray(value) || value === undefined) {
        return null;
    }
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }
    return id;
};
const contactInclude = {
    repliedBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
    },
};
function parseBoolean(value) {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }
    if (typeof value === "boolean") {
        return value;
    }
    const normalized = String(value).toLowerCase();
    if (normalized === "true")
        return true;
    if (normalized === "false")
        return false;
    throw new Error("Invalid boolean value.");
}
export const createContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const contact = await prisma.contactMessage.create({
            data: {
                name: String(name).trim(),
                email: String(email).trim().toLowerCase(),
                subject: subject === undefined || subject === null ? null : String(subject).trim() || null,
                message: String(message).trim(),
            },
        });
        return res.status(201).json({ success: true, data: contact });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
export const getAllContacts = async (_req, res) => {
    try {
        const contacts = await prisma.contactMessage.findMany({
            orderBy: { createdAt: "desc" },
            include: contactInclude,
        });
        return res.status(200).json({ success: true, data: contacts });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
export const getContactById = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ success: false, message: "Invalid contact id." });
        }
        const contact = await prisma.contactMessage.findUnique({
            where: { id },
            include: contactInclude,
        });
        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact not found." });
        }
        return res.status(200).json({ success: true, data: contact });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
export const markContactAsReplied = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ success: false, message: "Invalid contact id." });
        }
        const repliedById = req.user?.id;
        if (!repliedById) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        const contact = await prisma.contactMessage.update({
            where: { id },
            data: {
                isReplied: true,
                repliedById,
            },
            include: contactInclude,
        });
        return res.status(200).json({ success: true, data: contact });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
export const updateContact = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ success: false, message: "Invalid contact id." });
        }
        const data = {};
        if (req.body.name !== undefined)
            data.name = String(req.body.name).trim();
        if (req.body.email !== undefined)
            data.email = String(req.body.email).trim().toLowerCase();
        if (req.body.subject !== undefined) {
            data.subject =
                req.body.subject === null ? null : String(req.body.subject).trim() || null;
        }
        if (req.body.message !== undefined)
            data.message = String(req.body.message).trim();
        const isReplied = parseBoolean(req.body.isReplied);
        if (isReplied !== undefined) {
            data.isReplied = isReplied;
            data.repliedById = isReplied ? req.user?.id ?? null : null;
        }
        const contact = await prisma.contactMessage.update({
            where: { id },
            data,
            include: contactInclude,
        });
        return res.status(200).json({ success: true, data: contact });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Server error.";
        if (message === "Invalid contact id." || message === "Invalid boolean value.") {
            return res.status(400).json({ success: false, message });
        }
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
export const deleteContact = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ success: false, message: "Invalid contact id." });
        }
        await prisma.contactMessage.delete({ where: { id } });
        return res.status(200).json({ success: true, message: "Contact deleted successfully." });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
