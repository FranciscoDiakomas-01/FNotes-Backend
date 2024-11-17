import { Router} from 'express'
import { getAllUsers, getUserById, deleteUserById, createUser, UpdateUser } from '../controllers/userController'
import { VerifyToken } from '../middlewares/token';

const userRoute = Router()

userRoute.get("/users",  getAllUsers);
userRoute.post("/user",  createUser);
userRoute.put("/user", VerifyToken , UpdateUser);
userRoute.get("/user/:id",  getUserById);
userRoute.delete("/user/:id", VerifyToken , deleteUserById);

export default userRoute
