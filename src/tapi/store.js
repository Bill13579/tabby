/**
 * WebExtension Persistent Background Storage
 */

import "Polyfill"

function special(type, id) {
  return "__" + type + "_$" + id;
}
function isSpecial(type, id) {
  return id.startsWith("__" + type + "_$");
}
function normal(type, id) {
  return id.substring(4 + type.length, id.length);
}
const DEL_ON_START = special("__DELONSTART", "_");

export class StorageSpace {
  constructor(type, name="conf", tmp=false) {
    this.type = type;
    this.name = name;
    this.tmp = tmp;
    this.__fulfillers = {};
  }
  async __delOnStart() {
    let delOnStart = await this.__getOne(DEL_ON_START);
    await this.__unset(delOnStart);
    await this.__set(DEL_ON_START, []);
  }
  async hasOne(optionID) {
    optionID = special(this.name, optionID);
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
  async unset(...optionIDs) {
    if (this.tmp) {
      let delOnStart = await this.__getOne(DEL_ON_START);
      for (let id of optionIDs) {
        let i = delOnStart.indexOf(id);
        if (i !== -1) {
          delOnStart.splice(i, 1);
        }
      }
      await this.__set(DEL_ON_START, delOnStart);
    }
    return this.__unset(...optionIDs);
  }
  async __unset(...optionIDs) {
    return browser.storage[this.type].remove(optionIDs.map(id => special(this.name, id)));
  }
  async set(optionID, value) {
    if (this.tmp) {
      let delOnStart = await this.__getOne(DEL_ON_START);
      delOnStart = delOnStart ? delOnStart : [];
      if (!delOnStart.includes(optionID)) {
        delOnStart.push(optionID);
      }
      await this.__set(DEL_ON_START, delOnStart);
    }
    return this.__set(special(this.name, optionID), value);
  }
  async __set(optionID, value) {
    let data = {};
    data[optionID] = value;
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
    return this.__getOne(special(this.name, optionID));
  }
  async __getOne(optionID) {
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
  async fulfillOnce(optionID, fulfiller) {
    return this.__fulfill(optionID, fulfiller);
  }
  setFulfiller(optionID, fulfiller) {
    if (!this.__fulfillers.hasOwnProperty(optionID)) this.__fulfillers[optionID] = [];
    this.__fulfillers[optionID].push(fulfiller);
  }
  async fulfill(optionID, fulfiller) {
    this.setFulfiller(optionID, fulfiller);
    return this.fulfillOnce(optionID, fulfiller);
  }
  async __onChange(changes) {
    for (let key in changes) {
      if (changes.hasOwnProperty(key) && isSpecial(this.name, key)) {
        let optionID = normal(this.name, key);
        if (this.__fulfillers.hasOwnProperty(optionID)) this.__fulfillers[optionID].forEach(fulfiller => this.__manual_fulfill(changes[key].newValue, fulfiller));
      }
    }
  }
}

export const $local$ = new StorageSpace("local");
export const $sync$ = new StorageSpace("sync");
export const $localtmp$ = new StorageSpace("local", "temp", true);
export const $synctmp$ = new StorageSpace("sync", "temp", true);

browser.storage.onChanged.addListener(async (changes, areaName) => {
  switch (areaName) {
    case "local":
      await $local$.__onChange(changes);
      break;
    case "sync":
      await $sync$.__onChange(changes);
      break;
  }
});

