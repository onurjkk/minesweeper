import Board from "./components/Board";
import Title from "./components/Title";


function App() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-950 py-10 text-slate-100">
      <Title />
      <Board />
    </div>
  )
}

export default App
