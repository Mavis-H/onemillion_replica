import React, {useEffect, useState} from "react";
import {Link} from 'react-router-dom'
import Popup from "./Popup";
import Form from "./Form"
import APIService from "./APIService";
import './Nav.css'

const Nav = props => {

  // Control pop up
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (props.logStatus === 'true') {
      setIsOpen(false)
    }
  }, [props.logStatus]);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  }

  return (
      <ul className="nav">
        <li className="nav_home left"><Link to="/">Home</Link></li>
        <li className="nav_marketplace left"><Link to="/marketplace">Marketplace</Link></li>
        <li className="nav_manage left"><Link to="/manage">Manage</Link></li>
        <li className="nav_log_in right">
          <div>
            {!(props.logStatus === 'true') &&
              <input
                type="button"
                value="Log in/Sign up"
                onClick={togglePopup}
              />
            }
            {(props.logStatus === 'true') &&
              <input
                type="button"
                value="Log out"
                onClick={props.loggedOut}
              />
            }
            {isOpen && <Popup
              content={<>
                <Form
                  type={'log/sign'}
                  loggedIn={props.loggedIn}
                  signedUp={props.signedUp}
                />
              </>}
              handleClose={togglePopup}
            />}
          </div>
        </li>
        {(props.logStatus === 'true') &&
          <li className="nav_current_usr right">{props.currentUser}</li>
        }
      </ul>
  );
};

export default Nav;
