export interface Material {
  id: number;
  title: string;
  fileUrl?: string | null;
  videoUrl?: string | null;
  fileType?: string | null;
  classGroupId: number;
  uploadedById: number;
  createdAt?: Date;
}
