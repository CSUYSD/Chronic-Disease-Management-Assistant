import React from 'react';
import { mountComponent } from '../../utils/mountComponent';
import { Toast } from './Toast';

function show(content, type) {
  var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2000;
  mountComponent( /*#__PURE__*/React.createElement(Toast, {
    content: content,
    type: type,
    duration: duration
  }));
}

export var toast = {
  show: show,
  success: function success(content, duration) {
    show(content, 'success', duration);
  },
  fail: function fail(content, duration) {
    show(content, 'error', duration);
  },
  loading: function loading(content, duration) {
    show(content, 'loading', duration);
  }
};
export { Toast };