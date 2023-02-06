/**
 * WebExtension Persistent Background Storage - Persistent Object
 */

import "Polyfill"

export class StorageSpacePersistentObject {
    constructor(storage_space, name) {
        this.storage_space = storage_space;
        this.name = name;
        this.__cache = undefined;
    }
    async initialize(defaultValue=undefined) {
        let exists = await this.storage_space.hasOne(this.name);
        if (!exists) {
            await this.storage_space.set(this.name, defaultValue);
        }
        await this.get(); // Cache the value while we're at it
        return this;
    }
    async set(value) {
        await this.storage_space.set(this.name, value);
    }
    async get() {
        this.__cache = await this.storage_space.getOne(this.name);
        return this.__cache;
    }
    cache() {
        return this.__cache;
    }
}

