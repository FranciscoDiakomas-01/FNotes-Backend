CREATE TABLE IF NOT EXISTS adminuser (
    id serial NOT NULL PRIMARY KEY,
    name varchar(20) NOT NULL,
    email varchar(40) NOT NULL UNIQUE,
    password text not null ,
    created_at timestamp default now()
);