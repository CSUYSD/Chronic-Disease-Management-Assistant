"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Modal = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _Base = require("./Base");

var Modal = function Modal(props) {
  return /*#__PURE__*/_react.default.createElement(_Base.Base, (0, _extends2.default)({
    baseClass: "Modal",
    btnVariant: props.vertical === false ? undefined : 'outline'
  }, props));
};

exports.Modal = Modal;