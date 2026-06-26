import { announcementService } from "../services/announcement.service.js";
function handleError(res, error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Invalid id" ? 400 : 400;
    return res.status(status).json({ message });
}
function parseId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid id");
    }
    return id;
}
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
export const announcementController = {
    async list(_req, res) {
        try {
            const announcements = await announcementService.listAnnouncements();
            return res.json(announcements);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async getById(req, res) {
        try {
            const id = parseId(req.params.id);
            const announcement = await announcementService.getAnnouncementById(id);
            if (!announcement) {
                return res.status(404).json({ message: "Announcement not found" });
            }
            return res.json(announcement);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async create(req, res) {
        try {
            const authorId = req.user?.id;
            if (!authorId) {
                return res.status(401).json({ message: "Authentication required." });
            }
            const announcement = await announcementService.createAnnouncement({
                title: req.body.title,
                content: req.body.content,
                isPublished: parseBoolean(req.body.isPublished),
                authorId,
            });
            return res.status(201).json(announcement);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async update(req, res) {
        try {
            const id = parseId(req.params.id);
            const announcement = await announcementService.updateAnnouncement(id, {
                title: req.body.title,
                content: req.body.content,
                isPublished: parseBoolean(req.body.isPublished),
            });
            if (!announcement) {
                return res.status(404).json({ message: "Announcement not found" });
            }
            return res.json(announcement);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async remove(req, res) {
        try {
            const id = parseId(req.params.id);
            const deleted = await announcementService.deleteAnnouncement(id);
            if (!deleted) {
                return res.status(404).json({ message: "Announcement not found" });
            }
            return res.json({ deleted });
        }
        catch (error) {
            return handleError(res, error);
        }
    },
};
