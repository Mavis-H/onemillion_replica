import React, {useEffect, useState} from "react";
import APIService from "./APIService";
import Popup from "./Popup";
import "./Marketplace.css";
import Form from "./Form";

const Marketplace = (props) => {
  // Set current pixel listing
  const [currentListing, setCurrentListing] = useState({});
  // Control pop up
  const [isOpen, setIsOpen] = useState(false);
  // Control confirm status
  const [isConfirm, setIsConfirm] = useState(false);
  // Control timer
  const [stopTime, setStopTime] = useState(900);
  // Control current confirm pixel
  const [currentPixel, setCurrentPixel] = useState(0);


  const updateList = () => {
    if (isOpen){
      return;
    }
    APIService.getPixelsListing()
      .then((response) => {
        console.log(response)
        setCurrentListing(response)
      })
      .catch(error => console.log('error',error))
  }
  useEffect(updateList, [isOpen])

  const togglePopup = (event) => {
    console.log('popup: ', event);
    console.log('c:',isConfirm)
    console.log('o',isOpen)
    if (isOpen && isConfirm) {
      alert("You will lose all the change you made if you close the popup.");
    }
    setIsOpen(!isOpen);
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
    return m+":"+s
  }

  return (
    <ul className="pixel_table">
      <li className="table table-header">
        <div className="col col-1">Position</div>
        <div className="col col-2">Price</div>
        <div className="col col-3">Current Owner</div>
        <div className="col col-4">Options</div>
      </li>
      {Object.entries(currentListing).map(([position, pixel]) => {
        return <li key={position} className="table table-row">
          <div className="col col-1" data-label="Position">
            <p><b>{position}</b></p>
          </div>
          <div className="col col-2" data-label="Price">
            <p><b>{pixel[0]}</b> MHP</p>
          </div>
          <div className="col col-3" data-label="Current Owner">
            <p>{pixel[1]}</p>
          </div>
          <div className="col col-4" data-label="Options">
            <button onClick={togglePopup} id={position}>buy</button>
            {(currentPixel === position) && isOpen && (props.logStatus === 'true') && <Popup
              content={<>
                <p><b>Position:</b> {position}</p>
                <p><b>Price:</b> {pixel[0]}</p>
                <p><b>Token:</b> MHP</p>
                <p><b>Block chain:</b> Görli Testnet</p>
                <p><b>Token address:</b> 0x6E682420f84f06E2a4B69e162718225E3eE2aAEA</p>
                <br/>
                {!isConfirm &&
                <button onClick={toggleConfirm}>confirm</button>
                }
                {isConfirm &&
                  <div className="confirm">
                    <p><b>Seller address:</b> {pixel[2]}</p>
                    <p>You have <b>15 minutes</b> to finish transaction.</p>
                    <p>Time remain: <b>{getTimeLeft(stopTime)}</b></p>
                    <Form type={'confirm'} id={currentPixel} setIsOpen={setIsOpen}/>
                  </div>
                }
              </>}
              handleClose={togglePopup}
              id={position}
            />}
            {isOpen && (props.logStatus === 'false') && <Popup
              content={<>
                <span className="error">Please log in or sign up to buy pixels.</span>
              </>}
              handleClose={togglePopup}
              id={position}
            />}
          </div>
        </li>
      })}
    </ul>
  );
}

export default Marketplace;

