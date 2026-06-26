import { studentService } from '../services/student.service.js';
import { logService } from '../services/log.service.js';
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
export const studentController = {
    async list(_req, res) {
        try {
            const students = await studentService.listStudents();
            return res.json(students);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async getById(req, res) {
        try {
            const id = parseId(req.params.id);
            const student = await studentService.getStudentById(id);
            return res.json(student);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async create(req, res) {
        try {
            const student = await studentService.createStudent(req.body);
            await logService.createSystemLog({
                userId: req.user?.id ?? null,
                action: "STUDENT_CREATED",
                details: JSON.stringify({ studentId: student.id, email: student.email }),
                ipAddress: req.ip ?? null,
            });
            return res.status(201).json(student);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async update(req, res) {
        try {
            const id = parseId(req.params.id);
            const student = await studentService.updateStudent(id, req.body);
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }
            await logService.createSystemLog({
                userId: req.user?.id ?? null,
                action: "STUDENT_UPDATED",
                details: JSON.stringify({ studentId: id }),
                ipAddress: req.ip ?? null,
            });
            return res.json(student);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async remove(req, res) {
        try {
            const id = parseId(req.params.id);
            const deleted = await studentService.deleteStudent(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Student not found' });
            }
            await logService.createSystemLog({
                userId: req.user?.id ?? null,
                action: "STUDENT_DELETED",
                details: JSON.stringify({ studentId: id }),
                ipAddress: req.ip ?? null,
            });
            return res.json({ deleted });
        }
        catch (error) {
            return handleError(res, error);
        }
    },
};
