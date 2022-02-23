import type { SymbolExpr } from "../parse/Expr";
import type { Runtime } from "./runtime";
import type { Symbol } from "./symbol";

export type InterceptorType = "symbol-lookup";

type InterceptorEvent<T extends InterceptorType> = {
    "symbol-lookup": (symbol: SymbolExpr) => Symbol;
}[T];

export type Interceptor<T extends InterceptorType> = {
    type: T;
    intercept: InterceptorEvent<T>;
};

const defaultInterceptor: Interceptor<any> = {
    type: "",
    intercept: (..._: never[]) => {},
};

export class InterceptorHandler {
    private readonly _interceptors: Map<InterceptorType, Interceptor<any>>;

    constructor(private readonly runtime: Runtime) {
        this._interceptors = new Map();
    }

    public get<T extends InterceptorType>(type: T): Interceptor<T> {
        return this._interceptors.get(type) ?? defaultInterceptor;
    }

    public set<T extends InterceptorType>(type: T, interceptor: Interceptor<T>) {
        this._interceptors.set(type, interceptor);
    }

    public unset<T extends InterceptorType>(type: T) {
        this._interceptors.delete(type);
    }
}
