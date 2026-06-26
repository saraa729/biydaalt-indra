import { attendanceService } from "../services/attendance.service.js";
import { logService } from "../services/log.service.js";

function handleError(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return res.status(400).json({ message });
}

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid id");
  }
  return id;
}

function parseDate(value: unknown) {
  if (!value) {
    throw new Error("date is required");
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  return date;
}

function parseStatus(value: unknown) {
  const status = String(value ?? "").toUpperCase();
  if (status === "PRESENT" || status === "ABSENT" || status === "LATE" || status === "EXCUSED") {
    return status;
  }

  throw new Error("Invalid attendance status.");
}

function parseNumber(value: unknown, fieldName: string) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return num;
}

export const attendanceController = {
  async list(req: any, res: any) {
    try {
      const classGroupId = req.query.classGroupId !== undefined ? parseNumber(req.query.classGroupId, "classGroupId") : undefined;
      const studentId = req.query.studentId !== undefined ? parseNumber(req.query.studentId, "studentId") : undefined;
      const takenById = req.query.takenById !== undefined ? parseNumber(req.query.takenById, "takenById") : undefined;
      const attendances = await attendanceService.listAttendances({ classGroupId, studentId, takenById });
      return res.json(attendances);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async myAttendance(req: any, res: any) {
    try {
      const studentId = req.user?.id;
      if (!studentId) {
        return res.status(401).json({ message: "Authentication required." });
      }

      const attendances = await attendanceService.getMyAttendances(studentId);
      return res.json(attendances);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getById(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const attendance = await attendanceService.getAttendanceById(id);
      if (!attendance) {
        return res.status(404).json({ message: "Attendance not found" });
      }
      return res.json(attendance);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async create(req: any, res: any) {
    try {
      const attendance = await attendanceService.recordAttendance({
        classGroupId: parseNumber(req.body.classGroupId, "classGroupId"),
        studentId: parseNumber(req.body.studentId, "studentId"),
        date: parseDate(req.body.date),
        status: parseStatus(req.body.status),
        takenById: req.user?.id ?? parseNumber(req.body.takenById, "takenById"),
      });

      await logService.createSystemLog({
        userId: req.user?.id ?? null,
        action: "ATTENDANCE_RECORDED",
        details: JSON.stringify({ attendanceId: attendance.id, classGroupId: attendance.classGroupId, studentId: attendance.studentId }),
        ipAddress: req.ip ?? null,
      });

      return res.status(201).json(attendance);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async update(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const attendance = await attendanceService.updateAttendance(id, {
        classGroupId: req.body.classGroupId !== undefined ? parseNumber(req.body.classGroupId, "classGroupId") : undefined,
        studentId: req.body.studentId !== undefined ? parseNumber(req.body.studentId, "studentId") : undefined,
        date: req.body.date !== undefined ? parseDate(req.body.date) : undefined,
        status: req.body.status !== undefined ? parseStatus(req.body.status) : undefined,
        takenById: req.body.takenById !== undefined ? parseNumber(req.body.takenById, "takenById") : undefined,
      });

      if (!attendance) {
        return res.status(404).json({ message: "Attendance not found" });
      }

      await logService.createSystemLog({
        userId: req.user?.id ?? null,
        action: "ATTENDANCE_UPDATED",
        details: JSON.stringify({ attendanceId: id }),
        ipAddress: req.ip ?? null,
      });

      return res.json(attendance);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async remove(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const deleted = await attendanceService.deleteAttendance(id);
      if (!deleted) {
        return res.status(404).json({ message: "Attendance not found" });
      }

      await logService.createSystemLog({
        userId: req.user?.id ?? null,
        action: "ATTENDANCE_DELETED",
        details: JSON.stringify({ attendanceId: id }),
        ipAddress: req.ip ?? null,
      });

      return res.json({ deleted });
    } catch (error) {
      return handleError(res, error);
    }
  },
};
