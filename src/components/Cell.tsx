import type { ReactNode } from "react";
import type { CellData } from "../game/minesweeper";

const NUMBER_COLORS: Record<number, string> = {
    1: "text-blue-400",
    2: "text-green-400",
    3: "text-red-400",
    4: "text-purple-400",
    5: "text-amber-400",
    6: "text-teal-300",
    7: "text-pink-400",
    8: "text-slate-300",
};

type CellProps = {
    cell: CellData;
    exploded: boolean;
    lost: boolean;
    gameOver: boolean;
    onReveal: () => void;
    onToggleFlag: () => void;
};

export default function Cell({
    cell,
    exploded,
    lost,
    gameOver,
    onReveal,
    onToggleFlag,
}: CellProps) {
    const canReveal = !cell.revealed && !gameOver;
    const canChord = cell.revealed && cell.adjacent > 0 && !gameOver;
    const interactive = canReveal || canChord;
    const wrongFlag = lost && cell.flagged && !cell.mine;

    const stateClasses = exploded
        ? "border-red-400 bg-red-600"
        : cell.revealed
          ? "border-slate-800 bg-slate-900"
          : "border-slate-700 bg-slate-700 shadow-[inset_2px_2px_0_rgba(148,163,184,0.35),inset_-2px_-2px_0_rgba(2,6,23,0.65)]";

    let content: ReactNode = null;
    if (cell.revealed) {
        if (cell.mine) content = "💣";
        else if (cell.adjacent > 0) content = cell.adjacent;
    } else if (wrongFlag) {
        content = "❌";
    } else if (cell.flagged) {
        content = "🚩";
    }

    const numberColor = cell.revealed && !cell.mine ? NUMBER_COLORS[cell.adjacent] : undefined;

    return (
        <button
            type="button"
            title={canChord ? "Reveal the remaining neighbors" : undefined}
            onClick={() => interactive && onReveal()}
            onContextMenu={(event) => {
                event.preventDefault();
                if (canReveal) onToggleFlag();
            }}
            className={`flex h-10 w-10 select-none items-center justify-center border text-lg leading-none font-bold transition-colors ${stateClasses} ${
                interactive ? "cursor-pointer hover:brightness-125" : "cursor-default"
            } ${exploded ? "text-white" : numberColor ?? "text-slate-400"}`}
        >
            {content}
        </button>
    );
}
