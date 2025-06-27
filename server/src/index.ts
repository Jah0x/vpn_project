import { app } from "./server";

const PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 4000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
