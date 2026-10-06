-- Approximate location for the map search.
-- No Hebrew text here.
alter table posts add column if not exists lat double precision;
alter table posts add column if not exists lng double precision;

-- sample listings (fixed ids from migration 004), neighborhood-level coordinates
update posts set lat = 32.0575, lng = 34.7700 where id = 'b0000000-0000-4000-8000-000000000001';
update posts set lat = 31.7710, lng = 35.1990 where id = 'b0000000-0000-4000-8000-000000000002';
update posts set lat = 32.8070, lng = 34.9960 where id = 'b0000000-0000-4000-8000-000000000003';
update posts set lat = 31.2560, lng = 34.7950 where id = 'b0000000-0000-4000-8000-000000000004';
update posts set lat = 32.0830, lng = 34.8030 where id = 'b0000000-0000-4000-8000-000000000005';
update posts set lat = 32.1640, lng = 34.8330 where id = 'b0000000-0000-4000-8000-000000000006';
update posts set lat = 32.1050, lng = 35.1700 where id = 'b0000000-0000-4000-8000-000000000007';
update posts set lat = 32.0870, lng = 34.8740 where id = 'b0000000-0000-4000-8000-000000000008';
update posts set lat = 32.3250, lng = 34.8560 where id = 'b0000000-0000-4000-8000-000000000009';
update posts set lat = 31.9740, lng = 34.8000 where id = 'b0000000-0000-4000-8000-000000000010';
