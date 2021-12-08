import APIService from "./APIService";
import React, {useState} from "react";

const Form = (props) => {
  const [username, setUser] = useState('');
  const [password, setPswd] = useState('');
  const [password2, setPswd2] = useState('');
  const [isLog, setIsLog] = useState(true);
  const [currentHash, setCurrentHash] = useState('');

  // handle log/sign form
  const logIn = () =>{
    console.log(username)
    console.log(password)
    APIService.logIn({'username': username, 'password': password})
    .then((response) => props.loggedIn(response))
    .catch(error => console.log('error',error))
  }

  const signUp = () => {
    APIService.signUp({'username': username, 'password': password, 'confirm_password': password2},)
    .then((response) => props.signedUp(response))
    .catch(error => console.log('error',error))
  }

  const handleNameChange=(event)=>{
    setUser(event.target.value)
  }

  const handlePswdChange=(event)=>{
    setPswd(event.target.value)
  }

  const handlePswd2Change=(event)=>{
    setPswd2(event.target.value)
  }


  const handleSubmit=(event)=>{
    event.preventDefault()
    if (isLog) {
      logIn()
    }
    else {
      signUp()
    }
  }

  const handleChangePopType = () => {
    setIsLog(!isLog)
  }

  // Buying popup in marketplace page
  const handleHashChange = (event) => {
    setCurrentHash(event.target.value)
  }

  const handlePurchase = (event) => {
    event.preventDefault()
    console.log(props.id)
    APIService.confirmPurchase({'position': props.id, 'transaction_hash': currentHash})
      .then((response) => {
        if (response.hasOwnProperty('success')) {
          props.setIsOpen(true);
          alert("Your "+response.success+", you can now manage it on your account.");
        } else if (response.hasOwnProperty('error')){
          alert(response.error);
        }
      })
      .catch(error => console.log('error',error))
  }

  const [sellAmount, setSellAmount] = useState(1)

  const [sellWalletAddress, setSellWalletAddress] = useState('')
  const handleSubmitSell = (event) => {
    event.preventDefault()
    APIService.requestListing({'position': props.id, 'amount': sellAmount, 'wallet_address':sellWalletAddress})
      .then((response) => {
        if (response.hasOwnProperty('success')) {
          props.setIsOpen(false);
          alert(response.success);
        } else if (response.hasOwnProperty('error')){
          alert(response.error);
        }
      })
      .catch(error => console.log('error',error))
  }

  return (
    <div>
      {(props.type === 'edit_sell') && <form
        onSubmit={handleSubmitSell}>
          <label>
            Amount:
            <input type="number"
                   onChange={(e) => setSellAmount(parseInt(e.target.value))}
                   value={sellAmount}
                   min="0"
                   max="10000"/>
          </label>
          <label>
            Wallet Address:
            <input type="text"
                   onChange={(e) => setSellWalletAddress(e.target.value)}
                   value={sellWalletAddress} />
          </label>
          <input type="submit" value="Place Sell Listing"/>
      </form> }
      {(props.type === 'edit_description') && <form
        onSubmit={props.submitDescription}>
          <label>
            Description:
            <input type="text" onChange={props.handleDescriptionChange} value={props.description}/>
          </label>
          <input type="submit" value="Set Pixel Details"/>
      </form> }
      {(props.type === 'confirm') &&
        <form onSubmit={handlePurchase}>
          <label>
            Transaction Hash:
            <input type="text" onChange={handleHashChange}/>
          </label>
          <input type="submit" value="upload transaction hash"/>
        </form>
      }
      {(props.type === 'log/sign') && <div>
        {isLog &&
          <b>Log in</b>
        }
        {!isLog &&
          <b>Sign up</b>
        }
        <br/><br/>
        <form onSubmit={handleSubmit}>
            <label>
              Username:
              <input type="text" onChange={handleNameChange}/>
            </label>
            <br/><br/>
            <label>
              Password:
              <input type="password" onChange={handlePswdChange}/>
            </label>
            <br/><br/>
            {!isLog &&
              <label>
                Confirm Password:
                <input type="password" onChange={handlePswd2Change}/>
              </label>
            }
            {isLog &&
              <div>
                <input type="submit" value="Log in"/>
                <input type="button" value="Create Account" onClick={handleChangePopType}/>
              </div>
            }
            {!isLog &&
              <div>
                <input type="submit" value="Sign up"/>
                <input type="button" value="Log in" onClick={handleChangePopType}/>
              </div>
            }
        </form>
      </div>}
    </div>
  )
}

export default Form;
