export interface Announcement {
  id: number;
  title: string;
  content: string;
  isPublished?: boolean;
  authorId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
