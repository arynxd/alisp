import { execute } from "./lang/runtime";

const src = `(import "examples/main.lisp") (main/main)`;

execute(src);
