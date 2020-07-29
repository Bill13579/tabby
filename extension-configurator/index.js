let browser = require("webextension-polyfill");

function special(type, id) {
  return "__" + type + "_$" + id;
}
function isSpecial(type, id) {
  return id.startsWith("__" + type + "_$");
}
function normal(type, id) {
  return id.substring(4 + type.length, id.length);
}

class StorageSpace {
  constructor(type) {
    this.type = type;
    this.__fulfillers = {};
  }
  async hasOne(optionID) {
    optionID = special("conf", optionID);
    return (await browser.storage[this.type].get(optionID)).hasOwnProperty(optionID);
  }
  async has(...optionIDs) {
    let re = {};
    for (let optionID of optionIDs) {
      re[optionID] = await this.hasOne(optionID);
    }
    return re;
  }
  /* alternative implementation of `has`
  async has(...optionIDs) {
    let re = {};
    let data = await browser.storage[this.type].get(optionIDs.map(id => special("conf", id)));
    for (let optionID of optionIDs) {
      re[optionID] = data.hasOwnProperty(special("conf", optionID));
    }
    return re;
  }
  */
  unset(...optionIDs) {
    return browser.storage[this.type].remove(optionIDs.map(id => special("conf", id)));
  }
  set(optionID, value) {
    let data = {};
    data[special("conf", optionID)] = value;
    return browser.storage[this.type].set(data);
  }
  async setAll(options, overwriteExistingOptions=false) {
    for (let key in options) {
      if (options.hasOwnProperty(key)) {
        if (overwriteExistingOptions || !(await this.hasOne(key))) {
          await this.set(key, options[key]);
        }
      }
    }
  }
  async getOne(optionID) {
    optionID = special("conf", optionID);
    return (await browser.storage[this.type].get(optionID))[optionID];
  }
  async get(...optionIDs) {
    let re = {};
    for (let optionID of optionIDs) {
      re[optionID] = await this.getOne(optionID);
    }
    return re;
  }
  /* alternative incomplete implementation of `get`
  async get(...optionIDs) {
    return await browser.storage[this.type].get(optionIDs.map(id => special("conf", id)));
  }
  */
  __manual_fulfill(optionValue, fulfiller) {
    return Promise.resolve(fulfiller(optionValue));
  }
  async __fulfill(optionID, fulfiller) {
    return this.__manual_fulfill(await this.getOne(optionID), fulfiller);
  }
  fulfillOnce(optionID, fulfiller) {
    return this.__fulfill(optionID, fulfiller);
  }
  setFulfiller(optionID, fulfiller) {
    if (!this.__fulfillers.hasOwnProperty(optionID)) this.__fulfillers[optionID] = [];
    this.__fulfillers[optionID].push(fulfiller);
  }
  fulfill(optionID, fulfiller) {
    this.setFulfiller(optionID, fulfiller);
    return this.fulfillOnce(optionID, fulfiller);
  }
  async __onChange(changes) {
    for (let key in changes) {
      if (changes.hasOwnProperty(key) && isSpecial("conf", key)) {
        let optionID = normal("conf", key);
        if (this.__fulfillers.hasOwnProperty(optionID)) this.__fulfillers[optionID].forEach(fulfiller => this.__manual_fulfill(changes[key].newValue, fulfiller));
      }
    }
  }
}

export const local = new StorageSpace("local");
export const sync = new StorageSpace("sync");

browser.storage.onChanged.addListener(async (changes, areaName) => {
  switch (areaName) {
    case "local":
      await local.__onChange(changes);
      break;
    case "sync":
      await sync.__onChange(changes);
      break;
  }
});

