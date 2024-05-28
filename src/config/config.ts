import { config as Conf } from "dotenv";
Conf();

const _config = {
  port: process.env.PORT || 3000,
  databaseURL: process.env.MONGO_URI,
};

export const config = Object.freeze(_config);
