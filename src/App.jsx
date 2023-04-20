import { useState, useEffect } from 'react'
import './App.css'
import jwt_decode from "jwt-decode";
import style from "./.module.css"
import axios from "axios"
import { gapi } from "gapi-script"

const App = () => {
  const initialUser = {}
  const initList = {}
  const [user, setUser] = useState(initialUser)

  const clientID = import.meta.env.VITE_CLIENT_ID;
  const apiKey = import.meta.env.VITE_API_KEY
  const clientSecret = import.meta.env.VITE_CLIENT_SECRET
  const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly'
  const [tokenClient, setTokenClient] = useState()
  const [messageList, setMessagesList] = useState(initList)

  const handleCallBackRes = (res) => {
    var myAccount = jwt_decode(res.credential)
    console.log(myAccount, "<<<< my Account")
    setUser(myAccount)
    document.getElementById("sign-in").hidden = true;
  }

  const handleSignOut = () => {
    setUser(initialUser)
    document.getElementById("sign-in").hidden = false;
  }

  const isLogin = () => { 
    const flag = false
    return Object.keys(user).length === 0 ? flag : !flag
  }

  const handleGetAllEmails = () => {
    var accessToken = gapi.auth.getToken().access_token
    setTokenClient(accessToken)
    fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    }}).then( (res) => {
      return res.json()
      // setMessages(res.json().me)
    }).then( function(val) {
      setMessagesList(val)
    } )

  
    getMessageById()
  }

  const getMessageById = () => {
    fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/1875a1b0f8a87f56`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenClient}`
      }
    }).then((res) => {
      return res.json()
    }).then(function(val) {
      console.log(val, "for message by id")
    })
  }

  useEffect(() => {
    function start() {
      gapi.client.init({
        apiKey: apiKey,
        client_id: clientID,
        scope: SCOPES,
      })
    }
    gapi.load('client:auth2', start)
  }, [])

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: clientID,
      callback: handleCallBackRes
    })

    google.accounts.id.renderButton(
      document.getElementById("sign-in"),
      { theme: "outline", size: "large" }
    )
    google.accounts.id.prompt()
  },[])


  // useEffect(getMessageById,[messageList])


  return (
    <div className={style["main-pane"]}>
      <div id="sign-in"></div>
        {
          isLogin() &&
            <nav className={style["nav-pane"]}>
              <button onClick={handleSignOut}>Sign out</button>
              <button onClick={handleGetAllEmails}>Acquire emails</button>
              <img src={user.picture}></img>
              <h3>{user.name}</h3>
            </nav>
        }   
    </div>
  )
}

export default App
