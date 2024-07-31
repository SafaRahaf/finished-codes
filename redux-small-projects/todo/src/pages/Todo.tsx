import TodoContaner from "@/components/todo/todoContainer";
// import { Button } from "@/components/ui/button";

const Todo = () => {
  return (
    <div>
      <h1 className="text-center text-3xl font-semibold my-10 ">Todo List</h1>
      <TodoContaner />
    </div>
  );
};

export default Todo;

// <div className="p-4 w-8/12 flex-row border bottom-2 border-black bg-pink-300 rounded-md">
//   <title className="flex justify-center pb-2 font-medium text-white">
//     TODO LIST
//   </title>
//   <div className="flex flex-row">
//     <input
//       type="text"
//       placeholder="Add new task"
//       className="w-full p-2 rounded-md"
//     />
//     <button className="p-1 bg-slate-800 text-white text-2xl rounded-md w-12 ml-2">
//       +
//     </button>
//   </div>
//   <div className="flex">
//     <input type="text" className="w-full p-2 rounded-md mt-3 mr-2" />
//     <div className="flex space-x-2 pt-3">
//       <Button>edit</Button>
//       <Button>delete</Button>
//     </div>
//   </div>
// </div>
