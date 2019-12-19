import { isObject } from '@wektor/utils'

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
}

export class ChangeTracker {
  constructor(project) {
    this.project = project
    this.projectListeners = {}
    this.itemListeners = {}
    this._frameHandler = () => this._handleChanges()
    this.enabled = true
  }

  set enabled(enabled) {
    const action = enabled ? 'on' : 'off'
    this.project.view[action]('frame', this._frameHandler)
  }

  _handleChanges() {
    const { project } = this
    if (project._changes?.length) {

      const groupedChanges = {}

      for (const change of project._changes) {
        const { item, flags } = change

        if (!item.guide && (item.data.changeTracking !== false)) {
          for (let i = 0; i < 12; i++) {
            const flag = 1 << i
            if (flags & flag) {
              const type = flagNames[flag]
              groupedChanges[type] = groupedChanges[type] || []
              groupedChanges[type].push(item)
              this.emit(item, type, change)
            }
          }
        }
      }

      for (const key of Object.keys(groupedChanges)) {
        const items = groupedChanges[key]
        this.emit(key, { items })
      }
    }
    project._changes = []
    project._changesById = {}
  }

  /**
   * Emit an event on an item.
   * @param {PaperItem} item
   * @param {String} type
   * @param {*} payload
   *//**
   * Emit an event on the project.
   * @param {String} type
   * @param {*} payload
   */
  emit(...args) {
    if (args.length === 3) {
      const [item, type, payload] = args
      for (const listener of this.itemListeners[item.id]?.[type] || []) {
        listener(payload)
      }
    } else {
      const [type, payload] = args
      for (const listener of this.projectListeners[type] || []) {
        listener(payload)
      }
    }
  }

  /**
   * Check if an item has one or more event listeners of the specified type.
   * @param {PaperItem} item
   * @param {String} type
   *//**
   * Check if the project has on or more event listeners of the specified type.
   * @param {String} type
   * @param {String} type
   */
  responds(...args) {
    if (args.length === 2) {
      const [item, type] = args
      return !!(this.itemListeners[item]?.[type]?.length)
    } else {
      const [type] = args
      return !!(this.projectListeners[type]?.length)
    }
  }

  /**
   * Attach an event listener to an item.
   * @param {PaperItem} item
   * @param {String} type
   * @param {Function} listener
   *//**
   * Attach one or more event listeners to an item.
   * @param {PaperItem} item
   * @param {Object} listeners
   *//**
   * Attach an event listener to the project.
   * @param {String} type
   * @param {Function} listener
   *//**
   * Attach one or more event listener to the project.
   * @param {String} type
   * @param {Object} listeners
   */
  on(...args) {
    this._onOff('on', ...args)
  }

  /**
   * Detach an event listener from an item.
   * @param {PaperItem} item
   * @param {String} type
   * @param {Function} listener
   *//**
   * Detach one or more event listeners from an item.
   * @param {PaperItem} item
   * @param {Object} listeners
   *//**
   * Detach an event listener from the project.
   * @param {String} type
   * @param {Function} listener
   *//**
   * Detach one or more event listener from the project.
   * @param {String} type
   * @param {Object} listeners
   */
  off(...args) {
    this._onOff('off', ...args)
  }

  _onOff(type, ...args) {
    const action = (type === 'on')
      ? this._addListener.bind(this)
      : this._removeListener.bind(this)

    if (args.length === 1) {
      const [listeners] = args
      for (const [type, listener] of Object.entries(listeners)) {
        action(type, listener)
      }
    } else if (args.length === 2 && isObject(args[1])) {
      const [item, listeners] = args
      for (const [type, listener] of Object.entries(listeners)) {
        action(item, type, listener)
      }
    } else {
      action(...args)
    }
  }

  _addListener(...args) {
    const { projectListeners, itemListeners } = this

    if (args.length === 2) {
      const [type, listener] = args
      projectListeners[type] = projectListeners[type] || []

      if (projectListeners[type].indexOf(listener) === -1) {
        projectListeners[type].push(listener)
      }
    } else {
      const [item, type, listener] = args
      itemListeners[item.id] = itemListeners[item.id] || {}
      itemListeners[item.id][type] = itemListeners[item.id][type] || []

      if (itemListeners[item.id][type].indexOf(listener) === -1) {
        itemListeners[item.id][type].push(listener)
      }
    }
  }

  _removeListener(...args) {
    const { projectListeners, itemListeners } = this

    if (args.length === 2) {
      const [type, listener] = args
      const listeners = projectListeners[type]
      listeners.splice(listeners.indexOf(listener), 1)
      if (!listeners.length) {
        delete projectListeners[type]
      }
    } else {
      const [item, type, listener] = args
      const listeners = itemListeners[item.id][type]
      listeners.splice(listeners.indexOf(listener), 1)
      if (!listeners.length) {
        delete itemListeners[item.id][type]
      }
      if (!Object.keys(itemListeners[item.id]).length) {
        delete itemListeners[item.id]
      }
    }
  }

  destoy() {
    this.project.view.off('frame', this._frameHandler)
  }
}
