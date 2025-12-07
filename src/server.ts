import app from "./app";
import config from "./config";
import initDB from "./config/db";

initDB();

app.listen(config.port, () => {
  console.log(`Server is running at port ${config.port}`);
});
