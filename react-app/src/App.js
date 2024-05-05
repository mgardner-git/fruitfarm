import './App.css';
import Login from "./login";
import Register from "./register";
import Header from "./header";
import Nav from "./nav";
import Purchase from "./purchase";
import MyOrders from "./myOrders";
import Cart from "./cart";
import Order from "./order";
import ApproveOrders from "./admin/approveOrders";
import FulfillOrders from "./admin/fulfillOrders";
import Inventory from "./admin/inventory";
import Crates from "./admin/crates";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {useRef, useState, useEffect} from 'react';


function App() {
  let [user,setUser] = useState(null);

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
              <Route path = "login" element = {<Login setUser = {setUser} />}></Route>
              <Route path = "register" element = {<Register/>}></Route>       
              <Route path = "order" element = {<Order/>}></Route>  
              <Route path = "approveOrders" element = {<ApproveOrders/>}></Route>     
              <Route path = "fulfillOrders" element = {<FulfillOrders/>}></Route>
              <Route path = "crates" element = {<Crates/>}></Route>
              <Route path = "inventory" element = {<Inventory/>}></Route>
            </Routes>          
          </div>
        </BrowserRouter> 
      </div>
    </div>
  );
}

export default App;
