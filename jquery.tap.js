/* from annotator.touch plugin */
jQuery.event.special.tap = {
  add: function(eventHandler) {
    var context, data, onTapEnd, onTapStart;
    data = eventHandler.data = eventHandler.data || {};
    context = this;
    onTapStart = function(event) {
      if (data.preventDefault !== false) {
        event.preventDefault();
      }
      if (data.onTapDown) {
        data.onTapDown.apply(this, arguments);
      }
      data.event = event;
      data.touched = setTimeout(function() {
        return data.touched = null;
      }, data.timeout || 300);
      return jQuery(document).bind({
        touchend: onTapEnd,
        mouseup: onTapEnd
      });
    };
    onTapEnd = function(event) {
      var handler;
      if (data.touched != null) {
        clearTimeout(data.touched);
        if (event.target === context || jQuery.contains(context, event.target)) {
          handler = eventHandler.origHandler || eventHandler.handler;
          handler.call(this, data.event);
        }
        data.touched = null;
      }
      if (data.onTapUp) {
        data.onTapUp.apply(this, arguments);
      }
      return jQuery(document).unbind({
        touchstart: onTapEnd,
        mousedown: onTapEnd
      });
    };
    data.tapHandlers = {
      touchstart: onTapStart,
      mousedown: onTapStart
    };
    if (eventHandler.selector) {
      return jQuery(context).delegate(eventHandler.selector, data.tapHandlers);
    } else {
      return jQuery(context).bind(data.tapHandlers);
    }
  },
  remove: function(eventHandler) {
    return jQuery(this).unbind(eventHandler.data.tapHandlers);
  }
};
