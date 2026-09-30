# Minesweeper

A web version of the classic Minesweeper game, built with React, TypeScript, Tailwind CSS and Vite, with a dark theme.

## Features

- Three difficulties: **Easy** 9×9 with 10 mines, **Medium** 12×12 with 25 mines, **Hard** 16×16 with 40 mines
- The first click is always safe and opens an area of the board
- Left click reveals a cell, right click places a flag 🚩
- Clicking a revealed number whose mines are all flagged opens the remaining neighbors (chord move)
- Mine counter, timer and best time for every difficulty (saved in the browser)
- Win/lose panel with **Play again** and difficulty buttons, so a new game is one click away

## How to play

1. Left click a cell to reveal it. Numbers tell you how many mines touch that cell.
2. Right click a cell to flag it as a mine. The counter shows how many mines are left.
3. Click a revealed number once all of its mines are flagged: the remaining neighbors open at once.
4. Reveal every cell without a mine to win; hit a mine and the game ends.
5. Use the difficulty buttons, the 🙂 button or **Play again** to start a new game at any time.
