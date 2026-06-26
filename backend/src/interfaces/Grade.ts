export interface GradeRecord {
  id: number;
  classGroupId: number;
  studentId: number;
  givenById: number;
  title: string;
  score: number;
  maxScore: number;
  comment?: string | null;
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
  givenBy?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}
