import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FormPage from "./pages/formPage/FormPage";
import AuthPage from "./pages/authPage/AuthPage";
import AdminDictionariesPage from "./pages/adminDictionaries/adminDictionaries";
import { useDispatch, useSelector } from "react-redux";
import StatPage from "./pages/statPage/StatPage";
import axios from "axios";
import { Loader } from "@mantine/core";
import AdminUsersPage from "./pages/adminUsers/adminUsers";
import { setAuthUser } from "./store/userSlice";
import AnalyticsPage from "./pages/analyticsPage/AnalyticsPage";

const App = () => {
  axios.defaults.withCredentials = true;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((store) => store.user);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/login/check-auth', {
          withCredentials: true,
        });

        dispatch(setAuthUser(response?.data));
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader size="xl" variant="dots" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <FormPage /> : <AuthPage />} />
        <Route path="/form" element={user ? <FormPage /> : <AuthPage />} />
        <Route path="/stat" element={user ? <StatPage /> : <AuthPage />} />
        <Route path="/admin-dictionaries" element={user ? <AdminDictionariesPage /> : <AuthPage />} />
        <Route path="/admin/users" element={user ? <AdminUsersPage /> : <AuthPage />} />
        <Route path="/admin/analytics" element={user ? <AnalyticsPage /> : <AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;