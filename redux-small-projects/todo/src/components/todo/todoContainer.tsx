import { useState } from "react";
import TodoCard from "./todoCard";
import TodoFilter from "./todoFilter";
import AddTodoModel from "./addTodoModel";
import { useAppDispatch } from "@/redux/hooks";
import { useGetTodosQuery } from "@/redux/api/api";

const TodoContainer = () => {
  //   const [todos, setTodos] = useState({ data: [] });

  const { data: todos, isLoading, isError } = useGetTodosQuery(undefined);

  //   const { todos } = useAppDispatch((state) => state.todos);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="flex justify-between mb-5 ">
        <AddTodoModel />
        <TodoFilter />
      </div>
      <div className="bg-primary-gradient w-full h-full rounded-xl  p-[5px]">
        <div className="bg-white p-5 w-full h-full rounded-lg space-y-3">
          {todos?.data?.map((item: any) => (
            <TodoCard {...item} />
          ))}
        </div>
        {/* <div className="bg-white text-2xl font-bold p-5 flex justify-center items-center rounded-md">
          <p>There is no task pending</p>{' '}
        </div> */}
      </div>
    </div>
  );
};

export default TodoContainer;
