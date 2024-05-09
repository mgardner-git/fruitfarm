import React from "react";
import Axios from "axios";
import { useRef, useState, useEffect } from "react";
import {faCheck, faTimes, faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {Link} from 'react-router-dom';
import ErrorDialog  from './components/errorDialog';
import { Button } from "@mui/material";

const USER_REGEX = /^[a-zA-z][a-zA-Z0-9-_]{4,16}$/
const PWD_REGEX = /^[a-zA-Z0-9!@#$%^&*]{4,16}$/;;


const Register = () => {
  const userRef = useRef();
  const errorRef = useRef();
  const [user, setUser] = useState('');
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);
  
  const [password, setPassword] = useState('');
  const [validPassword, setValidPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [email, setEmail] = useState('');

  const [matchPassword, setMatchPassword] = useState('');
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userRef.current.focus();
  }, [])

  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user])

  useEffect(() => {
    console.log("Testing: " + PWD_REGEX.test(password));
    setValidPassword(PWD_REGEX.test(password));
    setValidMatch(password === matchPassword);
  }, [password, matchPassword])

  useEffect(() => {
 
  }, [user, password, matchPassword])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const check1 = USER_REGEX.test(user);
    const check2 = PWD_REGEX.test(password);
    if (!check1 || !check2) {
        setErrorMessage("Invalid Entry");
        return;
    } else {
      var postBody={
        userId: user,
        password: password,
        email: email
      }
      Axios.post("/api/users/register",  postBody).then(function(response) {
           setSuccess(true);
          
          
      }).catch(function(err) {
        setErrorMessage(err.response.data);
      });
    }
  }
  function closeErrorDialog(e) {
    e.preventDefault();
    setErrorMessage(null);
  }

  return (
    <section>
        <h1>Register</h1>
        <form onSubmit = {handleSubmit} class="gridForm">
          <label htmlFor="username">Username:
          <span className={validName ? "valid" :"hide" }>
              <FontAwesomeIcon icon = {faCheck} />
          </span>
          <span className={validName || !user ? "hide" : "invalid"} >
              <FontAwesomeIcon icon = {faTimes}/>
          </span>
          </label>
          <input type="text" id="username"
          ref = {userRef}
          autoComplete = "off"
          onChange = {(e) => setUser(e.target.value)}
          required
          aria-invalid={validName ? "false" : "true"}
          aria-describedby = "uidnote"
          onFocus = {() => setUserFocus(true)}
          onBlur = {()=> setUserFocus(false)}
          />            
            
          <label htmlFor = "password">Password:
            <span className={validPassword ? "valid" :"hide" }>
            <FontAwesomeIcon icon = {faCheck} />
            </span>
            <span className={validPassword || ! password ? "hide" : "invalid"} >
                <FontAwesomeIcon icon = {faTimes}/>
            </span>
          </label>
          <input type="password" id="password" 
                onChange = {(e) => setPassword(e.target.value)}
                required 
                aria-invalid={validPassword ? "false" : "true"}
                aria-describedby="pwdNote"
                onFocus = {() => setPasswordFocus(true)}
                onBlur = {() => setPasswordFocus(false)} />
            
          
          <label htmlFor = "email">Email:</label>
          <input type="email" id = "email" onChange={(e)=>setEmail(e.target.value)}></input>
          
            

            <Button onClick={handleSubmit} variant="contained" disabled = {!validName || !validPassword}>Sign Up</Button>
        </form>
        <p id = "uidnote" className = {userFocus && user && !validName ? "instructions" : "offscreen"}>
                <FontAwesomeIcon icon = {faInfoCircle} />
                4 to 24 characters. <br />
                Letters, numbers, underscores, hyphens allowed.            
            </p>
            <p id = "success" className = {success ? "success":"offscreen"}>
              You have registered as {user}. <br/>
              <Link to="/login">Login</Link>
        </p>
        <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}/>
    </section>
  );

}
export default Register