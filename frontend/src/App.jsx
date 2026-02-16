import React from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";

import OwnerRegistration from "./screens/OwnerRegistration";
import Login from "./screens/Login";
import LandingPage from "./screens/LandingPage";
import DashboardLayout from "./components/layouts/DashboardLayout";
import Dashboard from "./screens/Dashboard";
import ServiceItems from "./screens/dashboard/ServiceItems";
import Owners from "./screens/dashboard/Owners";
import Properties from "./screens/dashboard/Properties";
import Inspections from "./screens/dashboard/Inspections";
import JobTickets from "./screens/dashboard/Jobtickets";
import Inspector from "./screens/dashboard/Inspector";


function App() {
 return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/login" element={ <Login/> } />
      <Route path="/register/owner" element={<OwnerRegistration/>}/>
      <Route path="/dashboard" element={<DashboardLayout/>}>
        <Route index element={<Dashboard/>} />
        <Route path="serviceitems" element={<ServiceItems/>} />
        <Route path="owners" element={ <Owners/>} />
        <Route path="properties" element={<Properties/>}/>
        <Route path="inspections" element={<Inspections/>}/>
        <Route path="jobtickets" element={<JobTickets/>}/>
        <Route path="inspector" element={<Inspector/>}/>
      </Route>
    </Routes>
    </BrowserRouter>
 )
}

export default App;
