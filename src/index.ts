import { execute } from "./lang/runtime";

const src = `
    (strict)

    (import "src/test")

    (func)
`;

execute(src);
