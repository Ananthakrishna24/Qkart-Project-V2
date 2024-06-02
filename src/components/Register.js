import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import {Link} from "react-router-dom";
import "./Register.css";
import { useHistory } from "react-router-dom";


const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  // Implement the register function
  const register = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${config.endpoint}/auth/register`, { "username" : formData.username, "password" : formData.password});
      if (response.data.success) {
        enqueueSnackbar("Registration successful", { variant: "success" });
        history.push("/login");
      } else {
        enqueueSnackbar(response.data.message ? response.data.message : "Registration failed", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error.response.data.message ? error.response.data.message : "Registration failed", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Implement user input validation logic
  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    }
    if (data.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", { variant: "warning" });
      return false;
    }
    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }
    if (data.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", { variant: "warning" });
      return false;
    }
    if (data.password !== data.confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "warning" });
      return false;
    }
    return true;
  };

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleInput = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateInput(formData)) {
      register(formData);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value={formData.username}
            onChange={(e) => handleInput(e, "username")}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value={formData.password}
            onChange={(e) => handleInput(e, "password")}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={formData.confirmPassword}
            onChange={(e) => handleInput(e, "confirmPassword")}
          />
          <Button
            className="button"
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            Register Now
            {loading && <CircularProgress size={20} style={{ marginLeft: 10 }} />}
          </Button>
          <p className="secondary-action">
            Already have an account?{" "}
              <Link to = "/login" className = {'link'}>Login Here</Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;