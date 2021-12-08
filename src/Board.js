import React, {useEffect, useState} from "react";
import Popup from "./Popup";
import PixelDetail from "./PixelDetail";
import APIService from "./APIService";

const Board = (props) => {
  // Set pixels value
  const [currentImg, setCurrentImg] = useState("");
  const [currentPixels, setCurrentPixels] = useState([]);
  const [currentCursor, setCurrentCursor] = useState({x: -1, y: -1});
  const [currentInfo, setCurrentInfo] = useState(['','']);

  useEffect(() => {
    setCurrentImg(props.img);
    setCurrentPixels(props.pixels);
  }, [props.img, props.pixels]);

  const handleClick = (event) => {
    const bounds = event.target.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    setCurrentCursor({x: Math.floor(x), y: Math.floor(y)});
    if (Math.floor(x) >= 0 && Math.floor(y) >= 0) {
      setIsOpen(true);
    }
  }

  const getDetailPixels = () => {
    const clickedPixels = [];
    for (let i=0; i<5; i++) {
      for (let j=0; j<5; j++) {
        const col = currentCursor.x-2+j;
        const row = currentCursor.y-2+i;
        if (row < 0 || row > 999 || col < 0 || col > 999) {
          clickedPixels.push([-1,-1,-1]);
          continue;
        }
        let idx = (row)*1000 + (col)
        let owned = false;
        for (let k=0; k<currentPixels.length; k++) {
          const pixel = currentPixels[k];
          if (pixel[0] === idx) {
            clickedPixels.push(pixel.slice(-3));
            owned = true;
            break;
          }
        }
        if (!owned) {
          clickedPixels.push([255,255,255])
        }
      }
    }
    return clickedPixels;
  }

  useEffect(() => {
    const position = (currentCursor.y) * 1000 + (currentCursor.x)
    APIService.getPixelDetail(position)
      .then((response) => {
        if (response.hasOwnProperty('user')) {
          console.log(response)
          setCurrentInfo([response['user'], response['description']])
        } else if (response.hasOwnProperty('error') && response['error'] === `pixel ${position} not owned by anyone`){
          setCurrentInfo(['',''])
        }
      })
      .catch(error => console.log('error', error))
  }, [currentCursor]);

  // Control pop up
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  }

  return (
    <div>
      <img src={currentImg} alt="Mavis Million Page" id="board" draggable="false" unselectable="on" onClick={handleClick}/>
      {isOpen && <Popup
            content={<>
              <PixelDetail
                pos={(currentCursor.y)*1000 + (currentCursor.x)}
                detailPixels={getDetailPixels()}
                info={currentInfo}
              />
            </>}
            handleClose={togglePopup}
            id={-1}
          />}
      <p>x: {currentCursor.x}</p>
      <p>y: {currentCursor.y}</p>
    </div>
  );
}

export default Board;
