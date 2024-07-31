import "./App.css";
import {
  decrement,
  increment,
  incrementByValue,
  decrementByValue,
} from "./redux/features/counterSlice";
import { useAppDispatch, useAppSelector } from "./redux/hook";

function App() {
  const count = useAppSelector((state) => state.counter.count);
  const dispatch = useAppDispatch();

  return (
    <div className="h-screen w-full flex justify-center items-center border-purple-300">
      <div className="flex border border-purple-300 rounded-md bg-slate-50 p-10">
        <input
          type="number"
          className="bg-slate-200 rounded-md mr-3 border-2 border-red-900 p-3 w-20"
        ></input>
        <button
          onClick={() => dispatch(incrementByValue(5))}
          className="px-3 py-2 rounded-md bg-cyan-700 text-xl font-semibold text-white mr-3"
        >
          Increment by 5
        </button>
        <button
          onClick={() => dispatch(increment())}
          className="px-3 py-2 rounded-md bg-lime-500 text-xl font-semibold text-white"
        >
          Increment
        </button>
        <button className="text-3xl mx-10">{count}</button>
        <input
          type="number"
          className="bg-slate-200 rounded-md mr-3 border-2 border-blue-900 p-3 w-20"
        ></input>
        <button
          onClick={() => dispatch(decrement())}
          className="px-3 py-2 rounded-md bg-red-500 text-xl font-semibold text-white"
        >
          Decrement
        </button>
        <button
          onClick={() => dispatch(decrementByValue(5))}
          className="px-3 py-2 ml-3 rounded-md bg-pink-500 text-xl font-semibold text-white"
        >
          Decrement by 5
        </button>
      </div>
    </div>
  );
}

export default App;
