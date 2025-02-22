import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaRegTrashAlt } from "react-icons/fa";
import AddModal from "./components/Modal";
import useAuth from "./hooks/useAuth";
import LoadingSkeleton from "./components/Loading";
import LoginPage from "./components/SignIn";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const baseURL = "http://localhost:5000/task";

const TodoApp = ({ email }) => {
  const { loading, user } = useAuth();
  const [addModelData, setAddModelData] = useState("");
  const [addModelClose, setAddModelClose] = useState(true);
  const [updateTaskInfo, setUpdateTaskInfo] = useState({});
  const [tasks, setTasks] = useState({});

  const {
    data = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["task", email],
    queryFn: async () => {
      const { data } = await axios.get(`${baseURL}/${email}`);
      return data;
    },
  });
  useEffect(() => {
    setTasks(data);
  }, [data]);

  useEffect(() => {
    if (!updateTaskInfo.id) {
      return;
    }
    axios.put(`${baseURL}/${updateTaskInfo?.id}`, updateTaskInfo);
    refetch();
  }, [updateTaskInfo]);

  useEffect(() => {
    if (!addModelData) {
      return;
    }
    axios.post(`${baseURL}/`, { ...addModelData, email }).then((res) => {
      if (res.data.insertedId) {
        refetch();
      }
    });
  }, [addModelData]);

  if (isLoading) return <LoadingSkeleton />;

  const openAddModal = () => {
    setAddModelClose(false);
  };

  const deleteTodos = (id) => {
    axios.delete(`${baseURL}/${id}`).then((res) => {
      if (res) {
        refetch();
      }
    });
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return; // Drop outside of the list

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    // Copy current column tasks
    const updatedTasks = { ...tasks };

    if (sourceCol === destCol) {
      // Reorder items within the same column
      const columnItems = Array.from(updatedTasks[sourceCol]);
      const [movedItem] = columnItems.splice(source.index, 1); // Remove item
      columnItems.splice(destination.index, 0, movedItem); // Insert at new position

      updatedTasks[sourceCol] = columnItems;
    } else {
      // Moving across different columns
      const sourceItems = Array.from(updatedTasks[sourceCol]);
      const destItems = Array.from(updatedTasks[destCol]);

      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);

      updatedTasks[sourceCol] = sourceItems;
      updatedTasks[destCol] = destItems;

      setUpdateTaskInfo({ id: movedItem._id, sourceCol, destCol });
      setTasks(updatedTasks);
    }
  };

  if (!user) {
    return <LoginPage />;
  }
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <AddModal
        close={addModelClose}
        setClose={setAddModelClose}
        setModelData={setAddModelData}
      />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 mt-4  max-w-11/12 mx-auto">
          {Object.keys(tasks).map((columnKey) => (
            <Droppable key={columnKey} droppableId={columnKey}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-1/3 p-4 bg-gray-100 rounded-lg"
                >
                  <h2 className="text-lg font-bold mb-2 flex justify-between items-center">
                    {columnKey.toUpperCase()}
                    <span>
                      <button
                        type="button"
                        onClick={() => {
                          openAddModal();
                        }}
                      >
                        +
                      </button>
                    </span>
                  </h2>
                  {tasks[columnKey].map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-2 bg-white rounded shadow mb-2 flex justify-between items-center"
                        >
                          <span>{task.title}</span>
                          <span className="space-x-2">
                            <button
                              type="button"
                              onClick={() => deleteTodos(task._id)}
                            >
                              <FaRegTrashAlt />
                            </button>
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </>
  );
};

export default TodoApp;
