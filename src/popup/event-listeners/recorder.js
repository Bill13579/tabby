import { lastRecord, record, restore } from "../recorder"

export function saveForLater() {
    record();
}

export { restore }
