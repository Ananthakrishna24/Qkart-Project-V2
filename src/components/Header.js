import React from "react";
import { useHistory } from "react-router-dom";
import { Avatar, Button, Stack, Box } from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleExploreClick = () => {
    history.push("/");
  };

  const handleLoginClick = () => {
    history.push("/login");
  };

  const handleRegisterClick = () => {
    history.push("/register");
  };

  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon" />
      </Box>
      {children}
      {hasHiddenAuthButtons ? (
        <Button
          className="explore-button"
          startIcon={<UndoIcon />}
          variant="text"
          onClick={handleExploreClick}
        >
          Back to explore
        </Button>
      ) : username ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={username} src="/public/avatar.png" />
          <p>{username}</p>
          <Button variant="contained" onClick={handleLogout}>
            LOGOUT
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleLoginClick}>
            LOGIN
          </Button>
          <Button variant="contained" onClick={handleRegisterClick}>
            REGISTER
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default Header;
