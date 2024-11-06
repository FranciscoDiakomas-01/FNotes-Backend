CREATE TABLE IF NOT EXISTS post(
    id serial not null primary key,
    title varchar(50) not null,
    cover text,
    description text check(length(description) <= 200),
    categoryId int not null references category(id)
);