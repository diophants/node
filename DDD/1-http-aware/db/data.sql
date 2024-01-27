INSERT INTO "users" ("login", "password") VALUES 
  ('admin', 'xkBaB29tzhgKCOa86iBJrA==:NEYmWWjU9oORZ7JOE4uELWQiUu4/MSpL3ybEV8Iwz39+lI+mDhaok0krN1pKQWfQfoVNzBa57F1020njPI4eSQ=='),
  ('diophant', 'tpDsUjmTVao5+HH+Vh3L8g==:qslE0EeXZzHMqecYGfSEDYkFFQ6EBithTgi/r3vso7O8JXZPpwmFddz1nOTgSHVSbVEu65Tvh+QHG5m0f3lWpA=='),
  ('user', 'jv/nOhkORj+WOc9TYHD7iQ==:b1V0L3g4THIqRYMWGWNQpxiGx97CRiE3TqRJ961UToUm3vjLTv8sKFqWSlSDesW54qx9ZF+/LZm79qNisxJQhQ=='),
  ('vasya', 'riT2AogySHr/+BqRTQhHpA==:LXAcm6aupOE3kuEu+sVHgE2+BI8tp25J+hLO3gPLpYa7Ei4SPzodZvUWIuMzW0LtwVnuCf+025vwWscEyA6QjA==');

-- admin/root
-- diophant/diophant
-- user/password
-- vasya/world_tanks

INSERT INTO "country" ("name") VALUES
  ('Japan'),
  ('United States'),
  ('Cuba'),
  ('France'),
  ('Russia');

INSERT INTO "city" ("name", "country") VALUES
 ('Tokyo', 1),
 ('Saint Petersburg', 5),
 ('Paris', 4),
 ('San Francisco', 2),
 ('Krasnodar', 5),
 ('Santa Carla', 3),
 ('Now Youk', 2);