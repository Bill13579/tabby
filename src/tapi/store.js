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
const DEL_ON_START = (type) => special(type, "___DELONSTART");

class OutOfStorageError extends Error {  }

export class StorageSpace {
  constructor(type, name="conf", tmp=false) {
    this.type = type;
    this.name = name;
    this.tmp = tmp;
    this.__fulfillers = {};
    this.__modifierPromises = {};
  }
  async modify(optionID, callback, queryCurrentValue=true) {
    let modifierPromise = this.__modifierPromises[optionID];
    this.__modifierPromises[optionID] = new Promise(async (resolve, _) => {
      try {
        if (modifierPromise) await modifierPromise;
        
        // Do stuff
        let currentValue = queryCurrentValue ? await this.getOne(optionID) : undefined;
        let returnValue = callback(currentValue);
        if (returnValue instanceof Promise) {
          returnValue = await returnValue;
        }
        if (returnValue !== undefined) {
          await this.__set(special(this.name, optionID), returnValue);
        }
        // Do stuff
        
        resolve(); // Resolve anyways so the chain can keep going
      } catch (e) {
        console.error(`storage modification for property "${optionID}" failed with the following error:`);
        console.error(e);
        resolve(); // Resolve anyways so the chain can keep going
      }
    });
    return this.__modifierPromises[optionID];
  }
  async modifyAll(callback, queryCurrentValue, ...optionIDs) {
    let modifierPromises = optionIDs.map(optionID => this.__modifierPromises[optionID]);
    let newPromise = new Promise(async (resolve, _) => {
      try {
        for (let promise of modifierPromises) {
          if (promise !== undefined) {
            await promise;
          }
        }
        
        // Do stuff
        let currentValues = queryCurrentValue ? await this.get(...optionIDs) : undefined;
        let returnValue = callback(currentValues);
        if (returnValue instanceof Promise) {
          returnValue = await returnValue;
        }
        if (returnValue !== undefined) {
          await this.__setAll(returnValue);
        }
        // Do stuff
        
        resolve(); // Resolve anyways so the chain can keep going
      } catch (e) {
        console.error(`storage modification for properties "${optionIDs}" failed with the following error:`);
        console.error(e);
        resolve(); // Resolve anyways so the chain can keep going
      }
    });
    for (let optionID of optionIDs) {
      this.__modifierPromises[optionID] = newPromise;
    }
    return newPromise;
  }
  special(id) {
    return special(this.name, id);
  }
  isSpecial(id) {
    return isSpecial(this.name, id);
  }
  normal(id) {
    return normal(this.name, id);
  }
  __delOnStart() {
    return this.modify(DEL_ON_START(this.name), async () => {
      let delOnStart = await this.__getOne(DEL_ON_START(this.name));
      if (delOnStart) {
        console.log("[store] delOnStart exists: ");
        console.log(delOnStart);
        return this.modifyAll(() => {
          console.log("[store] deleting");
          return this.__unset(...delOnStart);
        }, false, ...delOnStart)
          .then(() => this.__set(DEL_ON_START(this.name), []/* Set delOnStart back to an empty array */));
      } else {
        this.__set(DEL_ON_START(this.name), []/* Set delOnStart back to an empty array */)
      }
    }, false);
  }
  __chunkNumber(optionID, partKey, chunkSuffix="_part") {
    return parseInt(partKey.substring(optionID.length + chunkSuffix.length));
  }
  async storeLarge(optionID, value, chunksOfSize=8092) {
    const chunks = t_chunkBytes(value, chunksOfSize);
    const keys = await this.getKeys();
    
    // Loop through the keys to find the old chunks that are no longer required to store the new data
    let dels = [];
    for (let partKey of keys) {
      if (partKey.startsWith(optionID) && this.__chunkNumber(optionID, partKey) >= chunks.length) {
        dels.push(partKey);
      }
    }

    // Build the set object
    let sets = {};
    for (let [index, chunk] of chunks.entries()) {
      sets[optionID + "_part" + index] = chunk;
    }

    await this.unset(...dels);
    try {
      await this.setAll(sets, true);
    } catch (e) {
      await this.unset(...Object.keys(sets));
      throw new OutOfStorageError("storeLarge failed! error: " + e);
    }
  }
  async retrieveLarge(optionID) {
    const keys = await this.getKeys();

    // Loop through the keys to find the relevant chunks
    let gets = [];
    let maxChunkNumber = 0;
    for (let partKey of keys) {
      if (partKey.startsWith(optionID)) {
        gets.push(partKey);
        let chunkNumber = this.__chunkNumber(optionID, partKey);
        if (chunkNumber > maxChunkNumber) {
          maxChunkNumber = chunkNumber;
        }
      }
    }

    // Get the chunks
    let chunks = await this.get(...gets);

    // Gather the chunks and merge them
    let obj = "";
    for (let i = 0; i <= maxChunkNumber; i++) {
      obj += chunks[optionID + "_part" + i];
    }

    return obj;
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
  unset(...optionIDs) {
    return this.modifyAll(async () => {
      let delOnStart = await this.__getOne(DEL_ON_START(this.name));
      for (let id of optionIDs) {
        let i = delOnStart.indexOf(id);
        if (i !== -1) {
          delOnStart.splice(i, 1);
        }
      }
      await this.__set(DEL_ON_START(this.name), delOnStart);
      await this.__unset(...optionIDs);
    }, false, DEL_ON_START(this.name), ...optionIDs);
  }
  async __unset(...optionIDs) {
    return browser.storage[this.type].remove(optionIDs.map(id => special(this.name, id)));
  }
  set(optionID, value) {
    return this.modifyAll(async () => {
      let delOnStart = await this.__getOne(DEL_ON_START(this.name));
      delOnStart = delOnStart ? delOnStart : [];
      if (!delOnStart.includes(optionID)) {
        delOnStart.push(optionID);
      }
      await this.__set(DEL_ON_START(this.name), delOnStart);
      await this.__set(special(this.name, optionID), value);
    }, false, DEL_ON_START(this.name), optionID);
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
  async __setAll(options, overwriteExistingOptions=false) {
    for (let key in options) {
      if (options.hasOwnProperty(key)) {
        if (overwriteExistingOptions || !(await this.hasOne(key))) {
          await this.__set(special(this.name, key), options[key]);
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
  async getKeys() {
    return this.__getOne(DEL_ON_START(this.name));
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
  async fulfillOnce(optionID, fulfiller, defaultValue=undefined) {
    if (defaultValue !== undefined) { //TODO: Evaluate if this needs to be wrapped in a modify
      if (!(await this.hasOne(optionID))) {
        await this.set(optionID, defaultValue);
      }
    }
    return this.__fulfill(optionID, fulfiller);
  }
  addFulfiller(optionID, fulfiller) {
    if (!this.__fulfillers.hasOwnProperty(optionID)) this.__fulfillers[optionID] = [];
    this.__fulfillers[optionID].push(fulfiller);
  }
  removeFulfiller(optionID, fulfiller) {
    if (this.__fulfillers.hasOwnProperty(optionID)) {
      let index = this.__fulfillers[optionID].indexOf(fulfiller);
      if (index !== -1) {
        this.__fulfillers[optionID].splice(index, 1);
      }
    }
  }
  async fulfill(optionID, fulfiller, defaultValue=undefined) {
    if (defaultValue !== undefined) { //TODO: Evaluate if this needs to be wrapped in a modify
      if (!(await this.hasOne(optionID))) {
        await this.set(optionID, defaultValue);
      }
    }
    this.addFulfiller(optionID, fulfiller);
    return this.fulfillOnce(optionID, fulfiller, undefined);
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
      await $localtmp$.__onChange(changes);
      break;
    case "sync":
      await $sync$.__onChange(changes);
      await $synctmp$.__onChange(changes);
      break;
  }
});

