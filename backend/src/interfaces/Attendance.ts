export interface AttendanceRecord {
  id: number;
  classGroupId: number;
  studentId: number;
  date: Date;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  takenById: number;
  createdAt?: Date;
  classGroup?: {
    id: number;
    name: string;
  };
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  takenBy?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}
