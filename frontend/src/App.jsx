import React from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";

import OwnerRegistration from "./screens/OwnerRegistration";
import Login from "./screens/Login";
import LandingPage from "./screens/LandingPage";
import DashboardLayout from "./components/layouts/DashboardLayout";
import Dashboard from "./screens/Dashboard";

function App() {
 return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/login" element={ <Login/> } />
      <Route path="/register/owner" element={<OwnerRegistration/>}/>
      <Route path="/dashboard" element={<DashboardLayout/>}>
        <Route index element={<Dashboard/>} />
      </Route>
    </Routes>
    </BrowserRouter>
 )
}

export default App;
