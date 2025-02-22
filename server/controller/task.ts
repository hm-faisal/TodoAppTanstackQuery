import { type NextFunction, type Request, type Response } from "express";
import { Db } from "mongodb";
import error from "../utils/error";
import {
  deleteTaskService,
  postTaskService,
  putTaskService,
} from "../service/task";

const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const db: Db | undefined = req.db;
  const { email } = req.params;
  if (!db) {
    throw error("Database connection error", 500);
  }

  try {
    const tasks = await db
      .collection("todos")
      .find({ userEmail: email })
      .toArray();

    const todo = tasks.filter((item) => item.category === "todo");
    const inprogress = tasks.filter((item) => item.category === "inProgress");
    const complete = tasks.filter((item) => item.category === "completed");

    res.status(200).json({
      todo: todo,
      inProgress: inprogress,
      completed: complete,
    });
  } catch (err) {
    next(err);
  }
};

const postTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const db: Db | undefined = req.db;
  if (!db) {
    throw error("Database connection error", 500);
  }

  try {
    const { title, description, category, email } = req.body;
    const createdTask = await postTaskService(
      db,
      title,
      description,
      category,
      email
    );
    res.status(201).json({ message: "Task created", ...createdTask });
  } catch (err) {
    next(err);
  }
};

const putTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const db: Db | undefined = req.db;
  if (!db) {
    throw error("Database connection error", 500);
  }

  try {
    const { id } = req.params;
    const { destCol: category } = req.body;

    const updateResult = await putTaskService(id, db, category);

    if (updateResult?.matchedCount === 0) {
      throw error("Task not found", 404);
    }

    res.status(200).json({ message: "Task updated successfully" });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const db: Db | undefined = req.db;
  if (!db) {
    throw error("Database connection error", 500);
  }

  try {
    const { id } = req.params;
    const deleteResult = await deleteTaskService(id, db);

    if (deleteResult?.deletedCount === 0) {
      throw error("Task not found", 404);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export { getTask, postTask, putTask, deleteTask };
