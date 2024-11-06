CREATE TABLE IF NOT EXISTS comment(
    id serial not null primary key,
    content text check(length(content) <= 200),
    userId int not null references users(id),
    postId int not null references post(id),
    status int not null default 2,
    created_at date not null default current_date
);