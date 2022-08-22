import { whenTransitionEnds } from '@fapalz/utils/src/utils/transition'
import { isDomElement } from '@fapalz/utils/src/utils/index'

export default class MegaMenu {
  constructor(element, options) {
    try {
      this.options = MegaMenu.mergeSettings(options)
      this.element =
        typeof element === 'string' ? document.querySelector(element) : element

      if (!isDomElement(this.element)) {
        throw new Error(
          'Element shold be is ELEMENT_NODE, check your parameter'
        )
      }
      ;['openHandler', 'closeHandler'].forEach((method) => {
        this[method] = this[method].bind(this)
      })

      this.init()
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Overrides default settings with custom ones.
   * @param {Object} options - Optional settings object.
   * @returns {Object} - Custom settings.
   */
  static mergeSettings(options) {
    const settings = {
      dataBackBtn: 'data-mega-back-btn',
      dataContainer: 'data-mega-container',
      dataList: 'data-mega-list',
      dataItem: 'data-mega-item',
      dataLink: 'data-mega-link',

      // Events
      init: () => {},
      openTransitionStart: () => {},
      openTransitionEnd: () => {},
      closeTransitionStart: () => {},
      closeTransitionEnd: () => {},
      beforeDestroy: () => {},
      destroy: () => {},
    }

    const userSttings = Object.keys(options)

    userSttings.forEach((name) => {
      settings[name] = options[name]
    })

    return settings
  }

  attachEvents() {
    // const links = this.element.querySelectorAll(`[${this.options.dataLink}]`)
    this.element.addEventListener('click', this.openHandler)
    this.element.addEventListener('click', this.closeHandler)
  }

  detachEvents() {
    this.element.removeEventListener('click', this.openHandler)
    this.element.removeEventListener('click', this.closeHandler)
  }

  openHandler(e) {
    if (!e.target.closest(`[${this.options.dataLink}]`)) return

    e.preventDefault()
    const element = e.target.closest(`[${this.options.dataLink}]`)
    this.openItem(element)
  }

  closeHandler(e) {
    if (!e.target.closest(`[${this.options.dataBackBtn}]`)) return

    e.preventDefault()
    const { length } = this.openItems
    if (length === 0) {
      return
    }
    this.closeItem()
  }

  getScroll() {
    return this.element.scrollTop
  }

  updateScroll(scroll) {
    this.element.scrollTop = scroll
    return scroll
  }

  updateHeight() {
    if (this.openItems.length) {
      const current = this.openItems[this.openItems.length - 1]
      const height = current.subMenu.offsetHeight
      this.innerContainer.style.height = `${height}px`
    } else {
      this.innerContainer.style.removeProperty('height')
    }
  }

  updateHeightBefore() {
    if (this.openItems.length) {
      const current = this.openItems[this.openItems.length - 1]
      const height = Math.max(
        current.subMenu.offsetHeight,
        current.list.offsetHeight
      )
      this.innerContainer.style.height = `${height}px`
    }
  }

  openItem(element) {
    const item = element.parentElement
    const list = item.closest(`[${this.options.dataList}]`)
    const subMenu = item.querySelector(`[${this.options.dataList}]`)
    const scroll = this.getScroll()

    if (list && item && !item.classList.contains('is-animation')) {
      item.classList.add('is-active', 'is-animation')
      list.classList.add('is-active')

      this.openItems.push({
        item,
        list,
        subMenu,
        link: element,
        scroll,
      })

      this.updateHeightBefore()
      this.updateScroll(0)
      this.options.openTransitionStart.call(this, item, this)

      whenTransitionEnds(list, '', () => {
        this.updateHeight()
        this.options.openTransitionEnd.call(this, item, this)
      })
    }

    return this.openItems
  }

  closeItem() {
    if (this.openItems.length) {
      const current = this.openItems[this.openItems.length - 1]

      const { item, list } = current

      if (list && window.parent) {
        item.classList.remove('is-active')
        list.classList.remove('is-active')
        const { scroll } = current
        this.updateHeightBefore()
        this.openItems.pop()
        this.updateScroll(scroll)
        this.options.closeTransitionStart.call(this, item, this)

        whenTransitionEnds(list, '', () => {
          this.updateHeight()
          item.classList.remove('is-animation')
          this.options.closeTransitionEnd.call(this, item, this)
        })
      }
    }

    return this.openItems
  }

  closeAllItems() {
    let index = this.openItems.length
    // eslint-disable-next-line no-plusplus
    while (index--) {
      this.closeItem()
    }
  }

  destroy() {
    this.options.beforeDestroy.call(this, this)
    this.closeAllItems()
    this.detachEvents()
    this.isInit = false
    this.options.destroy.call(this, this)
  }

  /**
   * Init navigation
   */
  init() {
    if (this.isInit) {
      return
    }

    this.innerContainer = this.element.querySelector(
      `[${this.options.dataContainer}]`
    )
    this.openItems = []

    this.attachEvents()
    this.isInit = true
    this.options.init.call(this, this)
  }
}
