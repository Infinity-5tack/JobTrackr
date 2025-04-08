import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";

export default function Navbar() {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
  
    // Trigger authentication state update
    window.dispatchEvent(new Event("storage"));
  
    window.location.href = "/"; // Redirect to HomePage after logout
  };
  

  return (
    <AppBar position="static" >
      <Toolbar>
        <WorkIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/general-analytics")}
        >
          JobTrackr
        </Typography>

        {isLoggedIn ? (
          <>
          <Button color="inherit" onClick={() => navigate("/dashboard")}>
          Dashboard
        </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate("/login")}>
              Login
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
