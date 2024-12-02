import {Response , Request} from 'express'
import ConnectToDb from '../database/dbConnection'
import { ICretaeCategory } from '../types/types'
import validator from 'validator'
import isAdmin from '../service/isAdmin'
const db =  ConnectToDb;
export async function getAllCategory(req: Request, res: Response) {
    
    
    const limit: number = Number(req.query.limit) || 10;
    const page: number = Number(req.query.page) || 1;
    const offset: number = (page - 1) * limit;
    const { rowCount } = await db.query("SELECT id FROM category ;");
    const lastPage = Math.ceil(Number(rowCount) / limit);
    db.query("SELECT id , title , description , to_char(created_at , 'dd/mm/yyyy') as created_at FROM category  ORDER BY id DESC LIMIT $1 OFFSET $2;" , [limit , offset],  async(err, result) => {
      if (err) {
             res.status(400).json({
              error: err.message,
             });
        return;
            
        } else {
             res.status(200).json({
              data: result.rows,
              currentPage: page,
              lastPage,
              total: rowCount,
             });
        
          return;
        }
    })

}

export async function createCategory(req: Request, res: Response) {
    const isAdm = await isAdmin(req.headers["authorization"] || "");
  if (!isAdm) {
       res.status(400).json({
        error: "permition not allowed",
       });
    return;
    }
    const category: ICretaeCategory = {
        description: req.body.description,
        title: req.body.title,
        status : 1
    }
    if (category?.title?.length >= 1) {
        db.query("INSERT INTO category( description , title , status) VALUES( $1 , $2 , $3) RETURNING id;",[category.description, category.title , category.status],async (err, result) => {
          if (err) {
              return res.status(400).json({
                error: "category alrery exists",
              });
            } else {
              return res.status(201).json({
                data: result.rows,
              });
            }
          }
        );
    } else {
        return res.status(400).json({
          error: "invalid title",
        });
    }
    
}

export async function updateCategory(req: Request, res: Response) {
    const isAdm = await isAdmin(req.headers["authorization"] || "");
    if (!isAdm) {
      return res.status(400).json({
        error: "permition not allowed",
      });
    }
  const category: ICretaeCategory = {
    description: req.body.description,
    title: req.body.title,
    status : Number(req.body.status)
  };
  if (category?.title?.length >= 1 && validator.isNumeric(req.params.id)) {
    db.query("UPDATE category SET description = $1 , title = $2  WHERE id = $3;",[category.description, category.title , req.params.id],async (err, result) => {
        if (err) {
          return res.status(400).json({
            error: "category alrery exists",
          });
        } else {
          return res.status(201).json({
            data: result.rowCount == 0 ? "not found" : "updated",
          });
          
        }
      }
    );
  } else {
    return res.status(400).json({
      error: "invalid title , status or id",
    });
  }
}
export async function getCategoryById(req: Request, res: Response) {
    const id : number = Number(req.params.id)
    if (id) {
      db.query("SELECT * FROM category WHERE id = $1 LIMIT 1;", [id], async (err, result) => {
          if (err) {
            return res.status(400).json({
              error: err.message,
            });
          } else {
            return res.status(200).json({
              data: result.rows,
            });
          }
        }
      );
    } else {
      return res.status(400).json({
        error: "invalid id",
      });
    }
    
}


export async function deleteCategory(req: Request, res: Response) {
    const isAdm = await isAdmin(req.headers["authorization"] || "");
    if (!isAdm) {
      return res.status(400).json({
        error: "permition not allowed",
      });
      
    }
  const id: number = Number(req.params.id);
  if (id) {
    db.query("DELETE FROM category WHERE id = $1;", [id], async (err, result) => {
        if (err) {
          return res.status(400).json({
            error: err.message,
          });
        } else {
          return res.status(200).json({
            data: result.rowCount == 0 ? "not found" : "deleted",
          });
        }
      }
    );
  } else {
    return res.status(400).json({
      error: "invalid id",
    });
  }
}