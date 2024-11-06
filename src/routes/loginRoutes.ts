import login from "../controllers/loginController";
import { Router } from 'express'

const loginRouter = Router()
loginRouter.post("/login", login)
export default loginRouter