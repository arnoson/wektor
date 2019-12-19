import { isObject } from '@wektor/utils';
const flagNames = {
  [1 << 0]: 'appearance',
  [1 << 1]: 'children',
  [1 << 2]: 'insertion',
  [1 << 3]: 'geometry',
  [1 << 4]: 'segments',
  [1 << 5]: 'stroke',
  [1 << 6]: 'style',
  [1 << 7]: 'attribute',
  [1 << 8]: 'content',
  [1 << 9]: 'pixels',
  [1 << 10]: 'clipping',
  [1 << 11]: 'view'
};
export class ChangeTracker {
  constructor(project) {
    this.project = project;
    this.projectListeners = {};
    this.itemListeners = {};

    this._frameHandler = () => this._handleChanges();

    this.enabled = true;
  }

  set enabled(enabled) {
    const action = enabled ? 'on' : 'off';
    this.project.view[action]('frame', this._frameHandler);
  }

  _handleChanges() {
    var _project$_changes;

    const {
      project
    } = this;

    if ((_project$_changes = project._changes) === null || _project$_changes === void 0 ? void 0 : _project$_changes.length) {
      const groupedChanges = {};

      for (const change of project._changes) {
        const {
          item,
          flags
        } = change;

        if (!item.guide && item.data.changeTracking !== false) {
          for (let i = 0; i < 12; i++) {
            const flag = 1 << i;

            if (flags & flag) {
              const type = flagNames[flag];
              groupedChanges[type] = groupedChanges[type] || [];
              groupedChanges[type].push(item);
              this.emit(item, type, change);
            }
          }
        }
      }

      for (const key of Object.keys(groupedChanges)) {
        const items = groupedChanges[key];
        this.emit(key, {
          items
        });
      }
    }

    project._changes = [];
    project._changesById = {};
  }
  /**
   * Emit an event on an item.
   * @param {PaperItem} item
   * @param {String} type
   * @param {*} payload
   */

  /**
  * Emit an event on the project.
  * @param {String} type
  * @param {*} payload
  */


  emit(...args) {
    if (args.length === 3) {
      const [item, type, payload] = args;

      for (const listener of ((_this$itemListeners$i = this.itemListeners[item.id]) === null || _this$itemListeners$i === void 0 ? void 0 : _this$itemListeners$i[type]) || []) {
        var _this$itemListeners$i;

        listener(payload);
      }
    } else {
      const [type, payload] = args;

      for (const listener of this.projectListeners[type] || []) {
        listener(payload);
      }
    }
  }
  /**
   * Check if an item has one or more event listeners of the specified type.
   * @param {PaperItem} item
   * @param {String} type
   */

  /**
  * Check if the project has on or more event listeners of the specified type.
  * @param {String} type
  * @param {String} type
  */


  responds(...args) {
    if (args.length === 2) {
      var _this$itemListeners$i2, _this$itemListeners$i3;

      const [item, type] = args;
      return !!((_this$itemListeners$i2 = this.itemListeners[item]) === null || _this$itemListeners$i2 === void 0 ? void 0 : (_this$itemListeners$i3 = _this$itemListeners$i2[type]) === null || _this$itemListeners$i3 === void 0 ? void 0 : _this$itemListeners$i3.length);
    } else {
      var _this$projectListener;

      const [type] = args;
      return !!((_this$projectListener = this.projectListeners[type]) === null || _this$projectListener === void 0 ? void 0 : _this$projectListener.length);
    }
  }
  /**
   * Attach an event listener to an item.
   * @param {PaperItem} item
   * @param {String} type
   * @param {Function} listener
   */

  /**
  * Attach one or more event listeners to an item.
  * @param {PaperItem} item
  * @param {Object} listeners
  */

  /**
  * Attach an event listener to the project.
  * @param {String} type
  * @param {Function} listener
  */

  /**
  * Attach one or more event listener to the project.
  * @param {String} type
  * @param {Object} listeners
  */


  on(...args) {
    this._onOff('on', ...args);
  }
  /**
   * Detach an event listener from an item.
   * @param {PaperItem} item
   * @param {String} type
   * @param {Function} listener
   */

  /**
  * Detach one or more event listeners from an item.
  * @param {PaperItem} item
  * @param {Object} listeners
  */

  /**
  * Detach an event listener from the project.
  * @param {String} type
  * @param {Function} listener
  */

  /**
  * Detach one or more event listener from the project.
  * @param {String} type
  * @param {Object} listeners
  */


  off(...args) {
    this._onOff('off', ...args);
  }

