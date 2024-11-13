import { ICreatePost } from "../types/types";


export default function validatePost(post: ICreatePost): boolean {
    if (post?.title?.length >= 2 && post?.title.length <= 40 && post?.description?.length <= 200 && post?.categoryId) {
        return true
    } else {
        return false
    }
}
