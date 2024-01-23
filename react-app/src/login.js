import {useRef, useState, useEffect} from 'react';
import Axios from 'axios';
import {useNavigate} from 'react-router-dom';

Axios.defaults.withCredentials=true;


export default function Login() {
    
    const userInputRef  = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        userInputRef.current.focus();
    }, []);

    useEffect(() => {
        setErrorMessage('');
    }, [user, password]);

    const handleSubmit = async (e) => {
        
        e.preventDefault();
        const postBody = {
            userId: user,
            password: password
        };
        Axios.post("/api/users/auth", postBody).then(function(response) {
            console.log(response);
            if (response.data) {
                setSuccess(true);
                localStorage.setItem("user", JSON.stringify(response.data));
                navigate("/purchase");
                
            } else {
                setSuccess(false);
                setErrorMessage("Login Failed");
            }
        });        
    };

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
                    <h1>Sign In</h1>
                    <form onSubmit={handleSubmit}>
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
                        <button>Sign In</button>


                    </form>
                    <p>
                        New Customer?<br/>
                        <span className="line">
                            <a href="register">Register here</a>

                        </span>
                   </p>
                </section>
            )}
        </>
    );
}
