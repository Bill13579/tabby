import "Polyfill"
import { SWITCH_ON, SWITCH_LOCKED_ON, SWITCH_OFF, SWITCH_LOCKED_OFF } from "./options/states"
export { SWITCH_ON, SWITCH_LOCKED_ON, SWITCH_OFF, SWITCH_LOCKED_OFF }

export async function options() {
  return browser.storage.local.get(["options"]).then(data => data.options);
}

export async function setOptions(options) {
  return browser.storage.local.set({ options: options });
}

export function stbool(switch_state) {
  switch (switch_state) {
    case SWITCH_ON:
    case SWITCH_LOCKED_ON:
      return true;
    case SWITCH_OFF:
    case SWITCH_LOCKED_OFF:
      return false;
  }
}
