import error from "../utils/error";
import { Db, ObjectId } from "mongodb";

const postTaskService = (
  db: Db | undefined,
  title: string,
  description: string,
  category: string,
  email: string
) => {
  if (!title || !description || !category) {
    throw error("Invalid input data", 400);
  }

  return db
    ?.collection("todos")
    .insertOne({ title, description, category, userEmail: email });
};

const putTaskService = (id: string, db: Db | undefined, category: string) => {
  if (!ObjectId.isValid(id)) {
    throw error("Invalid task ID", 400);
  }

  return db
    ?.collection("todos")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { category: category } },
      { upsert: false }
    );
};

const deleteTaskService = (id: any, db: Db | undefined) => {
  if (!ObjectId.isValid(id)) {
    throw error("Invalid task ID", 400);
  }

  return db?.collection("todos").deleteOne({ _id: new ObjectId(id) });
};

export { postTaskService, putTaskService, deleteTaskService };
