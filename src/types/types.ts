
//createUser
export interface ICreateUser {
    name: string,
    email: string,
    status: number
    password: string
}

//createAdmin
export interface IcreateAdmin {
  name: string;
  email: string;
  status: number;
  password: string;
}

//createCategory

export interface ICretaeCategory {
  title: string;
  description: string,
  status : number
}

//createPost

export interface ICreatePost {
  title: string,
  description: string,
  categoryId: number,
  cover: string,
  status ? : number | string
}

//login
export interface ILogin {
  email: string,
  password : string
}

//comment

export interface ICreateComment {
  content: string,
  postId: number,
  userId: number,
}