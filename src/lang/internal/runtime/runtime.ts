import { CallStack } from "../../runtime/callstack";
import { ErrorHandler } from "./error";
import { InterceptorHandler as InterceptorController } from "./interceptor";
import { ModuleController } from "./module";
import { SymbolTable } from "./symbol";

export class Runtime {
    private readonly _globalSymbols: SymbolTable;
    private readonly _callStack: CallStack;
    private readonly _moduleController: ModuleController;
    private readonly _interceptorController: InterceptorController;

    private _errorHandler: ErrorHandler;
    private _strict = false;
    private _maxStackSize = 5;
    private _currentFile = "<anonymous>";
    private _currentSrc = "<nptr>";
    private _moduleDenotion = "/";

    get callStack() {
        return this._callStack;
    }

    get moduleDenotion() {
        return this._moduleDenotion;
    }

    get moduleController() {
        return this._moduleController;
    }

    get interceptorController() {
        return this._interceptorController;
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
        this._moduleController = new ModuleController(this);
        this._interceptorController = new InterceptorController(this);
    }
}
