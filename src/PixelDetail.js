import React, {useEffect, useState} from "react";
import PixelDetailBoard from "./PixelDetailBoard";
import Form from "./Form";
import APIService from "./APIService";
import "./PixelDetail.css";


const PixelDetail = (props) => {
  // Control pop up
  const [isExpanded, setIsExpanded] = useState(false);
  // Control confirm status
  const [isConfirm, setIsConfirm] = useState(false);
  // Control timer
  const [stopTime, setStopTime] = useState(900);
  // Control current confirm pixel
  const [currentPixel, setCurrentPixel] = useState(0);
  // Control alert status of the purchasing
  const [isTimeEnd, setIsTimeEnd] = useState(false);

  const toggleExpansion = (event) => {
    console.log('c:',isConfirm)
    console.log('o',isExpanded)
    console.log(props.logStatus)
    if (isExpanded && isConfirm) {
      alert("You will lose all the change you made if you close the popup.");
    }
    setIsExpanded(!isExpanded);
    setIsConfirm(false);
    setStopTime(900);
    setCurrentPixel(event.target.id)
  }

  const toggleConfirm = () => {
    APIService.requestPurchase({'position': currentPixel})
      .then((response) => {
        if (response.hasOwnProperty('success')) {
          setIsConfirm(true);
        }
        else if (response.hasOwnProperty('error')){
          alert(response.error);
        }
      })
      .catch(error => console.log('error',error))
  }

  useEffect(
    () => {
      if (stopTime <= 0 || !isConfirm){
        return;
      }
      const id = setInterval(updateTimer, 1000);
      return () => clearInterval(id)
    }, [stopTime, isConfirm]
  );

  const updateTimer = () => {
    setStopTime(() => stopTime-1 );
  }

  const getTimeLeft = (stopTime) => {
    const minutes = Math.floor(stopTime / 60);
    const seconds = Math.floor(stopTime % 60);
    const m = minutes.toString().length === 1 ? '0' + minutes : minutes;
    const s = seconds.toString().length === 1 ? '0' + seconds : seconds;
    if (m+":"+s === "00:00") {
      setIsTimeEnd(true);
    }
    return m+":"+s
  }

  return (
    <div className="pixel_popup">
      <PixelDetailBoard pixels={props.detailPixels}/>
      <br/><br/>
      <div className="pixel_info block">
        <div className="pixel_owner">
          <b>Owner: {props.info[0]}</b>
        </div>
        <div className="pixel_position">
          <b>Position: {props.pos}</b>
        </div>
        <div className="pixel_description">
          <b>Description: {props.info[1]}</b>
        </div>
        {props.info[0] === 'N/A' &&
        <div className="pixel_buy">
          <button onClick={toggleExpansion} id={props.pos}>Buy</button>
          {isExpanded && (props.logStatus === 'true') && 
          <div>
            <hr/>
            <p><b>Position:</b> {props.pos}</p>
            <p><b>Price:</b> 1</p>
            <p><b>Token:</b> MHP</p>
            <p><b>Block chain:</b> Görli Testnet</p>
            <p><b>Token address:</b> 0x6E682420f84f06E2a4B69e162718225E3eE2aAEA</p>
            <br/>
            {!isConfirm &&
            <button onClick={toggleConfirm}>confirm</button>
            }
            {isConfirm &&
              <div className="confirm">
                <p><b>Seller address:</b> 0xA18E8f4d792Cde9B14E32593D1077Bc3237c6CE6</p>
                <p>You have <b>15 minutes</b> to finish transaction.</p>
                <p>Time remain: <b>{getTimeLeft(stopTime)}</b></p>
                <Form type={'confirm'} id={currentPixel} setIsOpen={setIsExpanded}/>
              </div>
            }
          </div>
          }
          {isExpanded && (props.logStatus === 'false') && 
          <div>
            <span className="error">Please log in or sign up to buy pixels.</span>
          </div>
          }
        </div>
        }
      </div>
    </div>
  );
}

export default PixelDetail;
