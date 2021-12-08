import './App.css';
import PixelSquare from "./Square";
import "./PixelDetailBoard.css"

const renderSquare = (style, k) => {
  if (style[0] < 0) {
    return <PixelSquare key={k} valid={'X'} validID={'invalid'} rgb={{"background": `rgb(${style[0]},${style[1]},${style[2]})`}}/>
  }
  else {
    return <PixelSquare key={k} valid={''} validID={'valid'} rgb={{"background": `rgb(${style[0]},${style[1]},${style[2]})`}}/>
  }
}

const PixelDetailBoard = (props) => {
  console.log('pixels', props);
  return <div className="square-board block">
        {
          [...Array(5)].map((_, i) =>
            <div key={i} className="board-row">
              {[...Array(5)].map((_, j) => renderSquare(props.pixels[5*i+j], i*5+j))}
            </div>
          )
        }
        </div>
}

export default PixelDetailBoard;
