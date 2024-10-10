"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _default = function _default() {
  return /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
};

exports.default = _default;