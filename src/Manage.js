import React, {useEffect, useState} from "react";
import "./Manage.css"
import Square from "./Square";
import APIService from "./APIService";
import {decode_rgb} from "./Utility";
import { SketchPicker } from 'react-color';
import Popup from "./Popup";
import Form from "./Form";

const Manage = (props) => {
  // Set current user pixels
  const [currentUserPixels, setCurrenUserPixels] = useState({});
  // Control pop up
  const [isPixelChangeOpen, setIsPixelChangeOpen] = useState(false);
  const [isSellPixelOpen, setSellPixelOpen] = useState(false);
  // Control current confirm pixel
  const [currentPixel, setCurrentPixel] = useState(0);

  const [description, setDescription] = useState('');



  const onOpenPixelChangePopup = (event) => {
    setIsPixelChangeOpen(true);
    setCurrentPixel(event.target.id)
    setDescription(event.target.value)
  }
  const onClosePixelChangePopup = (event) => {
    setIsPixelChangeOpen(false);
  }

  const onOpenSellPixelPopup = (event) => {
    setCurrentPixel(event.target.id)
    setSellPixelOpen(true);
  }

  const onCloseSellPixelPopup = (event) => {
    setSellPixelOpen(false);
  }


  const updateUserPixels = () => {
    if (props.logStatus === 'true') {
      APIService.getUserPixels()
        .then((response) => {
          setCurrenUserPixels(response)
        })
        .catch(error => console.log('error',error))
    }
  }
  useEffect(updateUserPixels, [props.logStatus])

  const decodeRgb = (rgbStr) => {
    const [r,g,b] = decode_rgb(rgbStr);
    return {"background": `rgb(${r},${g},${b})`}
  }

  const [currentColor, setCurrentColor] = useState({
    rgb: {
      r: '241',
      g: '112',
      b: '19',
      a: '1',
    },
  });

  const handleColorChange= (color, event) => {
    setCurrentColor(color);
  }

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  }
  const submitDescription = (event) => {
    console.log(currentPixel, currentColor.rgb, description)
    APIService.setPixel({'position': currentPixel,
      'r': currentColor.rgb.r,
      'g':currentColor.rgb.g,
      'b':currentColor.rgb.b,
      'description': description}).then(
      (response) => {
        console.log(event)
        if (response.hasOwnProperty('success')){
          alert(response.success)
        }
        else if (response.hasOwnProperty('error')){
          alert(response.error);
        }
      }
    )
  }

  const recallListing = (event) => {
    APIService.recallListing({'position': event.target.id}).then(
      (response) => {
        if (response.hasOwnProperty('success')) {
          alert(response.success);
        } else if (response.hasOwnProperty('error')){
          alert(response.error);
        }
      })
      .catch(error => console.log('error',error))
  }

  const editPixelPopup = <Popup
              content={<>
                  <SketchPicker color={currentColor}  onChange={handleColorChange}/>
                  <Form type={'edit_description'} submitDescription={submitDescription} id={currentPixel} description={description} rgb={currentColor} handleDescriptionChange={handleDescriptionChange}/>
              </>}
              handleClose={onClosePixelChangePopup}
  />

  const editSellPopup = <Popup
              content={<Form type={'edit_sell'} id={currentPixel} setIsOpen={setSellPixelOpen}/>}
              handleClose={onCloseSellPixelPopup}
  />

  return (
    <ul className="pixel_table">
      <li className="table table-header">
        <div className="col col-1">Position</div>
        <div className="col col-2">Pixel Style</div>
        <div className="col col-3">Description</div>
        <div className="col col-4">Options</div>
      </li>
      {(props.logStatus === 'true') &&

        Object.entries(currentUserPixels).map(([name,info]) => info.map((pixel,i) => {
          if (pixel.length === 0) {
            return <span className="error">You don't own any pixel.</span>
          }
          else {
            return <li key={i} className="table table-row">
            <div className="col col-1" data-label="Position">
              <p>{pixel['position']}</p>
            </div>
            <div className="col col-2" data-label="Pixel Style">
              <Square rgb={decodeRgb(pixel['rgb'])}/>
            </div>
            <div className="col col-3" data-label="Description">
              <p>{pixel['description']}</p>
            </div>
            <div className="col col-4" data-label="Options">
              <div>
                <button onClick={onOpenPixelChangePopup} id={pixel['position']} value={pixel['description']}>edit pixel</button>
              {(String(currentPixel) === String(pixel['position'])) && isPixelChangeOpen && (props.logStatus === 'true') && editPixelPopup}
              </div>
              <div>
                <button onClick={onOpenSellPixelPopup} id={pixel['position']}>sell</button>
              {(String(currentPixel) === String(pixel['position'])) && isSellPixelOpen && (props.logStatus === 'true') && editSellPopup}
              </div>
              <div>
                <button onClick={recallListing} id={pixel['position']}>recall</button>
              </div>

            </div>
          </li>
          }
        }))

      }
      {(props.logStatus === 'false') &&
        <span className="error">Please log in or sign up to manage your pixels.</span>
      }
    </ul>
  );
}

export default Manage;
