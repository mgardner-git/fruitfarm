import logo from './logo.svg';
import './App.css';
import Login from "./login";
import Register from "./register";
import Header from "./header";
import Nav from "./nav";
function App() {
  return (
    <div className="App">
       <Header/>       
       <div id = "wrapper">
        <Nav/>
        <div id = "content">
          
          <Register/>
        </div>
      </div>
    </div>
  );
}

export default App;
