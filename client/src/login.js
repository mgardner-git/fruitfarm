import {useRef, useState, useEffect, useContext } from 'react';
import AuthContext from "./context/authProvider";
const LOGIN_URL = '/auth';

export default function Login() {
    const {setAuth} = useContext(AuthContext);
    const userInputRef  = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState(false);
    
    useEffect(() => {
        userInputRef.current.focus();
    }, []);

    useEffect(() => {
        setErrorMessage('');
    }, [user, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccess(true);
        console.log(user,password);

    };

    return (
        <>
            {success ? (
                <section>
                    <h1>You are logged in as: {user}</h1>
                    <br/>
                    <p>
                        <a href="#">Home</a>
                    </p>
                </section>
            ) : (
                <section>
                    <p ref={errRef} className = {errorMessage ? "error":"ofscreen"} aria-live="assertive">
                        {errorMessage}
                    </p>
                    <h1>Sign In</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor = "username">Username:</label>
                        <input type="text" id="username" ref={userInputRef} onChange = {(e) => setUser(e.target.value)}
                        value = {user} required/>

                        <label htmlFor = "password">Password:</label>
                        <input type="password" id="password" onChange = {(e) => setPassword(e.target.value)}
                        value = {password} required/>

                        <button>Sign In</button>


                    </form>
                    <p>
                        New Customer?<br/>
                        <span className="line">
                            <a href="register">Register here</a>

                        </span>

                    </p>
                </section>
            )};
        </>
    );
}

