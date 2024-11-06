CREATE TABLE IF NOT EXISTS category(
    id serial not null primary key,
    title varchar(50) not null,
    description text check(length(description) <= 200),
    created_at timestamp default now()
);