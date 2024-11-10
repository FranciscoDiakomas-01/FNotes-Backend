import {Response , Request} from 'express'
import ConnectToDb from '../database/dbConnection'
import { ICretaeCategory } from '../types/types'
import validator from 'validator'
import isAdmin from '../service/isAdmin'

export async function getAllCategory(req: Request, res: Response) {
    const db = await ConnectToDb()
    const page : number = Number(req.query.page) || 1
    const limit: number = Number(req.query.limit) || 10;
    const offset: number = (page - 1) * limit
    const { rowCount } = await db.query("SELECT id FROM category;")
    const lastPage = Math.ceil( rowCount || 1 / page)
    db.query("SELECT * FROM category LIMIT $1 OFFSET $2;", [limit, offset], async(err, result) => {
        if (err) {
            res.status(400).json({
                error : err.message
            })
            return await db.end()
        } else {
            res.status(200).json({
                data: result.rows,
                currentPage: page,
                currentLimit: limit,
                lastPage,
                totalCategory : rowCount
            })
        }
    })

}

export async function createCategory(req: Request, res: Response) {
    const db = await ConnectToDb()
    const isAdm = await isAdmin(req.headers["authorization"] || "");
    if (!isAdm) {
      res.status(400).json({
        error: "permition not allowed",
      });
      return await db.end();
    }
    const category: ICretaeCategory = {
        description: req.body.description,
        title: req.body.title,
        status : 1
    }
    if (category?.title?.length >= 1) {
        db.query("INSERT INTO category( description , title , status) VALUES( $1 , $2 , $3) RETURNING id;",[category.description, category.title , category.status],async (err, result) => {
            if (err) {
              res.status(400).json({
                error: 'category alrery exists' + err.message,
              });
              return await db.end();
            } else {
              res.status(201).json({
                data: result.rows,
              });
              return await db.end();
            }
          }
        );
    } else {
        res.status(400).json({
            error : 'invalid title'
        })
        return await db.end()
    }
    
}

export async function updateCategory(req: Request, res: Response) {
  const db = await ConnectToDb();
    const isAdm = await isAdmin(req.headers["authorization"] || "");
    if (!isAdm) {
      res.status(400).json({
        error: "permition not allowed",
      });
      return await db.end();
    }
  const category: ICretaeCategory = {
    description: req.body.description,
    title: req.body.title,
    status : Number(req.body.status)
  };
  if (category?.title?.length >= 1 && validator.isNumeric(req.params.id)) {
    db.query("UPDATE category SET description = $1 , title = $2 , status = $3  WHERE id = $4;",[category.description, category.title , category.status , req.params.id],async (err, result) => {
        if (err) {
          res.status(400).json({
            error: "category alrery exists",
          });
          return await db.end();
        } else {
          res.status(201).json({
            data: result.rowCount == 0 ? 'not found' : 'updated',
          });
          return await db.end();
        }
      }
    );
  } else {
    res.status(400).json({
      error: "invalid title , status or id",
    });
    return await db.end();
  }
}
export async function getCategoryById(req: Request, res: Response) {
    const db = await ConnectToDb()
    const id : number = Number(req.params.id)
    if (id) {
      db.query( "SELECT * FROM category WHERE id = $1 LIMIT 1;",[id], async (err, result) => {
          if (err) {
            res.status(400).json({
              error: err.message,
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
        error: "invalid id",
      });
      return await db.end();
    }
    
}


export async function deleteCategory(req: Request, res: Response) {
  const db = await ConnectToDb();
    const isAdm = await isAdmin(req.headers["authorization"] || "");
    if (!isAdm) {
      res.status(400).json({
        error: "permition not allowed",
      });
      return await db.end();
    }
  const id: number = Number(req.params.id);
  if (id) {
    db.query("DELETE FROM category WHERE id = $1;",[id],async (err, result) => {
        if (err) {
          res.status(400).json({
            error: err.message,
          });
          return await db.end();
        } else {
          res.status(200).json({
            data: result.rowCount == 0 ? 'not found' : 'deleted',
          });
          return await db.end();
        }
      }
    );
  } else {
    res.status(400).json({
      error: "invalid id",
    });
    return await db.end();
  }
}

