import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["className"];
import React from 'react';
import clsx from 'clsx';
import { Base } from './Base';
export var Confirm = function Confirm(_ref) {
  var className = _ref.className,
      other = _objectWithoutProperties(_ref, _excluded);

  return /*#__PURE__*/React.createElement(Base, _extends({
    baseClass: "Modal",
    className: clsx('Confirm', className),
    showClose: false,
    btnVariant: "outline"
  }, other));
};