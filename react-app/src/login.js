import {useRef, useState, useEffect} from 'react';
import Axios from 'axios';
import {useNavigate} from 'react-router-dom';
import Button from '@mui/material/Button';
import ErrorDialog  from './components/errorDialog';

Axios.defaults.withCredentials=true;


export default function Login(props) {
    
    const userInputRef  = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        userInputRef.current.focus();
    }, []);


    const handleSubmit = async (e) => {
        
        e.preventDefault();
        const postBody = {
            userId: user,
            password: password
        };
        Axios.post("/api/users/auth", postBody).then(function(response) {
            setSuccess(true);
            localStorage.setItem("user", JSON.stringify(response.data));

            if (response.data.role.includes("customer")) {
                navigate("/purchase");
            } else if (response.data.role.includes("inventoryManager")) {
                navigate("/approveOrders");
            }
            props.setUser(response.data);
            setErrorMessage(null); 
        }).catch(function(err)  {
            setSuccess(false);
            setErrorMessage("Login Failed: " + err.response.data);
        });
    };
    function closeErrorDialog(e) {
       e.preventDefault();
       setErrorMessage(null);
    }
    
    return (
        <>
            {success ? (
                <section>
                    <h1>You are logged in as: {user}</h1>
                    <br/>

                </section>
            ) : (
                <section>
                    <p ref={errRef} className = {errorMessage ? "error":"ofscreen"} aria-live="assertive">
                        {errorMessage}
                    </p>
                    <h2>Sign In</h2>
                    <form >
                        <section>
                        <label htmlFor = "username">Username:</label>
                        <input type="text" id="username" ref={userInputRef} onChange = {(e) => setUser(e.target.value)}
                        value = {user} required/>
                        </section>
                        <section>
                        <label htmlFor = "password">Password:</label>
                        <input type="password" id="password" onChange = {(e) => setPassword(e.target.value)}
                        value = {password} required/>
                        </section>
                        <Button variant = "contained" onClick={handleSubmit}>Sign In</Button>
                    </form>
                    <p>
                        New Customer?<br/>
                        <span className="line">
                            <a href="register">Register here</a>

                        </span>
                   </p>
                </section>
            )}
            {errorMessage}
            <ErrorDialog errorMessage = {errorMessage} close = {closeErrorDialog}></ErrorDialog>
        </>
    );
}
