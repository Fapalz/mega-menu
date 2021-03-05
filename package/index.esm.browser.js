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
