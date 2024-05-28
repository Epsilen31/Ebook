import { config as Conf } from "dotenv";
Conf();

const _config = {
  port: process.env.PORT || 3000,
};

export const config = Object.freeze(_config);
