import { encryptPassword } from "./../utils/encrypt";
import { DataSource } from "typeorm";
import { UserInfo } from "../entity/user.entity";
import path from "path";

import * as dotenv from "dotenv";

const entitiesPath = path.join(__dirname, "../entity/**/*.{ts,js}");
const migrationPath = path.join(__dirname, "/migrations/*.{ts,js}");

dotenv.config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, NODE_ENV } =
  process.env;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: parseInt(DB_PORT || "5432"),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  ssl: false,
  synchronize: NODE_ENV === "dev" ? false : false,
  //
  //logging logs sql command on the treminal
  logging: NODE_ENV === "dev" ? false : false,
  // entities: [`${__dirname}**/entity/*.{ts,js}`],
  entities: [entitiesPath],
  // migrations: [`${__dirname}/**/migrations/*.{ts, js}`],
  migrations: [migrationPath],
  //   entities: [User],
  // migrations: [__dirname + "/migration/*.ts"],
  subscribers: [],
});
