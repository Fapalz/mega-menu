/**
 * MegaMenu  1.1.2
 * GitHub template for starting new projects
 * https://github.com/Fapalz/mega-menu#readme
 *
 * Copyright 2020-2022 Gladikov Kirill - Fapalz <blacesmot@gmail.com>
 *
 * Released under the MIT License
 *
 * Released on: August 22, 2022
 */

'use strict';

var transition = require('@fapalz/utils/src/utils/transition');

var isDomElement = function isDomElement(obj) {
  return !!(obj && obj.nodeType === 1);
};

var MegaMenu = /*#__PURE__*/function () {
  function MegaMenu(element, options) {
    var _this = this;

    try {
      this.options = MegaMenu.mergeSettings(options);
      this.element = typeof element === 'string' ? document.querySelector(element) : element;

      if (!isDomElement(this.element)) {
        throw new Error('Element shold be is ELEMENT_NODE, check your parameter');
      }

      ;
      ['openHandler', 'closeHandler'].forEach(function (method) {
        _this[method] = _this[method].bind(_this);
      });
      this.init();
    } catch (error) {
      console.error(error);
    }
  }
  /**
   * Overrides default settings with custom ones.
   * @param {Object} options - Optional settings object.
   * @returns {Object} - Custom settings.
   */


  MegaMenu.mergeSettings = function mergeSettings(options) {
    var settings = {
      dataBackBtn: 'data-mega-back-btn',
      dataContainer: 'data-mega-container',
      dataList: 'data-mega-list',
      dataItem: 'data-mega-item',
      dataLink: 'data-mega-link',
      // Events
      init: function init() {},
      openTransitionStart: function openTransitionStart() {},
      openTransitionEnd: function openTransitionEnd() {},
      closeTransitionStart: function closeTransitionStart() {},
      closeTransitionEnd: function closeTransitionEnd() {},
      beforeDestroy: function beforeDestroy() {},
      destroy: function destroy() {}
    };
    var userSttings = Object.keys(options);
    userSttings.forEach(function (name) {
      settings[name] = options[name];
    });
    return settings;
  };

  var _proto = MegaMenu.prototype;

  _proto.attachEvents = function attachEvents() {
    // const links = this.element.querySelectorAll(`[${this.options.dataLink}]`)
    this.element.addEventListener('click', this.openHandler);
    this.element.addEventListener('click', this.closeHandler);
  };

  _proto.detachEvents = function detachEvents() {
    this.element.removeEventListener('click', this.openHandler);
    this.element.removeEventListener('click', this.closeHandler);
  };

  _proto.openHandler = function openHandler(e) {
    if (!e.target.closest("[" + this.options.dataLink + "]")) return;
    e.preventDefault();
    var element = e.target.closest("[" + this.options.dataLink + "]");
    this.openItem(element);
  };

  _proto.closeHandler = function closeHandler(e) {
    if (!e.target.closest("[" + this.options.dataBackBtn + "]")) return;
    e.preventDefault();
    var length = this.openItems.length;

    if (length === 0) {
      return;
    }

    this.closeItem();
  };

  _proto.getScroll = function getScroll() {
    return this.element.scrollTop;
  };

  _proto.updateScroll = function updateScroll(scroll) {
    this.element.scrollTop = scroll;
    return scroll;
  };

  _proto.updateHeight = function updateHeight() {
    if (this.openItems.length) {
      var current = this.openItems[this.openItems.length - 1];
      var height = current.subMenu.offsetHeight;
      this.innerContainer.style.height = height + "px";
    } else {
      this.innerContainer.style.removeProperty('height');
    }
  };

  _proto.updateHeightBefore = function updateHeightBefore() {
    if (this.openItems.length) {
      var current = this.openItems[this.openItems.length - 1];
      var height = Math.max(current.subMenu.offsetHeight, current.list.offsetHeight);
      this.innerContainer.style.height = height + "px";
    }
  };

  _proto.openItem = function openItem(element) {
    var _this2 = this;

    var item = element.parentElement;
    var list = item.closest("[" + this.options.dataList + "]");
    var subMenu = item.querySelector("[" + this.options.dataList + "]");
    var scroll = this.getScroll();

    if (list && item && !item.classList.contains('is-animation')) {
      item.classList.add('is-active', 'is-animation');
      list.classList.add('is-active');
      this.openItems.push({
        item: item,
        list: list,
        subMenu: subMenu,
        link: element,
        scroll: scroll
      });
      this.updateHeightBefore();
      this.updateScroll(0);
      this.options.openTransitionStart.call(this, item, this);
      transition.whenTransitionEnds(list, '', function () {
        _this2.updateHeight();

        _this2.options.openTransitionEnd.call(_this2, item, _this2);
      });
    }

    return this.openItems;
  };

  _proto.closeItem = function closeItem() {
    var _this3 = this;

    if (this.openItems.length) {
      var current = this.openItems[this.openItems.length - 1];
      var item = current.item,
          list = current.list;

      if (list && window.parent) {
        item.classList.remove('is-active');
        list.classList.remove('is-active');
        var scroll = current.scroll;
        this.updateHeightBefore();
        this.openItems.pop();
        this.updateScroll(scroll);
        this.options.closeTransitionStart.call(this, item, this);
        transition.whenTransitionEnds(list, '', function () {
          _this3.updateHeight();

          item.classList.remove('is-animation');

          _this3.options.closeTransitionEnd.call(_this3, item, _this3);
        });
      }
    }

    return this.openItems;
  };

  _proto.closeAllItems = function closeAllItems() {
    var index = this.openItems.length; // eslint-disable-next-line no-plusplus

    while (index--) {
      this.closeItem();
    }
  };

  _proto.destroy = function destroy() {
    this.options.beforeDestroy.call(this, this);
    this.closeAllItems();
    this.detachEvents();
    this.isInit = false;
    this.options.destroy.call(this, this);
  }
  /**
   * Init navigation
   */
  ;

  _proto.init = function init() {
    if (this.isInit) {
      return;
    }

    this.innerContainer = this.element.querySelector("[" + this.options.dataContainer + "]");
    this.openItems = [];
    this.attachEvents();
    this.isInit = true;
    this.options.init.call(this, this);
  };

  return MegaMenu;
}();

module.exports = MegaMenu;
