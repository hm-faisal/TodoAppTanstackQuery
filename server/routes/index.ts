import { Router } from "express";
import auth from "./auth";
import task from "./task";
import authenticate from "../middlewire/auth";

const routes = Router();

routes.get("/", (req, res) => {
  res.send("App running Successfully");
});

routes.use("/auth", auth);
routes.use("/task", task);

export default routes;
