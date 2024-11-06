CREATE TABLE IF NOT EXISTS users (
    id serial NOT NULL PRIMARY KEY,
    name varchar(20) NOT NULL,
    email varchar(40) NOT NULL UNIQUE,
    password text not null ,
    status smallint DEFAULT 0,
    created_at timestamp default now()
);