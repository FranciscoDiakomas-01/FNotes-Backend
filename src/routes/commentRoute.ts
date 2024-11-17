import { Router } from 'express'
import { getAllComent , createComment , getAllComentByPostId , updateComment , deleteComment} from '../controllers/commentController'
import { VerifyToken } from '../middlewares/token'

const commentRouter = Router()
commentRouter.get("/comments" ,  getAllComent)
commentRouter.get("/commentsbyPost/:id",  getAllComentByPostId);
commentRouter.post("/comment", VerifyToken , createComment);
commentRouter.put("/comment/:id", VerifyToken, updateComment);
commentRouter.delete("/comment/:id", VerifyToken, deleteComment);

export default commentRouter