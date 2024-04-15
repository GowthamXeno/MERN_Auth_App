import {BrowserRouter as Router , Route , Routes } from "react-router-dom";
import './App.css';
import AuthPage from "./Pages/Login"; 
import HomePage from "./Pages/HomePage";
import ForgetPwPage from "./Pages/ForgetPw"; 
import ResetPwPage from "./Pages/ResetPw";
 import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />}></Route>
          <Route path="/Home" element={<HomePage />}></Route>
          <Route path="/ForgetPw" element={<ForgetPwPage />}></Route>
          <Route path="/ResetPw/:token" element={<ResetPwPage />}></Route>
        </Routes>
      </Router>
  );
}

export default App;
