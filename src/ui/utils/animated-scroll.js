
var requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame;
  })();

  var easeInOutQuad = function (t, b, c, d) {
      t /= d/2;
      if (t < 1) return c/2*t*t + b;
      t--;
      return -c/2 * (t*(t-2) - 1) + b;
  };

  var scrollTo = function (element, property, to, callback) {
      element[property] = to;
      setTimeout(function() {
          callback();
      }, 200);
  };

  var animatedScrollTo = function (element, to, duration, callback) {
      var start = element.scrollTop,
      change = to - start,
      animationStart = +new Date();
      var animating = true;
      var lastpos = null;

      if (element.scrollTop === to) return callback();

      var animateScroll = function() {
          if (!animating) {
              return;
          }
          requestAnimFrame(animateScroll);
          var now = +new Date();
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
              if (callback) { callback(); }
          }
      };
      requestAnimFrame(animateScroll);
      var cancel = function() {
          animating = false;
      };

      // Some environments are failing to process the animated scroll some of the time.
      // Add a fallback to force the issue should the scroll fail to have occurred
      var cancelFallbackTimeoutId = setTimeout(function() {
          if (animating) cancel();
          if (Math.abs(to - element.scrollTop) > 10) {
              scrollTo(element, 'scrollTop', to, callback);
          }
      }, duration + 20);

      return cancel;
  };

  var animatedScrollLeftTo = function (element, to, duration, callback) {
      var start = element.scrollLeft,
      change = to - start,
      animationStart = +new Date();
      var animating = true;
      var callbackCalled = false;
      var lastpos = null;

      if (element.scrollLeft === to) return callback();

      var animateScroll = function() {
          if (!animating) {
              if (callback && !callbackCalled) callback();
              callbackCalled = true;
              return;
          }
          requestAnimFrame(animateScroll);
          var now = +new Date();
          var val = Math.floor(easeInOutQuad(now - animationStart, start, change, duration));
          if (lastpos) {
              if (lastpos === element.scrollLeft) {
                  console.log(`lastpost === element.scrollLeft: ${lastpos}; val=${val}`);
                  element.scrollLeft = val;
                  lastpos = element.scrollLeft;
                  console.log(`Updated to ${element.scrollLeft}`);
              } else {
                  console.log("ScrollLeft has moved; canceling");
                  animating = false;
              }
          } else {
              element.scrollLeft = val;
              lastpos = element.scrollLeft;
              console.log(`Scrolling to ${val}; actual value ${element.scrollLeft}`);
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
      var cancel = function() {
          animating = false;
      };

      // Some environments are failing to process the animated scroll some of the time.
      // Add a fallback to force the issue should the scroll fail to have occurred
      const cancelFallbackTimeoutId = setTimeout(function() {
          if (animating) cancel();
          if (Math.abs(to - element.scrollTop) > 10) {
              scrollTo(element, 'scrollLeft', to, callback);
          }
      }, duration + 20);

      return cancel;
  };

  module.exports = {
    animatedScrollTo: animatedScrollTo,
    animatedScrollLeftTo: animatedScrollLeftTo,
  };