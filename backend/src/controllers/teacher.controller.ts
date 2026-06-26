import { teacherService } from '../services/teacher.service.js';
import { logService } from '../services/log.service.js';

function handleError(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return res.status(400).json({ message });
}

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Invalid id');
  }
  return id;
}

export const teacherController = {
  async list(_req: any, res: any) {
    try {
      const teachers = await teacherService.listTeachers();
      return res.json(teachers);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getById(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const teacher = await teacherService.getTeacherById(id);
      return res.json(teacher);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async create(req: any, res: any) {
    try {
      const teacher = await teacherService.createTeacher(req.body);
      await logService.createSystemLog({
        userId: req.user?.id ?? null,
        action: "TEACHER_CREATED",
        details: JSON.stringify({ teacherId: teacher.id, email: teacher.email }),
        ipAddress: req.ip ?? null,
      });
      return res.status(201).json(teacher);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async update(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const teacher = await teacherService.updateTeacher(id, req.body);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      await logService.createSystemLog({
        userId: req.user?.id ?? null,
        action: "TEACHER_UPDATED",
        details: JSON.stringify({ teacherId: id }),
        ipAddress: req.ip ?? null,
      });
      return res.json(teacher);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async remove(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const deleted = await teacherService.deleteTeacher(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      await logService.createSystemLog({
        userId: req.user?.id ?? null,
        action: "TEACHER_DELETED",
        details: JSON.stringify({ teacherId: id }),
        ipAddress: req.ip ?? null,
      });
      return res.json({ deleted });
    } catch (error) {
      return handleError(res, error);
    }
  },
};
