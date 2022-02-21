import { CallStack } from "../../runtime/callstack";
import { ErrorHandler } from "../error";
import { SymbolTable } from "./symbol";

export class Runtime {
    private readonly _globalSymbols: SymbolTable;
    private readonly _callStack: CallStack;

    private _errorHandler: ErrorHandler;
    private _strict = false;
    private _maxStackSize = 5;
    private _currentFile = "<anonymous>";
    private _currentSrc = "<nil>";

    public get callStack() {
        return this._callStack;
    }

    get globalSymbols() {
        return this._globalSymbols;
    }

    get strict() {
        return this._strict;
    }

    get maxStackSize() {
        return this._maxStackSize;
    }

    get currentFile() {
        return this._currentFile;
    }

    get currentSrc() {
        return this._currentSrc;
    }

    get errorHandler() {
        return this._errorHandler;
    }

    set currentFile(value) {
        this._currentFile = value;
        this._errorHandler = new ErrorHandler(this);
    }

    set currentSrc(value) {
        this._currentSrc = value;
        this._errorHandler = new ErrorHandler(this);
    }

    set strict(value) {
        this._strict = value;
    }

    constructor() {
        this._globalSymbols = new SymbolTable(this);
        this._callStack = new CallStack();
        this._errorHandler = new ErrorHandler(this);
    }
}
