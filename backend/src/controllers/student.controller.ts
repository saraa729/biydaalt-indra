import { studentService } from '../services/student.service.js';

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

export const studentController = {
  async list(_req: any, res: any) {
    try {
      const students = await studentService.listStudents();
      return res.json(students);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getById(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const student = await studentService.getStudentById(id);
      return res.json(student);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async create(req: any, res: any) {
    try {
      const student = await studentService.createStudent(req.body);
      return res.status(201).json(student);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async update(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const student = await studentService.updateStudent(id, req.body);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      return res.json(student);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async remove(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const deleted = await studentService.deleteStudent(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Student not found' });
      }
      return res.json({ deleted });
    } catch (error) {
      return handleError(res, error);
    }
  },
};
