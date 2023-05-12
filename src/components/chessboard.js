"use client";
import React from "react";
import "./chessboard.css";

export default function Chessboard() {
  const rows = ["8", "7", "6", "5", "4", "3", "2", "1"];
  const cols = ["A", "B", "C", "D", "E", "F", "G", "H"];

  const squares = rows.map((row, rowIndex) =>
    cols.map((col, colIndex) => {
      const isBlack = (rowIndex + colIndex) % 2 === 1;
      const classes = `square ${isBlack ? "black" : "white"}`;
      return (
        <div key={`${col}${row}`} className={classes}>
          {`${col}${row}`}
        </div>
      );
    })
  );

  return <div className="board">{squares}</div>;
}
