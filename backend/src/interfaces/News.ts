export interface News {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  isPublished?: boolean;
  authorId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
