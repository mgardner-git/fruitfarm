import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = (props) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = user != null;
  const isAuthorized = isLoggedIn? props.roles.split(' ').includes(user.role) : false;
  console.log(user);
  console.log(isAuthorized);
  return (isLoggedIn && isAuthorized)
    ? <div>{props.children}</div>
    : <Navigate to="/login" replace />
};

