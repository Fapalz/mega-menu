import { whenTransitionEnds } from '@fapalz/utils/src/utils/transition'

export default class MegaMenu {
  constructor(element, options) {
    this.options = MegaMenu.mergeSettings(options)
    this.element =
      typeof element === 'string' ? document.querySelector(element) : element
    ;['openHandler', 'backHandler'].forEach((method) => {
      this[method] = this[method].bind(this)
    })

    this.init()
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
    }

    const userSttings = Object.keys(options)

    userSttings.forEach((name) => {
      settings[name] = options[name]
    })

    return settings
  }

  attachEvents() {
    const links = this.element.querySelectorAll(`[${this.options.dataLink}]`)
    links.forEach((element) => {
      element.addEventListener('click', this.openHandler)
    })

    this.element.addEventListener('click', this.backHandler)
  }

  openHandler(e) {
    e.preventDefault()
    const element = e.currentTarget
    this.openItem(element)
  }

  backHandler(e) {
    if (!e.target.closest(`[${this.options.dataBackBtn}]`)) return

    e.preventDefault()
    const { length } = this.openItems
    if (length === 0) {
      return
    }
    this.closeItem(this.openItems[length - 1])
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

  openItem(element) {
    const item = element.parentElement
    const list = item.closest(`[${this.options.dataList}]`)
    const subMenu = item.querySelector(`[${this.options.dataList}]`)
    const scroll = this.element.scrollTop

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
      this.updateHeight()
    }

    return this.openItems
  }

  closeItem(current) {
    const { item } = current
    const { list } = current

    if (list && window.parent) {
      item.classList.remove('is-active')
      list.classList.remove('is-active')
      const { scroll } = this.openItems[this.openItems.length - 1]
      this.openItems.pop()

      whenTransitionEnds(list, '', () => {
        item.classList.remove('is-animation')
        this.updateHeight()
        this.element.scrollTop = scroll
      })
    }

    return this.openItems
  }

  closeAllItems() {
    let index = this.openItems.length
    // eslint-disable-next-line no-plusplus
    while (index--) {
      this.closeItem(this.openItems[this.openItems.length - 1])
    }
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
  }
}
