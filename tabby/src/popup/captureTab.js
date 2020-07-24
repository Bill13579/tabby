import "Polyfill"

export let available = false;

export function init() {
  if (window["browser"] !== undefined
    && browser.tabs["captureTab"] !== undefined) {
    available = true;
    return;
  }
}

export function captureTab(id) {
  return available ? browser.tabs.captureTab(id) : new Promise((resolve, reject) => resolve(null));
}
