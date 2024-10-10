"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Confirm = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _clsx = _interopRequireDefault(require("clsx"));

var _Base = require("./Base");

var _excluded = ["className"];

var Confirm = function Confirm(_ref) {
  var className = _ref.className,
      other = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  return /*#__PURE__*/_react.default.createElement(_Base.Base, (0, _extends2.default)({
    baseClass: "Modal",
    className: (0, _clsx.default)('Confirm', className),
    showClose: false,
    btnVariant: "outline"
  }, other));
};

exports.Confirm = Confirm;