let browser = require("webextension-polyfill");

const ECKEY = "ec-options";

function __init(data) {
  if (!data.hasOwnProperty(ECKEY)) data[ECKEY] = {};
}

class StorageSpace {
  constructor(type) {
    this.type = type;
  }
  has(optionID, ...optionIDs) {
    return getRawOptions(this.type).then(data => {
      __init(data);
      let re;
      if (optionIDs.length > 0) {
        re = {};
        re[optionID] = data[ECKEY].hasOwnProperty(optionID);
        for (let id of optionIDs) {
          re[id] = data[ECKEY].hasOwnProperty(id);
        }
      } else {
        re = data[ECKEY].hasOwnProperty(optionID);
      }
      return re;
    });
  }
  unset(...optionIDs) {
    return getRawOptions(this.type).then(data => {
      __init(data);
      for (let id of optionIDs) {
        if (data[ECKEY].hasOwnProperty(id)) {
          delete data[ECKEY][id];
        }
      }
      return setRawOptions(this.type, data);
    });
  }
  set(optionID, val) {
    return getRawOptions(this.type).then(data => {
      __init(data);
      data[ECKEY][optionID] = val;
      return setRawOptions(this.type, data);
    });
  }
  completelyOverwrite(options) {
    return getRawOptions(this.type).then(data => {
      //__init is not necessary here since we immediately overwrite it with `options`
      data[ECKEY] = options;
      return setRawOptions(this.type, data);
    });
  }
  async setAll(options, overwriteExistingOptions=false) {
    let currentOptions = await this.getAll();
    for (const [optionID, val] of Object.entries(options)) {
      if (currentOptions.hasOwnProperty(optionID)) {
        if (overwriteExistingOptions) currentOptions[optionID] = val;
      } else {
        currentOptions[optionID] = val;
      }
    }
    await this.completelyOverwrite(currentOptions);
  }
  get(optionID, ...optionIDs) {
    return getRawOptions(this.type).then(data => {
      __init(data);
      let re;
      if (optionIDs.length > 0) {
        re = {};
        re[optionID] = data[ECKEY][optionID];
        for (let id of optionIDs) {
          re[id] = data[ECKEY][id];
        }
      } else {
        re = data[ECKEY][optionID];
      }
      return re;
    });
  }
  getAll() {
    return getRawOptions(this.type).then(data => {
      __init(data);
      return data[ECKEY];
    });
  }
  clear() {
    return browser.storage[this.type].remove(ECKEY);
  }
}

export const local = new StorageSpace("local");
export const sync = new StorageSpace("sync");
local.migrateToSync = async function (clearOutLocal=true, overwriteExistingOptions=true) {
  await sync.setAll(await this.getAll(), overwriteExistingOptions);
  if (clearOutLocal) await this.clear();
};
sync.migrateToLocal = async function (clearOutSync=true, overwriteExistingOptions=true) {
  await local.setAll(await this.getAll(), overwriteExistingOptions);
  if (clearOutSync) await this.clear();
};

export function getRawOptions(storageSpace) {
  return browser.storage[storageSpace].get(ECKEY);
}
export function setRawOptions(storageSpace, data) {
  return browser.storage[storageSpace].set(data);
}

