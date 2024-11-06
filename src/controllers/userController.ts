import { Request, Response } from "express";
import ConnectToDb from "../database/dbConnection";
import { ICreateUser } from "../types/types";
import CryptoJS from "crypto-js";
import dotenv from 'dotenv'
dotenv.config()
import { ValidateUserCreation } from "../service/validateUser";


export async function getAllUsers(req: Request, res: Response) {
    const db = await ConnectToDb()
    const limit : number = Number(req.query.limit) || 10
    const page  : number = Number(req.query.page) || 1
    const offset: number = (page - 1) * limit
    const { rowCount } = await db.query("SELECT id FROM users")
    const lastPage = Math.ceil( rowCount || 1 / limit)
    db.query("SELECT * FROM users LIMIT $1 OFFSET $2;", [limit, offset], async(err, result) => {
        if (err) {
            res.status(400).json({
                error : err.message
            })
            return await db.end();
        } else {
            res.status(200).json({
              data: result.rows,
              total: rowCount,
              lastPage,
              currentPage: page,
              currentLimit : limit
            })
            return await db.end();
        }
    })
}

export async function getUserById(req: Request, res: Response) {
  const db = await ConnectToDb();
  const id  : number = Number(req.params.id)
  if(!id){
    res.status(400).json({
        error : "invalid id"
    })
    return db.end()
  }
  db.query("SELECT * FROM users  WHERE id = $1 LIMIT 1;",[id],async (err, result) => {
      if (err) {
        res.status(400).json({
          error: err.message,
        });
        return await db.end();
      } else {
        res.status(200).json({
          data: result.rows.length <= 0 ? "user not found" : result.rows,
        });

        return await db.end();
      }
    }
  );
}

export async function deleteUserById(req: Request, res: Response) {
  const db = await ConnectToDb();
  const id: number = Number(req.params.id);
  if (!id) {
    res.status(400).json({
      error: "invalid id",
    });
    return await db.end();
  }
  db.query("DELETE FROM users  WHERE id = $1;",[id],async (err, result) => {
      if (err) {
        res.status(400).json({
          error: err.message,
        });
        return await db.end();
      } else {
        res.status(200).json({
          data: result.rowCount,
        });
        return await db.end();
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
        db.query("INSERT INTO users(name , email , password  , status ) VALUES( $1 , $2 , $3 , $4) RETURNING id",
        [user.name, user.email, user.password, user.status],
        async (err, result) => {
          if (err) {
            res.status(400).json({
              error: "email alredy in use",
            });
            return await db.end();
          } else {
            res.status(200).json({
              data: result.rows,
             });
            
            return await db.end();
          }
        }
      );
    } else {
        res.status(400).json({
            error : "invalid data [email , name , password]"
        })
        return await db.end();
    }
    
}

export async function UpdateUser(req: Request, res: Response){
    const db = await ConnectToDb()
    const id = req.params.id
    if (!id) {
        res.status(400).json({
            error : "invalid id"
        })
        return await db.end();
    }
    
    const cipher = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_CRYPT || "dfahlkluh"
    );
    const vaidationResult = ValidateUserCreation(req.body)
     const user: ICreateUser = {
       email: req.body.email,
       name: req.body.name,
       status: req.body.status,
       password: cipher.toString(),
     };
    if (vaidationResult) {
        //update in db
        db.query("UPDATE users SET name = $1 , email = $2 , password = $3 , status = $4  WHERE id = $5;", [user.name , user.email , user.password , user.status , id], async(err, result) => {
            
            if (err) {
                res.status(400).json({
                  error: "email alredy in use",
                });
                return db.end();
            } else {
                res.status(200).json({
                    data : result.rowCount
                })
                return db.end();
            }
        })
    } else {
        res.status(400).json({
            error: "invalid data [email , name , password]",
        }); 
        return await db.end();
    }
    
}