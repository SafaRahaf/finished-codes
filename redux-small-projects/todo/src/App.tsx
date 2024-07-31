import Todo from "./pages/Todo";
import { useAppDispatch } from "./redux/hooks";

function App() {
  const dispatch = useAppDispatch();

  return (
    // <div className="h-screen w-full justify-center flex items-center">
    <div>
      <Todo />
    </div>
  );
}

export default App;
