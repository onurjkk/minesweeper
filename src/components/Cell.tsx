export type CellData = {
    revealed: boolean;
    flagged: boolean;
    mine: boolean;
    adjacent: number;
};

export default function Cell({ cell }: { cell: CellData }) {

    return (
        <button
            className="w-10 h-10 bg-gray-300 border border-gray-500"
        >
            {cell.revealed ? cell.adjacent : ""}
        </button>
    );

};