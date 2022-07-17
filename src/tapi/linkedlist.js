/**
 * One-directional integer linked list for unique values (only)
 */
export class T1DLinkedList {
    constructor() {
        this._first = undefined;
        this._last = undefined;
        this._data = [];
        this._free = [];
        this._length = 0;
    }
    /**
     * Allocates space for a single new entry, and returns its index
     * @returns {Integer}
     */
    _allocate_space() {
        let i;
        if (this._free.length > 0) {
            i = this._free.pop();
        } else {
            this._data.push(undefined, undefined);
            i = this._data.length - 2;
        }
        if (this._first == undefined || this._last == undefined) {
            this._first = i; this._last = i;
        }
        return i;
    }
    /**
     * Empties and recycles the index
     * @param {Integer} i 
     */
    _recycle_space(i) {
        this._data[i] = undefined;
        this._data[i + 1] = undefined;
        this._free.push(i);
    }
    /**
     * Append value to the end of the linked list
     * @param {Integer} v 
     */
    append(v) {
        let spaceIndex = this._allocate_space();
        this._data[spaceIndex] = v;
        this._data[spaceIndex + 1] = undefined;
        if (this._last !== spaceIndex) this._data[this._last + 1] = spaceIndex; // make the last element point towards the new element
        this._last = spaceIndex; // set this element as the new last element
        this._length++;
    }
    /**
     * Finds the first element (excluding next pointers) with the matching value
     * @param {Integer} v 
     * @returns {Integer}
     */
    _indexInDataArray(v) {
        return this._data.findIndex((vc, ic) => ic % 2 == 0 && v == vc);
    }
    /**
     * Finds the first next pointer (excluding data values) with the matching value
     * @param {Integer} p 
     * @returns {Integer}
     */
    _pointerIndexInDataArray(p) {
        return this._data.findIndex((vc, ic) => ic % 2 == 1 && p == vc);
    }
    /**
     * Returns the index of the data value provided (-1 if the data value is not found)
     * @param {Integer} v 
     * @returns {Integer}
     */
    indexOf(v) {
        let i = 0;
        let pointer = this._first;
        while (true) {
            if (pointer == undefined) return -1;
            if (v == this._data[pointer]) {
                return i;
            } else {
                pointer = this._data[pointer + 1];
                i++;
            }
        }
    }
    /**
     * Returns the true index of the element based on its array index
     * @param {Integer} i 
     * @returns {Integer}
     */
    _translateListIndexToDataArrIndex(i) {
        if (this._length < 1) {
            return -1;
        } else {
            let c = 0;
            let pointer = this._first;
            while (true) {
                if (pointer == undefined) return -1;
                if (c == i) {
                    return pointer;
                } else {
                    pointer = this._data[pointer + 1];
                    c++;
                }
            }
        }
    }
    /**
     * Look for a matching next pointer and replace its value with (returns the replaced pointer index)
     * @param {Integer} originalEndpoint 
     * @param {Integer} newEndpoint 
     * @returns {Integer}
     */
    _replaceMatchingNextPointerWith(originalEndpoint, newEndpoint) {
        let pointerIndex = this._pointerIndexInDataArray(originalEndpoint);
        this._data[pointerIndex] = newEndpoint;
        return pointerIndex;
    }
    /**
     * Remove matching value from linked list, and return true if successful
     * @param {Integer} v 
     * @returns {boolean}
     */
    remove(v) {
        let currentIndex = this._indexInDataArray(v);
        if (currentIndex == -1) return false;
        if (currentIndex == this._first && currentIndex == this._last) {
            this._first = undefined;
            this._last = undefined;
        } else if (currentIndex == this._first) {
            this._first = this._data[currentIndex + 1];
        } else if (currentIndex == this._last) {
            let replacedPointerIndex = this._replaceMatchingNextPointerWith(currentIndex, undefined);
            // replacedPointerIndex-1 would be the new last element's index
            this._last = replacedPointerIndex-1;
        } else {
            this._replaceMatchingNextPointerWith(currentIndex, this._data[currentIndex + 1]);
        }
        this._recycle_space(currentIndex);
        this._length--;
        return true;
    }
    /**
     * Insert value into the provided index
     * @param {Integer} v 
     * @param {Integer} i 
     */
    insert(v, i) {
        let spaceIndex = this._allocate_space();
        this._data[spaceIndex] = v;
        let dataIndexOfItemCurrentlyOccupyingGoal = this._translateListIndexToDataArrIndex(i);
        if (dataIndexOfItemCurrentlyOccupyingGoal == -1) { // index was out of bounds
            // handle case where the insertion index was beyond the end of the array
            // basically do an append
            if (this._last !== spaceIndex) this._data[this._last + 1] = spaceIndex;
            this._last = spaceIndex;
            dataIndexOfItemCurrentlyOccupyingGoal = undefined;
        } else if (this._replaceMatchingNextPointerWith(dataIndexOfItemCurrentlyOccupyingGoal, spaceIndex) == -1) {
            // handle case where the insertion index if 0
            this._first = spaceIndex;
        }
        this._data[spaceIndex + 1] = dataIndexOfItemCurrentlyOccupyingGoal;
        this._length++;
    }
    /**
     * Move value into the provided index
     * @param {Integer} v 
     * @param {Integer} newIndex 
     */
    move(v, newIndex) {
        let vIndex = this.indexOf(v);
        if (vIndex == newIndex) return;
        this.remove(v);
        this.insert(v, newIndex);
    }
    /**
     * Returns a simple String representation of the list
     * @returns {String}
     */
    toString() {
        let s = "[";
        let i = this._first;
        while (i !== undefined) {
            s += this._data[i] + ", ";
            i = this._data[i + 1];
        }
        return s;
    }
    /**
     * Returns a simple Array representation of the list
     * @returns {Array}
     */
    toArray() {
        let s = [];
        let i = this._first;
        while (i !== undefined) {
            s.push(this._data[i]);
            i = this._data[i + 1];
        }
        return s;
    }
    /**
     * Count length
     */
    get length() {
        return this._length;
    }
}