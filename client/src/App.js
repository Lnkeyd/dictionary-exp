import React, { useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/authPage/AuthPage";
import { useDispatch, useSelector } from "react-redux";
import FormPage from "./pages/formPage/FormPage";
import StatPage from "./pages/statPage/StatPage";
import axios from "axios";

const App = () => {
  axios.defaults.withCredentials = true

  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.user);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <FormPage /> : <AuthPage />} />
        <Route path="/form" element={user ? <FormPage /> : <AuthPage />} />
        <Route path="/stat" element={user ? <StatPage /> : <AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
