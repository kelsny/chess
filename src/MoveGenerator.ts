import { Board } from "./Board.js";
import { Move } from "./Move.js";
import { Piece } from "./Piece.js";

export class MoveGenerator {
    static readonly directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
    
    static readonly squaresToEdge: [
        north: number,
        south: number,
        west: number,
        east: number,
        minNW: number,
        minSE: number, 
        minNE: number,
        minSW: number,
    ][] = [...Array(64).keys()].map((i) => {
        const north = 7 - (i >> 3);
        const south = i >> 3;
        const west = i & 0b111;
        const east = 7 - (i & 0b111);

        return [
            north, south, west, east,
            Math.min(north, west),
            Math.min(south, east),
            Math.min(north, east),
            Math.min(south, west),
        ];
    });

    static generateMoves(board: Board) {
        const moves: Move[] = [];

        for (let startSquare = 0; startSquare < 64; startSquare++) {
            const piece = board.squares[startSquare];

            // skip if there is no piece or the piece is an enemy piece
            if (!piece || !Piece.isColor(piece, board.colorToMove)) continue;

            if (Piece.isSlidingPiece(piece)) moves.push(...this.#generateSlidingMoves(board, startSquare, piece));
        }

        return moves;
    }

    static #generateSlidingMoves(board: Board, startSquare: number, piece: number) {
        const moves: Move[] = [];

        const startIndex = Piece.isType(piece, Piece.Bishop) && !Piece.isType(piece, Piece.Queen) ? 4 : 0;
        const endIndex = Piece.isType(piece, Piece.Rook) && !Piece.isType(piece, Piece.Queen) ? 4 : 8;

        for (let i = startIndex; i < endIndex; i++) {
            for (let n = 0; n < this.squaresToEdge[startSquare][i]; n++) {
                const targetSquare = startSquare + this.directionOffsets[i] * (n + 1);
                const pieceOnTarget = board.squares[targetSquare];

                // blocked by friendly piece
                if (pieceOnTarget && Piece.isColor(pieceOnTarget, board.colorToMove)) break;

                moves.push(new Move(startSquare, targetSquare));

                // captured enemy piece
                if (pieceOnTarget && !Piece.isColor(pieceOnTarget, board.colorToMove)) break;
            }
        }

        return moves;
    }
}