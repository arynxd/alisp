import { Interpreter } from "./lang/Interpreter"

const src = `\
    (def "no exist" "exist")
    (print (get "no exist"))
`

const interpreter = new Interpreter(src)
interpreter.interpret()