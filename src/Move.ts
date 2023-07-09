import { Board } from "./Board.js";
import { BoardRepresentation } from "./BoardRepresentation.js";
import { Piece } from "./Piece.js";

export class Move {
    static readonly Flag = {
        None             : 0b0000,
        EnPassantCapture : 0b0001,
        Castling         : 0b0010,
        DoublePawnPush   : 0b0011,
        PromoteToQueen   : 0b0100,
        PromoteToKnight  : 0b0101,
        PromoteToRook    : 0b0110,
        PromoteToBishop  : 0b0111,
    } as const;

    static readonly #startSquareMask  = 0b0000000000111111;
    static readonly #targetSquareMask = 0b0000111111000000;

    readonly #bits: number;

    constructor(start: number, target: number, flag = 0) {
        this.#bits = start | target << 6 | flag << 12;
    }

    get startSquare() {
        return this.#bits & Move.#startSquareMask;
    }

    get targetSquare() {
        return (this.#bits & Move.#targetSquareMask) >> 6;
    }

    get moveFlag() {
        return this.#bits >> 12;
    }

    get isPromotion() {
        return (this.#bits >> 12 & 0b0100) === 0b0100;
    }

    get promotionPieceType() {
        if (!this.isPromotion) return Piece.None;

        return {
            
        }[this.moveFlag];
    }

    get bits() {
        return this.#bits;
    }

    get isInvalid() {
        return this.#bits === 0;
    }

    get name() {
        let name = BoardRepresentation.squareName(this.startSquare) + BoardRepresentation.squareName(this.targetSquare);

        if (this.isPromotion) {
            if (this.moveFlag === Move.Flag.PromoteToQueen ) name += "q";
            if (this.moveFlag === Move.Flag.PromoteToRook  ) name += "r";
            if (this.moveFlag === Move.Flag.PromoteToBishop) name += "b";
            if (this.moveFlag === Move.Flag.PromoteToKnight) name += "n";
        }

        return name;
    }

    static #moveRegex = /^(?<start>[a-h][1-8])(?<target>[a-h][1-8])(?<promotion>q|r|b|n)?$/

    // board is needed for context (for castling/en passant/double pawn push)
    static parseMove(move: string, board: Board) {
        if (!this.#moveRegex.test(move)) return this.invalidMove();

        const { start, target, promotion } = move.match(this.#moveRegex)!.groups!;

        const startFile  = BoardRepresentation.fileNames.indexOf(start[0]);
        const startRank  = BoardRepresentation.rankNames.indexOf(start[1]);

        const targetFile = BoardRepresentation.fileNames.indexOf(target[0]);
        const targetRank = BoardRepresentation.rankNames.indexOf(target[1]);

        let moveFlag = 0;

        if (promotion) {
            if (promotion === "q") moveFlag = Move.Flag.PromoteToQueen ;
            if (promotion === "r") moveFlag = Move.Flag.PromoteToRook  ;
            if (promotion === "b") moveFlag = Move.Flag.PromoteToBishop;
            if (promotion === "n") moveFlag = Move.Flag.PromoteToKnight;
        } else {
            // check for castling/en passant/double pawn push using board
        }

        return new Move(
            BoardRepresentation.indexFromCoord(startFile, startRank),
            BoardRepresentation.indexFromCoord(targetFile, targetRank),
            moveFlag,
        );
    }

    static equals(a: Move, b: Move) {
        return a.#bits === b.#bits;
    }

    static invalidMove() {
        return new Move(0, 0, 0);
    }
}