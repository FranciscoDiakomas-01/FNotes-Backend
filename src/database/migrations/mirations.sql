BEGIN;
/*
 criação da tabela usuarios
*/
CREATE TABLE IF NOT EXISTS users (
    id serial NOT NULL PRIMARY KEY,
    name varchar(20) NOT NULL,
    email varchar(40) NOT NULL UNIQUE,
    password text not null ,
    status smallint DEFAULT 0,
    created_at timestamp default now(),
    permistion smallint default 2,
    profile text
);

/*
 criação da tabela categoria de postagens
*/
CREATE TABLE IF NOT EXISTS category(
    id serial not null primary key,
    title varchar(50) not null unique,
    description text check(length(description) <= 200),
    created_at timestamp default now(),
    status int not null default 1
);

/*
 criação da tabela postagens
*/
CREATE TABLE IF NOT EXISTS post(
    id serial not null primary key,
    title varchar(50) not null unique,
    cover text,
    description text check(length(description) <= 200),
    categoryId int not null references category(id) on delete cascade,
    status int not null default 1,
    created_at timestamp not null default now()
);

/*
 criação da tabela comentarios
*/
CREATE TABLE IF NOT EXISTS comment(
    id serial not null primary key,
    content text check(length(content) <= 200),
    userId int not null references users(id) on delete cascade,
    postId int not null references post(id) on delete cascade,
    status int not null default 2,
    created_at date not null default current_date
);

COMMIT ;