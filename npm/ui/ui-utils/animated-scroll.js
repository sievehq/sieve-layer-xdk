/**
 * Simple scrolling animation library forked from https://github.com/madebysource/animated-scrollto,
 * and customized to our needs.
 *
 * @class Layer.UI.UIUtils
 */
'use strict';



var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

var easeInOutQuad = function easeInOutQuad(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t + b;
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
};

var scrollTo = function scrollTo(element, property, to, callback) {
  element[property] = to;
  setTimeout(function () {
    return callback();
  }, 200);
};

/**
 * Scroll to the specified vertical position
 *
 * @param {HTMLElement} element    The element to scroll
 * @param {Number} to              The Y position to scroll to
 * @param {Number} duration        The number of miliseconds to take to complete scrolling
 * @param {Function} callback      The function to call once the scrolling is completed
 */
var animatedScrollTo = function animatedScrollTo(element, to, duration, callback) {
  var start = element.scrollTop;
  var change = to - start;
  var animationStart = Date.now();
  var animating = true;
  var lastpos = null;

  if (element.scrollTop === to) return callback();

  var animateScroll = function animateScroll() {
    if (!animating) {
      return;
    }
    requestAnimFrame(animateScroll);
    var now = Date.now();
    var val = Math.floor(easeInOutQuad(now - animationStart, start, change, duration));
    if (lastpos) {
      if (lastpos === element.scrollTop) {
        element.scrollTop = val;
        lastpos = element.scrollTop;
      } else {
        animating = false;
      }
    } else {
      element.scrollTop = val;
      lastpos = element.scrollTop;
    }
    if (now > animationStart + duration) {
      element.scrollTop = to;
      animating = false;
      if (callback) {
        callback();
      }
    }
  };
  requestAnimFrame(animateScroll);
  var cancel = function cancel() {
    return animating = false;
  };

  // Some environments are failing to process the animated scroll some of the time.
  // Add a fallback to force the issue should the scroll fail to have occurred
  setTimeout(function () {
    if (animating) cancel();
    if (Math.abs(to - element.scrollTop) > 10) {
      scrollTo(element, 'scrollTop', to, callback);
    }
  }, duration + 20);

  return cancel;
};

/**
 * Scroll to the specified horizontal position
 *
 * @param {HTMLElement} element    The element to scroll
 * @param {Number} to              The X position to scroll to
 * @param {Number} duration        The number of miliseconds to take to complete scrolling
 * @param {Function} callback      The function to call once the scrolling is completed
 */
var animatedScrollLeftTo = function animatedScrollLeftTo(element, to, duration, callback) {
  var start = element.scrollLeft;
  var change = to - start;
  var animationStart = Date.now();
  var animating = true;
  var callbackCalled = false;
  var lastpos = null;

  if (element.scrollLeft === to) return callback();

  var animateScroll = function animateScroll() {
    if (!animating) {
      if (callback && !callbackCalled) callback();
      callbackCalled = true;
      return;
    }
    requestAnimFrame(animateScroll);
    var now = Date.now();
    var val = Math.floor(easeInOutQuad(now - animationStart, start, change, duration));
    if (lastpos) {
      if (lastpos === element.scrollLeft) {
        element.scrollLeft = val;
        lastpos = element.scrollLeft;
      } else {
        animating = false;
      }
    } else {
      element.scrollLeft = val;
      lastpos = element.scrollLeft;
    }
    if (now > animationStart + duration) {
      element.scrollLeft = to;
      animating = false;
      if (callback) {
        callbackCalled = true;
        callback();
      }
    }
  };
  requestAnimFrame(animateScroll);
  var cancel = function cancel() {
    return animating = false;
  };

  // Some environments are failing to process the animated scroll some of the time.
  // Add a fallback to force the issue should the scroll fail to have occurred
  setTimeout(function () {
    if (animating) cancel();
    if (Math.abs(to - element.scrollTop) > 10) {
      scrollTo(element, 'scrollLeft', to, callback);
    }
  }, duration + 20);

  return cancel;
};

module.exports = {
  animatedScrollTo: animatedScrollTo,
  animatedScrollLeftTo: animatedScrollLeftTo
};