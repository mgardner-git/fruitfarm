import { Navigate} from 'react-router-dom';
import {Link} from 'react-router-dom';

export const ProtectedLink = (props) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = user != null;
  const isAuthorized = isLoggedIn? props?.roles.split(' ').includes(user.role) : false;
  const show = isLoggedIn && isAuthorized;

  return (
    <span>
        {show && 
            <Link to = {props.to}>
                {props.children}
            </Link>
        }
    </span>    
  )    
};

