import { ICreatePost } from "../types/types";


export default function validatePost(post: ICreatePost): boolean {
    if (
      post?.title?.length >= 2 &&
      post?.description?.length >= 2 &&
      post?.description?.length <=  400 &&
      post?.categoryId
    ) {
      return true;
    } else {
      return false;
    }
}
