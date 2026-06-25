import { teacherService } from '../services/teacher.service.js';
function handleError(res, error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return res.status(400).json({ message });
}
function parseId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('Invalid id');
    }
    return id;
}
export const teacherController = {
    async list(_req, res) {
        try {
            const teachers = await teacherService.listTeachers();
            return res.json(teachers);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async getById(req, res) {
        try {
            const id = parseId(req.params.id);
            const teacher = await teacherService.getTeacherById(id);
            return res.json(teacher);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async create(req, res) {
        try {
            const teacher = await teacherService.createTeacher(req.body);
            return res.status(201).json(teacher);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async update(req, res) {
        try {
            const id = parseId(req.params.id);
            const teacher = await teacherService.updateTeacher(id, req.body);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }
            return res.json(teacher);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async remove(req, res) {
        try {
            const id = parseId(req.params.id);
            const deleted = await teacherService.deleteTeacher(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Teacher not found' });
            }
            return res.json({ deleted });
        }
        catch (error) {
            return handleError(res, error);
        }
    },
};
