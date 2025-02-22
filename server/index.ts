import "dotenv/config";
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Db } from "mongodb";
import routes from "./routes";
import connectDB from "./db";
import { type CustomError } from "./utils/error";
import cors from "cors";

// types/express.d.ts
declare module "express-serve-static-core" {
  interface Request {
    db?: Db;
  }
}

const app: Application = express();
const port = process.env.PORT || 5000;

async function startServer() {
  const db = await connectDB();

  // Middleware
  app.use(express.json());
  app.use(
    cors({
      origin: "*",
      methods: "GET,POST,PUT,DELETE",
      allowedHeaders: "Content-Type,Authorization",
    })
  );

  // Inject `db` into routes
  app.use((req, _res, next) => {
    req.db = db;
    next();
  });

  // Routes
  app.use(routes);

  // Global error handler
  app.use(
    (err: CustomError, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || 500;
      const message = err.message || "Something went wrong";
      res.status(status).json({ message, success: false });
    }
  );

  app.listen(port, () => console.log(`🚀 TO-DO app running on port ${port}`));
}

startServer();
