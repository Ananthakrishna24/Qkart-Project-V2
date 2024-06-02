import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const history = useHistory();

  //handling input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  //validateing input
  const validateInput = () => {
    const { username, password } = formData;
    if (!username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    }
    if (!password || password.length < 6) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }
    return true;
  };

  //loggin request handling
  const login = async () => {
    if (!validateInput()) return;

    const url = config.endpoint;
    try {
      const res = await axios.post(`${url}/auth/login`, formData);
      if (res.data.success) {
        enqueueSnackbar("Logged in successfully", { variant: "success" });
        const { token, username, balance } = res.data;
        persistLogin(token, username, balance);
      }
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  //saving it to local storage
  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("balance", balance);
    history.push("/");
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons={true} />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            type="text"
            variant="outlined"
            fullWidth
          />
          <TextField
            id="password"
            label="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            variant="outlined"
            fullWidth
          />
          <Button className="button" variant="contained" onClick={login}>
            LOGIN TO QKART
          </Button>
          <p className="secondary-action">
            Don't have an account?{" "}
            <Link to="/register" className="link">
              Register now
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
