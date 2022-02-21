(module main (
    (fun main () (
        (module main2 (
            (fun main () (
                (print 1111)
            ))

            (export main)
        ))

        (import "main2")
        (main2/main)
    ))

    (export main)
))
