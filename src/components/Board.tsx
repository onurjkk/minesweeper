import { useEffect, useState } from "react";
import {
    DIFFICULTIES,
    chord,
    countFlags,
    createBoard,
    formatTime,
    hasWon,
    placeMines,
    reveal,
    revealAllMines,
    toggleFlag,
    type Board as BoardData,
    type Difficulty,
    type GameStatus,
} from "../game/minesweeper";
import Cell from "./Cell";

const BEST_TIMES_STORAGE_KEY = "minesweeper:best-times";

function readBestTimes(): Record<string, number> {
    try {
        const stored = window.localStorage.getItem(BEST_TIMES_STORAGE_KEY);
        if (!stored) return {};
        return JSON.parse(stored) as Record<string, number>;
    } catch {
        return {};
    }
}

export default function Board() {
    const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[0]);
    const [board, setBoard] = useState<BoardData>(() => createBoard(DIFFICULTIES[0]));
    const [status, setStatus] = useState<GameStatus>("ready");
    const [seconds, setSeconds] = useState(0);
    const [exploded, setExploded] = useState<{ row: number; column: number } | null>(null);
    const [bestTimes, setBestTimes] = useState<Record<string, number>>(readBestTimes);
    const [newRecord, setNewRecord] = useState(false);

    const gameOver = status === "won" || status === "lost";
    const minesLeft = difficulty.mines - countFlags(board);
    const bestTime = bestTimes[difficulty.id];
    const face = status === "won" ? "😎" : status === "lost" ? "😵" : "🙂";

    useEffect(() => {
        if (status !== "playing") return;
        const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
        return () => window.clearInterval(id);
    }, [status]);

    const saveBestTime = (time: number) => {
        const current = bestTimes[difficulty.id];
        if (current !== undefined && current <= time) return;

        const next = { ...bestTimes, [difficulty.id]: time };
        setBestTimes(next);
        try {
            window.localStorage.setItem(BEST_TIMES_STORAGE_KEY, JSON.stringify(next));
        } catch {
            // Storage can be unavailable (private mode): the time is kept in memory only.
        }
    };

    const startNewGame = (nextDifficulty: Difficulty = difficulty) => {
        setDifficulty(nextDifficulty);
        setBoard(createBoard(nextDifficulty));
        setStatus("ready");
        setSeconds(0);
        setExploded(null);
        setNewRecord(false);
    };

    const finishTurn = (
        nextBoard: BoardData,
        explodedCell: { row: number; column: number } | null,
    ) => {
        if (explodedCell) {
            setBoard(revealAllMines(nextBoard));
            setExploded(explodedCell);
            setStatus("lost");
            return;
        }

        setBoard(nextBoard);
        if (status === "ready") setStatus("playing");

        if (hasWon(nextBoard)) {
            const previous = bestTimes[difficulty.id];
            setNewRecord(previous === undefined || seconds < previous);
            saveBestTime(seconds);
            setStatus("won");
        }
    };

    const handleReveal = (row: number, column: number) => {
        if (gameOver) return;

        const cell = board[row][column];

        // Clicking a revealed number opens the neighbors when all its mines are flagged.
        if (cell.revealed) {
            const result = chord(board, row, column);
            if (result.board === board) return;
            finishTurn(result.board, result.exploded);
            return;
        }

        if (cell.flagged) return;

        const prepared =
            status === "ready" ? placeMines(board, difficulty.mines, row, column) : board;
        const result = reveal(prepared, row, column);
        finishTurn(result.board, result.exploded);
    };

    const handleToggleFlag = (row: number, column: number) => {
        if (gameOver) return;
        setBoard((current) => toggleFlag(current, row, column));
    };

    return (
        <div className="flex w-full max-w-3xl flex-col items-center gap-4 px-4">
            <div className="flex w-full flex-wrap items-center justify-center gap-2">
                {DIFFICULTIES.map((option) => {
                    const active = option.id === difficulty.id;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => startNewGame(option)}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                active
                                    ? "border-emerald-400 bg-emerald-400/15 text-emerald-300"
                                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
                            }`}
                        >
                            {option.label} · {option.columns}×{option.rows} · {option.mines}💣
                        </button>
                    );
                })}
            </div>

            <div className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-slate-100 shadow-lg">
                <span className="font-mono text-lg">🚩 {minesLeft}</span>
                <button
                    type="button"
                    onClick={() => startNewGame()}
                    title="New game"
                    aria-label="New game"
                    className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 text-xl transition hover:bg-slate-700 active:scale-95"
                >
                    {face}
                </button>
                <span className="font-mono text-lg">⏱️ {formatTime(seconds)}</span>
            </div>

            <div className="max-w-full overflow-x-auto p-1">
                <div className="relative overflow-hidden rounded-md border border-slate-800 shadow-2xl">
                    <div
                        className="grid bg-slate-900"
                        style={{ gridTemplateColumns: `repeat(${difficulty.columns}, 40px)` }}
                    >
                        {board.map((row, r) =>
                            row.map((cell, c) => (
                                <Cell
                                    key={`${r}-${c}`}
                                    cell={cell}
                                    exploded={exploded?.row === r && exploded?.column === c}
                                    lost={status === "lost"}
                                    gameOver={gameOver}
                                    onReveal={() => handleReveal(r, c)}
                                    onToggleFlag={() => handleToggleFlag(r, c)}
                                />
                            )),
                        )}
                    </div>

                    {gameOver && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 p-4">
                            <div className="flex max-w-full flex-col items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/95 px-6 py-6 text-center text-slate-100 shadow-2xl">
                                <p className="text-2xl font-bold">
                                    {status === "won" ? "You win! 🎉" : "Game over 💥"}
                                </p>
                                <p className="text-sm text-slate-400">
                                    {status === "won"
                                        ? `Board cleared in ${formatTime(seconds)}${
                                              newRecord ? " · new best time!" : ""
                                          }`
                                        : "You hit a mine. Give it another try!"}
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => startNewGame()}
                                        className="rounded-md bg-emerald-500 px-5 py-2 font-semibold text-white shadow transition hover:bg-emerald-400 active:scale-95"
                                    >
                                        Play again
                                    </button>
                                    {DIFFICULTIES.filter(
                                        (option) => option.id !== difficulty.id,
                                    ).map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => startNewGame(option)}
                                            className="rounded-md border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 active:scale-95"
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-1 text-center text-sm text-slate-400">
                <p>
                    {bestTime === undefined
                        ? `No best time on ${difficulty.label.toLowerCase()} yet — win a game to set one!`
                        : `Best time (${difficulty.label.toLowerCase()}): ${formatTime(bestTime)}`}
                </p>
                <p>Left click reveals a cell, right click places a flag 🚩.</p>
                <p>Click a number with all its mines flagged to open the neighbors.</p>
            </div>
        </div>
    );
}
