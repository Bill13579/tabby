import "Polyfill"
import { sendRuntimeMessage } from "../messaging";

export async function restoreWindow(windowRecord) {
  await sendRuntimeMessage("RESTORE_WINDOW", { windowRecord });
}

export async function record(ids = undefined, name = undefined, channelName = undefined) {
  await sendRuntimeMessage("RECORD", { ids, name, channelName });
}

export async function restore(record) {
  for (let windowRecord of record["windows"]) {
    restoreWindow(windowRecord);
  }
}
