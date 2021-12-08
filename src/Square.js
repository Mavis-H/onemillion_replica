import './App.css';
import React, {useState} from "react";

function PixelSquare(props) {
  return (
      <button className="square" id={props.validID} style={props.rgb}>
        {props.valid}
      </button>
  );
}

export default PixelSquare;
