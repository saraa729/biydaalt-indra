import { programService } from '../services/program.service.js';
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
export const programController = {
    async list(_req, res) {
        try {
            const programs = await programService.listPrograms();
            return res.json(programs);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async getById(req, res) {
        try {
            const id = parseId(req.params.id);
            const program = await programService.getProgramById(id);
            return res.json(program);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async create(req, res) {
        try {
            const program = await programService.createProgram(req.body);
            return res.status(201).json(program);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async update(req, res) {
        try {
            const id = parseId(req.params.id);
            const program = await programService.updateProgram(id, req.body);
            if (!program) {
                return res.status(404).json({ message: 'Program not found' });
            }
            return res.json(program);
        }
        catch (error) {
            return handleError(res, error);
        }
    },
    async remove(req, res) {
        try {
            const id = parseId(req.params.id);
            const deleted = await programService.deleteProgram(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Program not found' });
            }
            return res.json({ deleted });
        }
        catch (error) {
            return handleError(res, error);
        }
    },
};
