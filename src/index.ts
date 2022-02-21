import { execute } from "./lang/runtime";

const src = `(import "src/main") (main)`;

execute(src);
