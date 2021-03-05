/**
 * MegaMenu  1.0.0
 * GitHub template for starting new projects
 * https://github.com/Fapalz/mega-menu#readme
 *
 * Copyright 2020-2021 Gladikov Kirill - Fapalz <blacesmot@gmail.com>
 *
 * Released under the MIT License
 *
 * Released on: March 5, 2021
 */

import { whenTransitionEnds } from '@fapalz/utils/src/utils/transition';

var MegaMenu = /*#__PURE__*/function () {
  function MegaMenu(element, options) {
    var _this = this;

    this.options = MegaMenu.mergeSettings(options);
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    ['openHandler', 'backHandler'].forEach(function (method) {
      _this[method] = _this[method].bind(_this);
    });
    this.init();
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
      dataLink: 'data-mega-link'
    };
    var userSttings = Object.keys(options);
    userSttings.forEach(function (name) {
      settings[name] = options[name];
    });
    return settings;
  };

  var _proto = MegaMenu.prototype;

  _proto.attachEvents = function attachEvents() {
    var _this2 = this;

    var links = this.element.querySelectorAll("[" + this.options.dataLink + "]");
    links.forEach(function (element) {
      element.addEventListener('click', _this2.openHandler);
    });
    this.element.addEventListener('click', this.backHandler);
  };

  _proto.openHandler = function openHandler(e) {
    e.preventDefault();
    var element = e.currentTarget;
    this.openItem(element);
  };

  _proto.backHandler = function backHandler(e) {
    if (!e.target.closest("[" + this.options.dataBackBtn + "]")) return;
    e.preventDefault();
    var length = this.openItems.length;

    if (length === 0) {
      return;
    }

    this.closeItem(this.openItems[length - 1]);
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

  _proto.openItem = function openItem(element) {
    var item = element.parentElement;
    var list = item.closest("[" + this.options.dataList + "]");
    var subMenu = item.querySelector("[" + this.options.dataList + "]");
    var scroll = this.element.scrollTop;

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
      this.updateHeight();
    }

    return this.openItems;
  };

  _proto.closeItem = function closeItem(current) {
    var _this3 = this;

    var item = current.item;
    var list = current.list;

    if (list && window.parent) {
      item.classList.remove('is-active');
      list.classList.remove('is-active');
      var scroll = this.openItems[this.openItems.length - 1].scroll;
      this.openItems.pop();
      whenTransitionEnds(list, '', function () {
        item.classList.remove('is-animation');

        _this3.updateHeight();

        _this3.element.scrollTop = scroll;
      });
    }

    return this.openItems;
  };

  _proto.closeAllItems = function closeAllItems() {
    var index = this.openItems.length; // eslint-disable-next-line no-plusplus

    while (index--) {
      this.closeItem(this.openItems[this.openItems.length - 1]);
    }
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
  };

  return MegaMenu;
}();

export default MegaMenu;
