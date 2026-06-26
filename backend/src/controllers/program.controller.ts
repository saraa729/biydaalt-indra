import { programService } from '../services/program.service.js';
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

export const programController = {
  async list(_req: any, res: any) {
    try {
      const programs = await programService.listPrograms();
      return res.json(programs);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getById(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const program = await programService.getProgramById(id);
      return res.json(program);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async create(req: any, res: any) {
    try {
      const program = await programService.createProgram(req.body);
      await logService.createSystemLog({
        userId: req.user?.id ?? null,
        action: "PROGRAM_CREATED",
        details: JSON.stringify({ programId: program.id, name: program.name }),
        ipAddress: req.ip ?? null,
      });
      return res.status(201).json(program);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async update(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const program = await programService.updateProgram(id, req.body);
      if (!program) {
        return res.status(404).json({ message: 'Program not found' });
      }
      await logService.createSystemLog({
        userId: req.user?.id ?? null,
        action: "PROGRAM_UPDATED",
        details: JSON.stringify({ programId: id }),
        ipAddress: req.ip ?? null,
      });
      return res.json(program);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async remove(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const deleted = await programService.deleteProgram(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Program not found' });
      }
      await logService.createSystemLog({
        userId: req.user?.id ?? null,
        action: "PROGRAM_DELETED",
        details: JSON.stringify({ programId: id }),
        ipAddress: req.ip ?? null,
      });
      return res.json({ deleted });
    } catch (error) {
      return handleError(res, error);
    }
  },
};
