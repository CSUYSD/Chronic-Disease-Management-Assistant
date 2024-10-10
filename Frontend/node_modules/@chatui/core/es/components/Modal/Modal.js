import _extends from "@babel/runtime/helpers/esm/extends";
import React from 'react';
import { Base } from './Base';
export var Modal = function Modal(props) {
  return /*#__PURE__*/React.createElement(Base, _extends({
    baseClass: "Modal",
    btnVariant: props.vertical === false ? undefined : 'outline'
  }, props));
};