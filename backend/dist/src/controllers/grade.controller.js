import { gradeService } from "../services/grade.service.js";
import { logService } from "../services/log.service.js";
function handleError(res, error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(400).json({ message });
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
export const gradeController = {
    async list(req, res) {
        try {
            const classGroupId = req.query.classGroupId !== undefined ? parseNumber(req.query.classGroupId, "classGroupId") : undefined;
            const studentId = req.query.studentId !== undefined ? parseNumber(req.query.studentId, "studentId") : undefined;
            const givenById = req.query.givenById !== undefined ? parseNumber(req.query.givenById, "givenById") : undefined;
            const grades = await gradeService.listGrades({ classGroupId, studentId, givenById });
            return res.json(grades);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async myGrades(req, res) {
        try {
            const studentId = req.user?.id;
            if (!studentId) {
                return res.status(401).json({ message: "Authentication required." });
            }
            const grades = await gradeService.getMyGrades(studentId);
            return res.json(grades);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async getById(req, res) {
        try {
            const id = parseId(req.params.id);
            const grade = await gradeService.getGradeById(id);
            if (!grade) {
                return res.status(404).json({ message: "Grade not found" });
            }
            return res.json(grade);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async create(req, res) {
        try {
            const grade = await gradeService.createGrade({
                classGroupId: parseNumber(req.body.classGroupId, "classGroupId"),
                studentId: parseNumber(req.body.studentId, "studentId"),
                givenById: req.user?.id ?? parseNumber(req.body.givenById, "givenById"),
                title: String(req.body.title ?? "").trim(),
                score: parseNumber(req.body.score, "score"),
                maxScore: req.body.maxScore !== undefined ? parseNumber(req.body.maxScore, "maxScore") : undefined,
                comment: req.body.comment,
            });
            await logService.createSystemLog({
                userId: req.user?.id ?? null,
                action: "GRADE_RECORDED",
                details: JSON.stringify({ gradeId: grade.id, classGroupId: grade.classGroupId, studentId: grade.studentId }),
                ipAddress: req.ip ?? null,
            });
            return res.status(201).json(grade);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async update(req, res) {
        try {
            const id = parseId(req.params.id);
            const grade = await gradeService.updateGrade(id, {
                classGroupId: req.body.classGroupId !== undefined ? parseNumber(req.body.classGroupId, "classGroupId") : undefined,
                studentId: req.body.studentId !== undefined ? parseNumber(req.body.studentId, "studentId") : undefined,
                givenById: req.body.givenById !== undefined ? parseNumber(req.body.givenById, "givenById") : undefined,
                title: req.body.title,
                score: req.body.score !== undefined ? parseNumber(req.body.score, "score") : undefined,
                maxScore: req.body.maxScore !== undefined ? parseNumber(req.body.maxScore, "maxScore") : undefined,
                comment: req.body.comment,
            });
            if (!grade) {
                return res.status(404).json({ message: "Grade not found" });
            }
            await logService.createSystemLog({
                userId: req.user?.id ?? null,
                action: "GRADE_UPDATED",
                details: JSON.stringify({ gradeId: id }),
                ipAddress: req.ip ?? null,
            });
            return res.json(grade);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async remove(req, res) {
        try {
            const id = parseId(req.params.id);
            const deleted = await gradeService.deleteGrade(id);
            if (!deleted) {
                return res.status(404).json({ message: "Grade not found" });
            }
            await logService.createSystemLog({
                userId: req.user?.id ?? null,
                action: "GRADE_DELETED",
                details: JSON.stringify({ gradeId: id }),
                ipAddress: req.ip ?? null,
            });
            return res.json({ deleted });
        }
        catch (error) {
            return handleError(res, error);
        }
    },
};
