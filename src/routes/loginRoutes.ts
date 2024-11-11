import login from "../controllers/loginController";
import { isAdminController } from "../controllers/loginController";
import { Router } from 'express'

const loginRouter = Router()
loginRouter.post("/login", login)
loginRouter.get("/isAdmin/:token", isAdminController);
export default loginRouter