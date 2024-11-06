import { Router } from 'express'
import { getAllComent , createComment , getAllComentByPostId} from '../controllers/commentController'
import { VerifyToken } from '../middlewares/token'
const commentRouter = Router()
commentRouter.get("/comments" , VerifyToken ,  getAllComent)
commentRouter.get("/commentsbyPost/:id", VerifyToken, getAllComentByPostId);
commentRouter.post("/comment", VerifyToken , createComment);

export default commentRouter