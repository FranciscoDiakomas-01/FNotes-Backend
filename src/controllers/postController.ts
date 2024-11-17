import ConnectToDb from "../database/dbConnection";
import dotenv from "dotenv";
import { ICreatePost } from "../types/types";
import { Request, Response } from "express";
import validatePost from "../service/validatePost";
import { DeleteFile, getAndDeleteFileById } from "../service/deleFileAfterPOst";
import verifyCategory from "../service/verifyCategoryPost";
import validator from "validator";
import isAdmin from "../service/isAdmin";
dotenv.config();

export async function getAllPost(req: Request, res: Response) {
  const db = await ConnectToDb();
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const offset: number = (page - 1) * limit;
  const { rowCount } = await db.query("SELECT id FROM post");
  const lastPage = Math.ceil(rowCount / limit);
  db.query("SELECT post.cover , post.id as postid, post.status as poststatus, post.title , post.description , to_char(post.created_at , 'dd/mm/yyyy') as created_at , category.title as categoryTitle , category.id as categoryId FROM post  JOIN category on post.categoryid = category.id WHERE post.categoryid = category.id LIMIT $1 OFFSET $2 ;",
    [limit , offset],
    async (err, result) => {
      if (err) {
        res.status(400).json({
          error: err.message,
        });
        return await db.end();
      } else {
        res.status(200).json({
          data: result.rows,
          lastPage,
          currentPage: page,
          currentLimt: limit,
          total: rowCount,
        });
        return await db.end();
      }
    }
  );
}


export async function createPost(req: Request, res: Response) {
  const db = await ConnectToDb();
  const isAdm = await isAdmin(req.headers["authorization"] || "");
    if (!isAdm) {
      res.status(400).json({
        error: "permition not allowed",
      });
      return await db.end();
  }

  const serverPath = process.env.SERVER_PATH || "http://localhost:8080/";
  const post: ICreatePost = {
    categoryId: req.body.categoryId,
    cover: serverPath + req.file?.filename,
    description: req.body.description,
    title: req.body.title,
  };
  const valiationResult = validatePost(post);
  const categoryvalidation = await verifyCategory(db, post.categoryId);
  if (valiationResult && categoryvalidation) {
    //insert into database
    db.query("INSERT INTO post(title , description , categoryId , cover) VALUES( $1 , $2 , $3 , $4) RETURNING id;",
      [post.title, post.description, post.categoryId, post.cover],
      async (err, result) => {
        if (err) {
          res.status(400).json({
            error: err.message,
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
    const del = await DeleteFile(req.file?.path || "");
    res.status(400).json({
      error: "inavlid post or catgory doesn´t exists!",
    });
    return await db.end();
  }
}

export async function getPostByID(req: Request, res: Response) {
  const db = await ConnectToDb();
  const id = req.params.id;
  if (!validator.isNumeric(id)) {
    res.status(400).json({
      error: "invalid id",
    });
    return await db.end();
  }
  db.query("SELECT post.cover , post.id , post.status , post.title , post.description , to_char(post.created_at , 'dd/mm/yyyy') as created_at , category.title as categoryTitle , category.id as categoryId FROM post JOIN category on post.categoryid = category.id WHERE post.id = $1 and  post.categoryid = category.id LIMIT 1;",
    [id],
    async (err, result) => {
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
}

export async function deletePostById(req: Request, res: Response) {
  const db = await ConnectToDb();
    const isAdm = await isAdmin(req.headers["authorization"] || "");
    if (!isAdm) {
      res.status(400).json({
        error: "permition not allowed",
      });
      return await db.end();
    }
  const id = req.params.id;
  if (!validator.isNumeric(id)) {
    res.status(400).json({
      error: "invalid id",
    });
    return await db.end();
  } else {
    await getAndDeleteFileById(id, db);
    db.query("DELETE FROM post WHERE id = $1;", [id], async (err, result) => {
      //deletar todos os comentarios deste post tambem
      if (err) {
        res.status(400).json({
          error: err.message,
        });
        return await db.end();
      } else {
        res.status(200).json({
          data: result.rowCount == 0 ? "not found" : "deleted",
        });
        return await db.end();
      }
    });
  }
}


export async function updatePost(req: Request, res: Response) {
  const db = await ConnectToDb();
  const id = req.params.id;
    const isAdm = await isAdmin(req.headers["authorization"]);
    if (!isAdm) {
      res.status(400).json({
        error: "permition not allowed",
      });
    }
  const serverPath = process.env.SERVER_PATH;
  const post: ICreatePost = {
    categoryId: req.body.categoryId,
    cover: req.file != undefined || req.file != null ? serverPath + req.file?.filename : req.body.file,
    description: req.body.description,
    title: req.body.title,
  };
  if (!validator.isNumeric(id)) {
    res.status(400).json({
      error: "invalid id",
    });
    return await db.end();
  } else {
    
    //validar se o post e a category corresponde com os termos
    const valiationResult = validatePost(post);
    const categoryvalidation = await verifyCategory(db, post.categoryId);
    //verificar se existe esse post , caso n exista elimine o arquivo que foi enviado
    //caso a validacao , a categoria ou o post não existe elimine o arquivo submetido
    const { rows } = await db.query("SELECT id FROM post WHERE id = $1 LIMIT 1;", [id])
    if (rows[0]?.id == undefined || !valiationResult || !categoryvalidation) {
        await db.end();
        await DeleteFile(req.file?.path);
        res.status(400).json({
            error : "post not found ,invalid body or category not found" 
        })
        return 
    }
    //caso tenha um arquivo novo post sera eliminado o arquivo que estava lá caso exista
    if (req.file != undefined || req.file != null) {
      await getAndDeleteFileById(id, db);
    }
    if (valiationResult && categoryvalidation) {
    //update post by Id
    db.query("UPDATE  post SET title = $1 , description = $2 , categoryId = $3 , cover = $4  WHERE id = $5;",[post.title, post.description, post.categoryId, post.cover , id],async (err, result) => {
        if (err) {
            res.status(400).json({
                error: err.message,
            });
            return await db.end();
        } else {
            res.status(201).json({
                data: result.rowCount == 0 ? 'not found' : 'updated' ,
            });
            return await db.end();
        }
        }
      );
    } else {
    
      res.status(400).json({
        error: "invalid post or category does´nt exists",
      });
    }
  }
}


export async function getPostByCategoryId(req: Request, res: Response) {
  const db = await ConnectToDb();
  const id = req.params.id;
  if (!validator.isNumeric(id)) {
    res.status(400).json({
      error: "invalid id",
    });
    return await db.end();
  }
  db.query(
    "SELECT post.cover , post.id , post.status , post.title , post.description , to_char(post.created_at , 'dd/mm/yyyy') as created_at , category.title as categoryTitle , category.id as categoryId FROM post JOIN category on post.categoryid = category.id WHERE post.categoryid = $1;",
    [id],
    async (err, result) => {
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
}
