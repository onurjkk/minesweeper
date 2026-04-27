import Board from "./components/Board";
import Title from "./components/Title";


function App() {

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center gap-8">
        <Title />
        <Board />
      </div>
    </>
  )
}

export default App
