import { Router } from 'express'
import { getAllCategory , createCategory , getCategoryById , deleteCategory , updateCategory} from '../controllers/categoryController'
import { VerifyToken } from '../middlewares/token'

const categoryRouter = Router()
categoryRouter.get("/category", VerifyToken ,  getAllCategory)
categoryRouter.get("/category/:id", VerifyToken ,  getCategoryById);
categoryRouter.delete("/category/:id", VerifyToken , deleteCategory);
categoryRouter.post("/category", VerifyToken , createCategory);
categoryRouter.put("/category/:id", VerifyToken ,  updateCategory);

export default categoryRouter