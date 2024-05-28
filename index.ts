import app from "./src/app";
import { config } from "./src/config/config";

const startServer = () => {
  const Port = config.port || 3000;
  app.listen(Port, () => {
    console.log(`server is running on port ${Port}`);
  });
};

startServer();
