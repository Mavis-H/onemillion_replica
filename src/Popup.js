import React from "react";
import "./Popup.css"

const Popup = props => {
  return (
    <div className="popup-box">
      <div className="box">
        <span className="close-icon" id={props.id} onClick={props.handleClose}>x</span>
        {props.content}
      </div>
    </div>
  );
};

export default Popup;
