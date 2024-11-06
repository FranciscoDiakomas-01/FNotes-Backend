import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { Request , Response , NextFunction} from 'express'
dotenv.config()

export async function GerenetaToken(id: string) {
  try {
    const token = jwt.sign({ id}, process.env.JWT || "my secret token base");
    return token
  } catch (error) {
    return error
  }
    
}

export async function VerifyToken(req : Request , res : Response , next : NextFunction) {
  const token = req.headers['authorization']
  jwt.verify(token || "", process.env.JWT || "my secret token base", (error , payload) => {
    if (error) {
      res.status(401).json({
        error : "invalid token"
      })
      return error
    } else {
      next()
    }
  });
}