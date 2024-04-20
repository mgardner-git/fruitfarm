import './App.css';
import Login from "./login";
import Register from "./register";
import Header from "./header";
import Nav from "./nav";
import Purchase from "./purchase";
import MyOrders from "./myOrders";
import Cart from "./cart";
import Order from "./order";
import Order2 from "./order2";
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {

  return (
    <div className="App">
       <Header/>       
       <div id = "wrapper">
        <BrowserRouter>
          <Nav/>
          <div id = "content">
            <Routes>              
              <Route path = "purchase" element = {<Purchase/>}></Route>
              <Route path = "cart" element = {<Cart/>}></Route>   
              <Route path = "myOrders" element = {<MyOrders/>}></Route>           
              <Route path = "/" element = {<Purchase />}></Route>
              <Route path = "login" element = {<Login/>}></Route>
              <Route path = "register" element = {<Register/>}></Route>       
              <Route path = "order" element = {<Order/>}></Route>       
              <Route path = "order2" element = {<Order2/>}></Route>
            </Routes>          
          </div>
        </BrowserRouter> 
      </div>
    </div>
  );
}

export default App;
