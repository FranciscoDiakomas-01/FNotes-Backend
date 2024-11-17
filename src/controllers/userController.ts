import { Request, Response } from "express";
import ConnectToDb from "../database/dbConnection";
import { ICreateUser } from "../types/types";
import CryptoJS from "crypto-js";
import dotenv from 'dotenv'
import { ValidateUserCreation } from "../service/validateUser";
import isAdmin from "../service/isAdmin";
import getIdInToken from "../service/getIdInToken";

dotenv.config();
export async function getAllUsers(req: Request, res: Response) {
  const db = await ConnectToDb()
  const isAd = await isAdmin(req.headers['authorization'] || "")
  if (!isAd) {
    await db.end();
    return res.status(401).json({
      error: "permition not allowed",
    });
  }
    const limit : number = Number(req.query.limit) || 10
    const page  : number = Number(req.query.page) || 1
    const offset: number = (page - 1) * limit
    const { rowCount } = await db.query("SELECT id FROM users WHERE permistion = 2")
    const lastPage = Math.ceil( rowCount  / limit)
    db.query("SELECT id , name , email , status , created_at , permistion FROM users WHERE permistion = 2 ORDER BY id DESC LIMIT $1 OFFSET $2 ;", [limit,offset], async(err, result) => {
      if (err) {
            await db.end();
            return res.status(400).json({
              error: err.message,
            });
        } else {
            await db.end();
            return res.status(200).json({
              data: result.rows,
              total: rowCount,
              lastPage,
              currentPage: page,
              currentLimit: limit,
            });
        }
    })
}

export async function getUserById(req: Request, res: Response) {
  const db = await ConnectToDb();
  const id  : number = Number(req.params.id)
  if (!id) {
    await db.end();
    return res.status(400).json({
      error: "invalid id",
    });
  }
  
  db.query("SELECT  id , name , email , status  , created_at , permistion FROM users  WHERE id = $1 LIMIT 1;",[id],async (err, result) => {
      if (err) {
        await db.end();
        return res.status(400).json({
          error: err.message,
        });
      } else {
        await db.end();
        return res.status(200).json({
          data: result.rows.length <= 0 ? "user not found" : result.rows,
        });
      }
    }
  );
}

export async function deleteUserById(req: Request, res: Response) {
  const db = await ConnectToDb();
  const id: number = Number(req.params.id);
  const isAd = await isAdmin(req.headers["authorization"]);
  if (!isAd) {
    await db.end();
    return res.status(401).json({
      error: "permition not allowed",
    });
  }
  if (!id) {
    await db.end();
    return res.status(400).json({
      error: "invalid id",
    });
  }
  db.query("DELETE FROM users  WHERE id = $1;",[id],async (err, result) => {
      if (err) {
        await db.end();
        return res.status(400).json({
          error: err.message,
        });
      } else {
        await db.end();
        return res.status(200).json({
          data: result.rowCount,
        });
      }
    }
  );
}

export async function createUser(req: Request, res: Response) {
    
    const db = await ConnectToDb();
    const cipher = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_CRYPT || ""
    );
    const validateResult = ValidateUserCreation(req.body);
    const user: ICreateUser = {
      email: req.body.email,
      name: req.body.name,
      status: 1,
      password: cipher.toString(),
    };
    if (validateResult) {
        db.query("INSERT INTO users(name , email , password  , status ) VALUES( $1 , $2 , $3 , $4) RETURNING id",[user.name, user.email, user.password, user.status],
        async (err, result) => {
          if (err) {
            await db.end();
            return res.status(400).json({
              error: "email alredy in use",
            });
          } else {
            await db.end();
            return res.status(200).json({
              data: result.rows,
             });
          }
        }
      );
    } else {
        await db.end();
        return res.status(400).json({
            error : "invalid data [email , name , password]"
        })
    }
}

export async function UpdateUser(req: Request, res: Response){
    const db = await ConnectToDb()
    const id = getIdInToken(req.headers["authorization"]);
    if (!id) {
        await db.end();
        return res.status(400).json({
          error: "invalid id",
        });
    }
    
    const cipher = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_CRYPT );
    const vaidationResult = ValidateUserCreation(req.body)
    const user: ICreateUser = {
        email: req.body.email,
        name: req.body.name,
        password: cipher.toString(),
    };
    if (vaidationResult) {
        //update in db
        db.query("UPDATE users SET name = $1 , email = $2 , password = $3  WHERE id = $4;", [user.name , user.email , user.password , id], async(err, result) => {
          if (err) {
                await db.end();
                return res.status(400).json({
                  error: "email alredy in use",
                });
            } else {
                await db.end();
                return res.status(200).json({
                  data: result.rowCount,
                });
            }
        })
    } else {
        await db.end();
        return res.status(400).json({
          error: "invalid data [email , name , password]",
        }); 
    }
}