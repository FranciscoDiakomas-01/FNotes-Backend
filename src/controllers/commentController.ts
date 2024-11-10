import { Request, Response } from "express";
import ConnectToDb from "../database/dbConnection";
import { ICreateComment } from "../types/types";
import getIdInToken from "../service/getIdInToken";
import validator from "validator";

export async function getAllComent(req: Request, res: Response) {
  const db = await ConnectToDb();
  const page: number = Number(req.query.page) || 1;
  const limit: number = Number(req.query.limit) || 10;
  const offset: number = (page - 1) * limit;
  const { rowCount } = await db.query("SELECT id FROM comment;");
  const laspage = Math.ceil(rowCount || 1 / limit);
  const { rows } = await db.query(
    "SELECT comment.content as commentContent , comment.id as commentId , to_char(comment.created_at , 'dd/mm/yyyy') as commentDate, comment.status as commentStatus , users.name as UserName , users.email as UserEmail , post.id as postId FROM comment INNER JOIN post ON comment.postid = post.id INNER JOIN users ON users.id = comment.userid  LIMIT $1 OFFSET $2;",
    [limit, offset]
  );
  res.status(200).json({
    data: rows,
    curresntPage: page,
    currentLimit: limit,
    total: rowCount,
    laspage,
  });
  return await db.end();
}

export async function getAllComentByPostId(req: Request, res: Response) {
  const db = await ConnectToDb();
  const page: number = Number(req.query.page) || 1;
  const limit: number = Number(req.query.limit) || 10;
  const postId: number = Number(req.params.id);
  const offset: number = (page - 1) * limit;
  const { rowCount } = await db.query("SELECT id FROM comment;");
  const laspage = Math.ceil(rowCount || 1 / limit);
  if (
    !validator.isNumeric(postId.toString()) ||
    !validator.isNumeric(limit.toString()) ||
    !validator.isNumeric(page.toString())
  ) {
    res.status(400).json({
      error: "postId , limit or page must be numeric",
    });
    return await db.end();
  }
  const { rows } = await db.query(
    "SELECT comment.content as commentContent , comment.id as commentId , to_char(comment.created_at , 'dd/mm/yyyy') as commentDate, comment.status as commentStatus , users.name as UserName , users.email as UserEmail , post.id as postId  FROM comment INNER JOIN post ON comment.postid = post.id INNER JOIN users ON users.id = comment.userid  WHERE post.id = $1 LIMIT $2 OFFSET $3;",
    [postId, limit, offset]
  );
  res.status(200).json({
    data:
      rows.length <= 0 ? "not found comment or postId doesn´t exists" : rows,
    curresntPage: page,
    currentLimit: limit,
    total: rowCount,
    laspage,
  });
  return await db.end();
}

export async function createComment(req: Request, res: Response) {
  const db = await ConnectToDb();
  //pegar o Id do usuario no token
  const userId = getIdInToken(req.headers["authorization"] || "");
  //verificar se existe um post pelo ID
  const { rows } = await db.query(
    "SELECT id FROM post WHERE id = $1 LIMIT 1;",
    [req.body?.postId]
  );
  if (rows[0]?.id) {
    //verificar se o usuario existe
    const { rows } = await db.query(
      "SELECT id FROM users WHERE id = $1 LIMIT 1;",
      [userId]
    );
    if (rows[0]?.id) {
      const comment: ICreateComment = {
        content: req.body?.content,
        postId: Number(req.body?.postId),
        userId: Number(userId),
      };
      //validar
      if (
        comment.content?.length > 0 &&
        comment.content?.length <= 200 &&
        comment.postId &&
        comment.userId
      ) {
        //cadastrar no db
        const { rows } = await db.query(
          "INSERT INTO comment(content , postid , userid) VALUES( $1 ,$2 ,$3) RETURNING id;",
          [comment.content, comment.postId, comment.userId]
        );
        res.status(201).json({
          data: rows,
        });
        return await db.end();
      } else {
        res.status(400).json({
          error: "content invalid , userId or postId",
        });
        return await db.end();
      }
    } else {
      res.status(400).json({
        error: "user not found",
      });
      return await db.end();
    }
  } else {
    res.status(400).json({
      error: "post not found",
    });
    return await db.end();
  }
}

export async function updateComment(req: Request, res: Response) {
  const db = await ConnectToDb();
  //pegar o Id do usuario no token
  const userId = getIdInToken(req.headers["authorization"] || "");
  //verificar se o id do criador é o mesmo com o id enviado
  const commetId = Number(req.params.id);
  const { rows } = await db.query("SELECT userid , id FROM comment WHERE userid = $1 and id = $2 LIMIT 1;",[userId, commetId]);
  if (rows[0]?.userid == userId && rows[0]?.id == commetId) {
    //se o id do criador for igual  e se o id passado for encotrado então deleta
    const { rowCount } = await db.query(
      "UPDATE comment SET content = $1 WHERE id = $2;",
      [req.body.content, req.params.id]
    );
    res.status(200).json({
      data: "upated",
    });
    return await db.end();
  } else {
    res.status(401).json({
      error: "comment not found",
    });
    return await db.end();
  }
}

export async function deleteComment(req: Request, res: Response) {
  const db = await ConnectToDb();
  //pegar o Id do usuario no token
  const userId = getIdInToken(req.headers["authorization"] || "");
  //se o userId for igual ao comment.userId entt pode eliminar
  const commetId = Number(req.params.id);
  const { rows } = await db.query(
    "SELECT userid , id FROM comment WHERE userid = $1 and id = $2 LIMIT 1;",
    [userId, commetId]
  );
  if (rows[0]?.userid == userId && rows[0]?.id == commetId) {
    //se o id do criador for igual  e se o id passado for encotrado então deleta
    const { rowCount } = await db.query(
      "DELETE FROM comment WHERE id = $1 and userid = $2;",
      [commetId, userId]
    );
    res.status(200).json({
      data: "deleted",
    });
    return await db.end();
  } else {
    res.status(401).json({
      error: "comment not found",
    });
    return await db.end();
  }
}