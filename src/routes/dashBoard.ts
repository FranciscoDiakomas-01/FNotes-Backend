import { Router } from 'express'
import { getDashBoardData } from '../controllers/dasBoard.Controler'
import { VerifyToken } from '../middlewares/token'


const dashBoardRouter = Router()
dashBoardRouter.get("/dashboard" , VerifyToken , getDashBoardData)

export default dashBoardRouter