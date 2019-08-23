import "Polyfill"
import G from "../globals"

export function onMessage(request, sender) {
    switch (request.type) {
        case "WRONG_TO_RIGHT_GET":
            return Promise.resolve({
                wrongToRight: G.wrongToRight
            });
    }
}
