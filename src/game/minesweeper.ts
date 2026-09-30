export type CellData = {
    revealed: boolean;
    flagged: boolean;
    mine: boolean;
    adjacent: number;
};

export type Board = CellData[][];

export type GameStatus = "ready" | "playing" | "won" | "lost";

export type Difficulty = {
    id: string;
    label: string;
    rows: number;
    columns: number;
    mines: number;
};

export const DIFFICULTIES: Difficulty[] = [
    { id: "easy", label: "Easy", rows: 9, columns: 9, mines: 10 },
    { id: "medium", label: "Medium", rows: 12, columns: 12, mines: 25 },
    { id: "hard", label: "Hard", rows: 16, columns: 16, mines: 40 },
];

function createCell(): CellData {
    return { revealed: false, flagged: false, mine: false, adjacent: 0 };
}

export function createBoard(difficulty: Difficulty): Board {
    return Array.from({ length: difficulty.rows }, () =>
        Array.from({ length: difficulty.columns }, createCell),
    );
}

export function cloneBoard(board: Board): Board {
    return board.map((row) => row.map((cell) => ({ ...cell })));
}

function forEachNeighbor(
    board: Board,
    row: number,
    column: number,
    callback: (row: number, column: number) => void,
) {
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = column - 1; c <= column + 1; c++) {
            if (r === row && c === column) continue;
            if (r < 0 || c < 0 || r >= board.length || c >= board[0].length) continue;
            callback(r, c);
        }
    }
}

/**
 * Places the mines on a fresh board, keeping the first clicked cell and its
 * neighbors mine free so the first move always opens an area.
 */
export function placeMines(
    board: Board,
    mineCount: number,
    safeRow: number,
    safeColumn: number,
): Board {
    const next = cloneBoard(board);

    const candidates: Array<[number, number]> = [];
    for (let row = 0; row < next.length; row++) {
        for (let column = 0; column < next[row].length; column++) {
            const inSafeZone =
                Math.abs(row - safeRow) <= 1 && Math.abs(column - safeColumn) <= 1;
            if (!inSafeZone) candidates.push([row, column]);
        }
    }

    const minesToPlace = Math.min(mineCount, candidates.length);
    for (let i = 0; i < minesToPlace; i++) {
        const j = i + Math.floor(Math.random() * (candidates.length - i));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        const [row, column] = candidates[i];
        next[row][column].mine = true;
    }

    for (let row = 0; row < next.length; row++) {
        for (let column = 0; column < next[row].length; column++) {
            if (next[row][column].mine) continue;
            let adjacent = 0;
            forEachNeighbor(next, row, column, (r, c) => {
                if (next[r][c].mine) adjacent++;
            });
            next[row][column].adjacent = adjacent;
        }
    }

    return next;
}

/**
 * Reveals a cell. Empty cells open up their whole area, the surrounding
 * numbered cells are revealed as a border. `exploded` holds the coordinates
 * of the mine that was hit, or null when the move was safe.
 */
export function reveal(
    board: Board,
    row: number,
    column: number,
): { board: Board; exploded: { row: number; column: number } | null } {
    const next = cloneBoard(board);
    const start = next[row][column];

    if (start.mine) {
        start.revealed = true;
        return { board: next, exploded: { row, column } };
    }

    const stack: Array<[number, number]> = [[row, column]];
    while (stack.length > 0) {
        const [r, c] = stack.pop()!;
        const cell = next[r][c];
        if (cell.revealed || cell.flagged) continue;

        cell.revealed = true;
        if (cell.adjacent !== 0) continue;

        forEachNeighbor(next, r, c, (nr, nc) => {
            const neighbor = next[nr][nc];
            if (neighbor.revealed || neighbor.flagged || neighbor.mine) return;
            stack.push([nr, nc]);
        });
    }

    return { board: next, exploded: null };
}

/**
 * Classic "chord" move: clicking an already revealed number that has all of
 * its mines flagged reveals the remaining neighbors. Returns the unchanged
 * board when the move is not available.
 */
export function chord(
    board: Board,
    row: number,
    column: number,
): { board: Board; exploded: { row: number; column: number } | null } {
    const cell = board[row][column];
    if (!cell.revealed || cell.adjacent === 0) return { board, exploded: null };

    let flags = 0;
    forEachNeighbor(board, row, column, (r, c) => {
        if (board[r][c].flagged) flags++;
    });
    if (flags !== cell.adjacent) return { board, exploded: null };

    const targets: Array<[number, number]> = [];
    forEachNeighbor(board, row, column, (r, c) => {
        const neighbor = board[r][c];
        if (!neighbor.revealed && !neighbor.flagged) targets.push([r, c]);
    });

    let next = board;
    let exploded: { row: number; column: number } | null = null;
    for (const [r, c] of targets) {
        const result = reveal(next, r, c);
        next = result.board;
        if (result.exploded) exploded = result.exploded;
    }

    return { board: next, exploded };
}

export function toggleFlag(board: Board, row: number, column: number): Board {
    const cell = board[row][column];
    if (cell.revealed) return board;

    const next = cloneBoard(board);
    next[row][column].flagged = !next[row][column].flagged;
    return next;
}

export function revealAllMines(board: Board): Board {
    const next = cloneBoard(board);
    for (const row of next) {
        for (const cell of row) {
            if (cell.mine) cell.revealed = true;
        }
    }
    return next;
}

export function countFlags(board: Board): number {
    return board.reduce(
        (total, row) => total + row.filter((cell) => cell.flagged).length,
        0,
    );
}

export function hasWon(board: Board): boolean {
    return board.every((row) => row.every((cell) => cell.revealed || cell.mine));
}

export function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