  _onOff(type, ...args) {
    const action = type === 'on' ? this._addListener.bind(this) : this._removeListener.bind(this);

    if (args.length === 1) {
      const [listeners] = args;

      for (const [type, listener] of Object.entries(listeners)) {
        action(type, listener);
      }
    } else if (args.length === 2 && isObject(args[1])) {
      const [item, listeners] = args;

      for (const [type, listener] of Object.entries(listeners)) {
        action(item, type, listener);
      }
    } else {
      action(...args);
    }
  }

  _addListener(...args) {
    const {
      projectListeners,
      itemListeners
    } = this;

    if (args.length === 2) {
      const [type, listener] = args;
      projectListeners[type] = projectListeners[type] || [];

      if (projectListeners[type].indexOf(listener) === -1) {
        projectListeners[type].push(listener);
      }
    } else {
      const [item, type, listener] = args;
      itemListeners[item.id] = itemListeners[item.id] || {};
      itemListeners[item.id][type] = itemListeners[item.id][type] || [];

      if (itemListeners[item.id][type].indexOf(listener) === -1) {
        itemListeners[item.id][type].push(listener);
      }
    }
  }

  _removeListener(...args) {
    const {
      projectListeners,
      itemListeners
    } = this;

    if (args.length === 2) {
      const [type, listener] = args;
      const listeners = projectListeners[type];
      listeners.splice(listeners.indexOf(listener), 1);

      if (!listeners.length) {
        delete projectListeners[type];
      }
    } else {
      const [item, type, listener] = args;
      const listeners = itemListeners[item.id][type];
      listeners.splice(listeners.indexOf(listener), 1);

      if (!listeners.length) {
        delete itemListeners[item.id][type];
      }

      if (!Object.keys(itemListeners[item.id]).length) {
        delete itemListeners[item.id];
      }
    }
  }

