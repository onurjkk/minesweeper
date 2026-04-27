import type { CellData } from "./Cell";
import Cell from "./Cell";


const board: CellData[][] = Array.from({length:9}, () => 
    Array.from({length:9}, () => ({
        revealed: false,
        flagged: false,
        mine: false,
        adjacent: 0,
    }))
);



export default function Board() {

    return (

        <div
            className="grid"
            style={{gridTemplateColumns : `repeat(${board[0].length}, 40px)`}}
        > 
        
        {
            board.map((row,r) => 
                row.map((cell,c) => (
                    <Cell key={`${r}-${c}`} cell={cell} />
                ))
            )
        }

        </div>

    );

};