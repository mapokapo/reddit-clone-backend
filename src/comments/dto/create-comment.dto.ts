export class CreateCommentDto {
  content!: string;
  parentId!: number | null;
  postId!: number;
}