  destoy() {
    this.project.view.off('frame', this._frameHandler);
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DaGFuZ2VUcmFja2VyLmpzIl0sIm5hbWVzIjpbImlzT2JqZWN0IiwiZmxhZ05hbWVzIiwiQ2hhbmdlVHJhY2tlciIsImNvbnN0cnVjdG9yIiwicHJvamVjdCIsInByb2plY3RMaXN0ZW5lcnMiLCJpdGVtTGlzdGVuZXJzIiwiX2ZyYW1lSGFuZGxlciIsIl9oYW5kbGVDaGFuZ2VzIiwiZW5hYmxlZCIsImFjdGlvbiIsInZpZXciLCJfY2hhbmdlcyIsImxlbmd0aCIsImdyb3VwZWRDaGFuZ2VzIiwiY2hhbmdlIiwiaXRlbSIsImZsYWdzIiwiZ3VpZGUiLCJkYXRhIiwiY2hhbmdlVHJhY2tpbmciLCJpIiwiZmxhZyIsInR5cGUiLCJwdXNoIiwiZW1pdCIsImtleSIsIk9iamVjdCIsImtleXMiLCJpdGVtcyIsIl9jaGFuZ2VzQnlJZCIsImFyZ3MiLCJwYXlsb2FkIiwibGlzdGVuZXIiLCJpZCIsInJlc3BvbmRzIiwib24iLCJfb25PZmYiLCJvZmYiLCJfYWRkTGlzdGVuZXIiLCJiaW5kIiwiX3JlbW92ZUxpc3RlbmVyIiwibGlzdGVuZXJzIiwiZW50cmllcyIsImluZGV4T2YiLCJzcGxpY2UiLCJkZXN0b3kiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFFBQVQsUUFBeUIsZUFBekI7QUFFQSxNQUFNQyxTQUFTLEdBQUc7QUFDaEIsR0FBQyxLQUFLLENBQU4sR0FBVSxZQURNO0FBRWhCLEdBQUMsS0FBSyxDQUFOLEdBQVUsVUFGTTtBQUdoQixHQUFDLEtBQUssQ0FBTixHQUFVLFdBSE07QUFJaEIsR0FBQyxLQUFLLENBQU4sR0FBVSxVQUpNO0FBS2hCLEdBQUMsS0FBSyxDQUFOLEdBQVUsVUFMTTtBQU1oQixHQUFDLEtBQUssQ0FBTixHQUFVLFFBTk07QUFPaEIsR0FBQyxLQUFLLENBQU4sR0FBVSxPQVBNO0FBUWhCLEdBQUMsS0FBSyxDQUFOLEdBQVUsV0FSTTtBQVNoQixHQUFDLEtBQUssQ0FBTixHQUFVLFNBVE07QUFVaEIsR0FBQyxLQUFLLENB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J1xuXG5jb25zdCBmbGFnTmFtZXMgPSB7XG4gIFsxIDw8IDBdOiAnYXBwZWFyYW5jZScsXG4gIFsxIDw8IDFdOiAnY2hpbGRyZW4nLFxuICBbMSA8PCAyXTogJ2luc2VydGlvbicsXG4gIFsxIDw8IDNdOiAnZ2VvbWV0cnknLFxuICBbMSA8PCA0XTogJ3NlZ21lbnRzJyxcbiAgWzEgPDwgNV06ICdzdHJva2UnLFxuICBbMSA8PCA2XTogJ3N0eWxlJyxcbiAgWzEgPDwgN106ICdhdHRyaWJ1dGUnLFxuICBbMSA8PCA4XTogJ2NvbnRlbnQnLFxuICBbMSA8PCA5XTogJ3BpeGVscycsXG4gIFsxIDw8IDEwXTogJ2NsaXBwaW5nJyxcbiAgWzEgPDwgMTFdOiAndmlldydcbn1cblxuZXhwb3J0IGNsYXNzIENoYW5nZVRyYWNrZXIge1xuICBjb25zdHJ1Y3Rvcihwcm9qZWN0KSB7XG4gICAgdGhpcy5wcm9qZWN0ID0gcHJvamVjdFxuICAgIHRoaXMucHJvamVjdExpc3RlbmVycyA9IHt9XG4gICAgdGhpcy5pdGVtTGlzdGVuZXJzID0ge31cbiAgICB0aGlzLl9mcmFtZUhhbmRsZXIgPSAoKSA9PiB0aGlzLl9oYW5kbGVDaGFuZ2VzKClcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlXG4gIH1cblxuICBzZXQgZW5hYmxlZChlbmFibGVkKSB7XG4gICAgY29uc3QgYWN0aW9uID0gZW5hYmxlZCA/ICdvbicgOiAnb2ZmJ1xuICAgIHRoaXMucHJvamVjdC52aWV3W2FjdGlvbl0oJ2ZyYW1lJywgdGhpcy5fZnJhbWVIYW5kbGVyKVxuICB9XG5cbiAgX2hhbmRsZUNoYW5nZXMoKSB7XG4gICAgY29uc3QgeyBwcm9qZWN0IH0gPSB0aGlzXG4gICAgaWYgKHByb2plY3QuX2NoYW5nZXM/Lmxlbmd0aCkge1xuXG4gICAgICBjb25zdCBncm91cGVkQ2hhbmdlcyA9IHt9XG5cbiAgICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIHByb2plY3QuX2NoYW5nZXMpIHtcbiAgICAgICAgY29uc3QgeyBpdGVtLCBmbGFncyB9ID0gY2hhbmdlXG5cbiAgICAgICAgaWYgKCFpdGVtLmd1aWRlICYmIChpdGVtLmRhdGEuY2hhbmdlVHJhY2tpbmcgIT09IGZhbHNlKSkge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZmxhZyA9IDEgPDwgaVxuICAgICAgICAgICAgaWYgKGZsYWdzICYgZmxhZykge1xuICAgICAgICAgICAgICBjb25zdCB0eXBlID0gZmxhZ05hbWVzW2ZsYWddXG4gICAgICAgICAgICAgIGdyb3VwZWRDaGFuZ2VzW3R5cGVdID0gZ3JvdXBlZENoYW5nZXNbdHlwZV0gfHwgW11cbiAgICAgICAgICAgICAgZ3JvdXBlZENoYW5nZXNbdHlwZV0ucHVzaChpdGVtKVxuICAgICAgICAgICAgICB0aGlzLmVtaXQoaXRlbSwgdHlwZSwgY2hhbmdlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhncm91cGVkQ2hhbmdlcykpIHtcbiAgICAgICAgY29uc3QgaXRlbXMgPSBncm91cGVkQ2hhbmdlc1trZXldXG4gICAgICAgIHRoaXMuZW1pdChrZXksIHsgaXRlbXMgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgcHJvamVjdC5fY2hhbmdlcyA9IFtdXG4gICAgcHJvamVjdC5fY2hhbmdlc0J5SWQgPSB7fVxuICB9XG5cbiAgLyoqXG4gICAqIEVtaXQgYW4gZXZlbnQgb24gYW4gaXRlbS5cbiAgICogQHBhcmFtIHtQYXBlckl0ZW19IGl0ZW1cbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICogQHBhcmFtIHsqfSBwYXlsb2FkXG4gICAqLy8qKlxuICAgKiBFbWl0IGFuIGV2ZW50IG9uIHRoZSBwcm9qZWN0LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgKiBAcGFyYW0geyp9IHBheWxvYWRcbiAgICovXG4gIGVtaXQoLi4uYXJncykge1xuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMykge1xuICAgICAgY29uc3QgW2l0ZW0sIHR5cGUsIHBheWxvYWRdID0gYXJnc1xuICAgICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiB0aGlzLml0ZW1MaXN0ZW5lcnNbaXRlbS5pZF0/Llt0eXBlXSB8fCBbXSkge1xuICAgICAgICBsaXN0ZW5lcihwYXlsb2FkKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBbdHlwZSwgcGF5bG9hZF0gPSBhcmdzXG4gICAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIHRoaXMucHJvamVjdExpc3RlbmVyc1t0eXBlXSB8fCBbXSkge1xuICAgICAgICBsaXN0ZW5lcihwYXlsb2FkKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhbiBpdGVtIGhhcyBvbmUgb3IgbW9yZSBldmVudCBsaXN0ZW5lcnMgb2YgdGhlIHNwZWNpZmllZCB0eXBlLlxuICAgKiBAcGFyYW0ge1BhcGVySXRlbX0gaXRlbVxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgKi8vKipcbiAgICogQ2hlY2sgaWYgdGhlIHByb2plY3QgaGFzIG9uIG9yIG1vcmUgZXZlbnQgbGlzdGVuZXJzIG9mIHRoZSBzcGVjaWZpZWQgdHlwZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICovXG4gIHJlc3BvbmRzKC4uLmFyZ3MpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnN0IFtpdGVtLCB0eXBlXSA9IGFyZ3NcbiAgICAgIHJldHVybiAhISh0aGlzLml0ZW1MaXN0ZW5lcnNbaXRlbV0/Llt0eXBlXT8ubGVuZ3RoKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBbdHlwZV0gPSBhcmdzXG4gICAgICByZXR1cm4gISEodGhpcy5wcm9qZWN0TGlzdGVuZXJzW3R5cGVdPy5sZW5ndGgpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhbiBldmVudCBsaXN0ZW5lciB0byBhbiBpdGVtLlxuICAgKiBAcGFyYW0ge1BhcGVySXRlbX0gaXRlbVxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICAgKi8vKipcbiAgICogQXR0YWNoIG9uZSBvciBtb3JlIGV2ZW50IGxpc3RlbmVycyB0byBhbiBpdGVtLlxuICAgKiBAcGFyYW0ge1BhcGVySXRlbX0gaXRlbVxuICAgKiBAcGFyYW0ge09iamVjdH0gbGlzdGVuZXJzXG4gICAqLy8qKlxuICAgKiBBdHRhY2ggYW4gZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHByb2plY3QuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gICAqLy8qKlxuICAgKiBBdHRhY2ggb25lIG9yIG1vcmUgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHByb2plY3QuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBsaXN0ZW5lcnNcbiAgICovXG4gIG9uKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9vbk9mZignb24nLCAuLi5hcmdzKVxuICB9XG5cbiAgLyoqXG4gICAqIERldGFjaCBhbiBldmVudCBsaXN0ZW5lciBmcm9tIGFuIGl0ZW0uXG4gICAqIEBwYXJhbSB7UGFwZXJJdGVtfSBpdGVtXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gICAqLy8qKlxuICAgKiBEZXRhY2ggb25lIG9yIG1vcmUgZXZlbnQgbGlzdGVuZXJzIGZyb20gYW4gaXRlbS5cbiAgICogQHBhcmFtIHtQYXBlckl0ZW19IGl0ZW1cbiAgICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmVyc1xuICAgKi8vKipcbiAgICogRGV0YWNoIGFuIGV2ZW50IGxpc3RlbmVyIGZyb20gdGhlIHByb2plY3QuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gICAqLy8qKlxuICAgKiBEZXRhY2ggb25lIG9yIG1vcmUgZXZlbnQgbGlzdGVuZXIgZnJvbSB0aGUgcHJvamVjdC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmVyc1xuICAgKi9cbiAgb2ZmKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9vbk9mZignb2ZmJywgLi4uYXJncylcbiAgfVxuXG4gIF9vbk9mZih0eXBlLCAuLi5hcmdzKSB7XG4gICAgY29uc3QgYWN0aW9uID0gKHR5cGUgPT09ICdvbicpXG4gICAgICA/IHRoaXMuX2FkZExpc3RlbmVyLmJpbmQodGhpcylcbiAgICAgIDogdGhpcy5fcmVtb3ZlTGlzdGVuZXIuYmluZCh0aGlzKVxuXG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICBjb25zdCBbbGlzdGVuZXJzXSA9IGFyZ3NcbiAgICAgIGZvciAoY29uc3QgW3R5cGUsIGxpc3RlbmVyXSBvZiBPYmplY3QuZW50cmllcyhsaXN0ZW5lcnMpKSB7XG4gICAgICAgIGFjdGlvbih0eXBlLCBsaXN0ZW5lcilcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAyICYmIGlzT2JqZWN0KGFyZ3NbMV0pKSB7XG4gICAgICBjb25zdCBbaXRlbSwgbGlzdGVuZXJzXSA9IGFyZ3NcbiAgICAgIGZvciAoY29uc3QgW3R5cGUsIGxpc3RlbmVyXSBvZiBPYmplY3QuZW50cmllcyhsaXN0ZW5lcnMpKSB7XG4gICAgICAgIGFjdGlvbihpdGVtLCB0eXBlLCBsaXN0ZW5lcilcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYWN0aW9uKC4uLmFyZ3MpXG4gICAgfVxuICB9XG5cbiAgX2FkZExpc3RlbmVyKC4uLmFyZ3MpIHtcbiAgICBjb25zdCB7IHByb2plY3RMaXN0ZW5lcnMsIGl0ZW1MaXN0ZW5lcnMgfSA9IHRoaXNcblxuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc3QgW3R5cGUsIGxpc3RlbmVyXSA9IGFyZ3NcbiAgICAgIHByb2plY3RMaXN0ZW5lcnNbdHlwZV0gPSBwcm9qZWN0TGlzdGVuZXJzW3R5cGVdIHx8IFtdXG5cbiAgICAgIGlmIChwcm9qZWN0TGlzdGVuZXJzW3R5cGVdLmluZGV4T2YobGlzdGVuZXIpID09PSAtMSkge1xuICAgICAgICBwcm9qZWN0TGlzdGVuZXJzW3R5cGVdLnB1c2gobGlzdGVuZXIpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IFtpdGVtLCB0eXBlLCBsaXN0ZW5lcl0gPSBhcmdzXG4gICAgICBpdGVtTGlzdGVuZXJzW2l0ZW0uaWRdID0gaXRlbUxpc3RlbmVyc1tpdGVtLmlkXSB8fCB7fVxuICAgICAgaXRlbUxpc3RlbmVyc1tpdGVtLmlkXVt0eXBlXSA9IGl0ZW1MaXN0ZW5lcnNbaXRlbS5pZF1bdHlwZV0gfHwgW11cblxuICAgICAgaWYgKGl0ZW1MaXN0ZW5lcnNbaXRlbS5pZF1bdHlwZV0uaW5kZXhPZihsaXN0ZW5lcikgPT09IC0xKSB7XG4gICAgICAgIGl0ZW1MaXN0ZW5lcnNbaXRlbS5pZF1bdHlwZV0ucHVzaChsaXN0ZW5lcilcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfcmVtb3ZlTGlzdGVuZXIoLi4uYXJncykge1xuICAgIGNvbnN0IHsgcHJvamVjdExpc3RlbmVycywgaXRlbUxpc3RlbmVycyB9ID0gdGhpc1xuXG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB7XG4gICAgICBjb25zdCBbdHlwZSwgbGlzdGVuZXJdID0gYXJnc1xuICAgICAgY29uc3QgbGlzdGVuZXJzID0gcHJvamVjdExpc3RlbmVyc1t0eXBlXVxuICAgICAgbGlzdGVuZXJzLnNwbGljZShsaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lciksIDEpXG4gICAgICBpZiAoIWxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgZGVsZXRlIHByb2plY3RMaXN0ZW5lcnNbdHlwZV1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgW2l0ZW0sIHR5cGUsIGxpc3RlbmVyXSA9IGFyZ3NcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IGl0ZW1MaXN0ZW5lcnNbaXRlbS5pZF1bdHlwZV1cbiAgICAgIGxpc3RlbmVycy5zcGxpY2UobGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpLCAxKVxuICAgICAgaWYgKCFsaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgIGRlbGV0ZSBpdGVtTGlzdGVuZXJzW2l0ZW0uaWRdW3R5cGVdXG4gICAgICB9XG4gICAgICBpZiAoIU9iamVjdC5rZXlzKGl0ZW1MaXN0ZW5lcnNbaXRlbS5pZF0pLmxlbmd0aCkge1xuICAgICAgICBkZWxldGUgaXRlbUxpc3RlbmVyc1tpdGVtLmlkXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRlc3RveSgpIHtcbiAgICB0aGlzLnByb2plY3Qudmlldy5vZmYoJ2ZyYW1lJywgdGhpcy5fZnJhbWVIYW5kbGVyKVxuICB9XG59XG4iXX0=