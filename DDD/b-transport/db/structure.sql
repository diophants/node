CREATE TABLE users (
  "id" bigint generated always as identity,
  "login" varchar NOT NULL,
  "password" varchar NOT NULL
);
ALTER TABLE "users" ADD CONSTRAINT pkUsers PRIMARY KEY ("id");
CREATE UNIQUE INDEX akUsersLogin ON "users" ("login");

CREATE TABLE session (
  "id" bigint generated always as identity,
  "user" integer NOT NULL,
  "token" varchar(64) NOT NULL,
  "ip" varchar(45) NOT NULL,
  "data" text
);
ALTER TABLE "session" ADD CONSTRAINT pkSession PRIMARY KEY ("id");
CREATE UNIQUE INDEX akSessionToken ON "session" ("token");
ALTER TABLE "session" ADD CONSTRAINT fkSessionUserId FOREIGN KEY ("user") REFERENCES "users" ("id") ON DELETE CASCADE;

CREATE TABLE country (
  "id" serial NOT NULL,
  "name" varchar(64) NOT NULL
);
ALTER TABLE "country" ADD CONSTRAINT pkCountry PRIMARY KEY ("id");
CREATE UNIQUE INDEX akCountryName ON "country" ("name");

CREATE TABLE city (
  "id" serial NOT NULL,
  "name" varchar(64) NOT NULL,
  "country" integer NOT NULL
);
ALTER TABLE "city" ADD CONSTRAINT pkCity PRIMARY KEY ("id");
CREATE UNIQUE INDEX akCityName ON "city" ("name");
ALTER TABLE "city" ADD CONSTRAINT fkCityNameCountry FOREIGN KEY ("country") REFERENCES "country" ("id") ON DELETE CASCADE; 