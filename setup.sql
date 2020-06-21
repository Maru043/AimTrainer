drop table records;

create table records
(
    id serial primary key,
    userName text,
    score integer,
    accuracy double precision
)