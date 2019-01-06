import G from "../globals"

export function onMessage(request, sender, sendResponse) {
    switch (request.type) {
        case "WRONG_TO_RIGHT_GET":
            sendResponse({
                wrongToRight: G.wrongToRight
            });
            break;
    }
}
