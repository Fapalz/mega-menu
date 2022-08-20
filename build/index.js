/**
 * MegaMenu  1.1.0
 * GitHub template for starting new projects
 * https://github.com/Fapalz/mega-menu#readme
 *
 * Copyright 2020-2022 Gladikov Kirill - Fapalz <blacesmot@gmail.com>
 *
 * Released under the MIT License
 *
 * Released on: August 20, 2022
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MegaMenu = factory());
}(this, (function () { 'use strict';

  var inBrowser = typeof window !== 'undefined';
  var inWeex = // eslint-disable-next-line no-undef
  typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform; // eslint-disable-next-line no-undef

  var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
  UA && /msie|trident/.test(UA);
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
  var isEdge = UA && UA.indexOf('edge/') > 0;
  UA && UA.indexOf('android') > 0 || weexPlatform === 'android';
  UA && /iphone|ipad|ipod|ios/.test(UA) || weexPlatform === 'ios';
  UA && /chrome\/\d+/.test(UA) && !isEdge;
  UA && /phantomjs/.test(UA);
  UA && UA.match(/firefox\/(\d+)/);

  /* eslint-disable import/no-mutable-exports */
  var hasTransition = inBrowser && !isIE9;
  var TRANSITION = 'transition';
  var ANIMATION = 'animation'; // Transition property/event sniffing

  var transitionProp = 'transition';
  var transitionEndEvent = 'transitionend';
  var animationProp = 'animation';
  var animationEndEvent = 'animationend';

  if (hasTransition) {
    /* istanbul ignore if */
    if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
      transitionProp = 'WebkitTransition';
      transitionEndEvent = 'webkitTransitionEnd';
    }

    if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
      animationProp = 'WebkitAnimation';
      animationEndEvent = 'webkitAnimationEnd';
    }
  } // binding to window is necessary to make hot reload work in IE in strict mode


  inBrowser ? window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout : function (fn) {
    return fn();
  }; // Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
  // in a locale-dependent way, using a comma instead of a dot.
  // If comma is not replaced with a dot, the input will be rounded down (i.e. acting
  // as a floor function) causing unexpected behaviors

  function toMs(s) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000;
  }

  function getTimeout(delays, durations) {
    while (delays.length < durations.length) {
      // eslint-disable-next-line no-param-reassign
      delays = delays.concat(delays);
    }

    return Math.max.apply(null, durations.map(function (d, i) {
      return toMs(d) + toMs(delays[i]);
    }));
  }

  var transformRE = /\b(transform|all)(,|$)/;
  function getTransitionInfo(el, expectedType) {
    var styles = window.getComputedStyle(el); // JSDOM may return undefined for transition properties

    var transitionDelays = (styles[transitionProp + "Delay"] || '').split(', ');
    var transitionDurations = (styles[transitionProp + "Duration"] || '').split(', ');
    var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    var animationDelays = (styles[animationProp + "Delay"] || '').split(', ');
    var animationDurations = (styles[animationProp + "Duration"] || '').split(', ');
    var animationTimeout = getTimeout(animationDelays, animationDurations);
    var type;
    var timeout = 0;
    var propCount = 0;
    /* istanbul ignore if */

    if (expectedType === TRANSITION) {
      if (transitionTimeout > 0) {
        type = TRANSITION;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION) {
      if (animationTimeout > 0) {
        type = ANIMATION;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else {
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
      propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
    }

    var hasTransform = type === TRANSITION && transformRE.test(styles[transitionProp + "Property"]);
    return {
      type: type,
      timeout: timeout,
      propCount: propCount,
      hasTransform: hasTransform
    };
  }
  function whenTransitionEnds(el, expectedType, cb) {
    var _getTransitionInfo = getTransitionInfo(el, expectedType),
        type = _getTransitionInfo.type,
        timeout = _getTransitionInfo.timeout,
        propCount = _getTransitionInfo.propCount;

    if (!type) return cb();
    var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
    var ended = 0;

    var end = function end() {
      // eslint-disable-next-line no-use-before-define
      el.removeEventListener(event, onEnd);
      cb();
    };

    var onEnd = function onEnd(e) {
      if (e.target === el) {
        ended += 1;

        if (ended >= propCount) {
          end();
        }
      }
    };

    setTimeout(function () {
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(event, onEnd);
    return el;
  }

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

    _proto.updateHeightBeforeOpen = function updateHeightBeforeOpen() {
      if (this.openItems.length) {
        var current = this.openItems[this.openItems.length - 1];
        var height = Math.max(this.element.offsetHeight, current.list.offsetHeight);
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
        this.updateHeightBeforeOpen();
        this.updateScroll(0);
        this.options.openTransitionStart.call(this, item, this);
        whenTransitionEnds(list, '', function () {
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
          this.openItems.pop();
          this.updateHeight();
          this.updateScroll(scroll);
          this.options.closeTransitionStart.call(this, item, this);
          whenTransitionEnds(list, '', function () {
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

  return MegaMenu;

})));
