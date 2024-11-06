import { Router} from 'express'
import { getAllUsers, getUserById, deleteUserById, createUser, UpdateUser } from '../controllers/userController'
import { VerifyToken } from '../middlewares/token';

const userRoute = Router()

userRoute.get("/users", VerifyToken , getAllUsers);
userRoute.post("/user", VerifyToken , createUser);
userRoute.put("/user/:id", VerifyToken , UpdateUser);
userRoute.get("/user/:id", VerifyToken , getUserById);
userRoute.delete("/user/:id", VerifyToken , deleteUserById);

export default userRoute
