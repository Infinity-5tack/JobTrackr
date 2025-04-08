import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Box,
  Typography,
  Container,
  Snackbar,
  Alert,
  Tooltip,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Navbar from "../components/Navbar";

export default function SignUp({ setIsAuthenticated }) {
  const navigate = useNavigate();

  // State for form validation errors
  const [errors, setErrors] = useState({});
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
const [agreeError, setAgreeError] = useState(false);
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Snackbar state for messages
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const handleSnackbarClose = () => {
    setAlert({ ...alert, open: false });
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;
  
    if (!userData.firstname.trim()) {
      newErrors.firstname = "First name is required";
      isValid = false;
    }
    if (!userData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
      isValid = false;
    }
    if (!userData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }
    if (!userData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (userData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      isValid = false;
    }
    if (!userData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
  
    if (!agreeToPolicy) {
      setAgreeError(true);
      isValid = false;
    } else {
      setAgreeError(false);
    }
  
    setErrors(newErrors);
    return isValid;
  };
  
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      const { confirmPassword, ...signupData } = userData; // Remove confirmPassword

      const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({ open: true, message: "Signup successful!", severity: "success" });
        setTimeout(() => handleLogin(), 2000); // Delay login for UI clarity
      } else {
        setAlert({ open: true, message: result.message, severity: "error" });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setAlert({ open: true, message: "Signup failed. Please try again.", severity: "error" });
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email, password: userData.password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("userEmail", userData.email);
        setIsAuthenticated(true); 
        navigate("/dashboard");
      } else {
        setAlert({ open: true, message: "Signup successful, but login failed. Please log in manually.", severity: "warning" });
        navigate("/login");
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlert({ open: true, message: "Signup successful, but login failed. Please log in manually.", severity: "warning" });
      navigate("/login");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      handleSignup();
    } else {
      setAlert({ open: true, message: "Please fix the errors before submitting.", severity: "warning" });
    }
  };

  return (
    <>
      <Navbar />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {/* First Name */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstname"
              label="First Name"
              name="firstname"
              autoComplete="given-name"
              autoFocus
              value={userData.firstname}
              onChange={handleChange}
              error={!!errors.firstname}
              helperText={errors.firstname}
            />

            {/* Last Name */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastname"
              label="Last Name"
              name="lastname"
              autoComplete="family-name"
              value={userData.lastname}
              onChange={handleChange}
              error={!!errors.lastname}
              helperText={errors.lastname}
            />

            {/* Email */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={userData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />

            {/* Password */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={userData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />

            {/* Confirm Password */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={userData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
      <FormGroup sx={{ mt: 2 }}>
  <FormControlLabel
    control={
      <Checkbox
        checked={agreeToPolicy}
        onChange={(e) => setAgreeToPolicy(e.target.checked)}
        name="agreeToPolicy"
        color="primary"
      />
    }
    label={
      <Typography variant="body2" sx={{ display: 'inline' }}>
        By signing up, I agree to the{" "}
        <Tooltip
          title={
            <Box
              sx={{
                maxHeight: 200,
                maxWidth: 300,
                overflowY: "auto",
                bgcolor: "white",
                color: "black",
                border: "1px solid #1976d2",
                p: 2,
                fontSize: "0.85rem",
                textAlign: "justify",
              }}
            >
              At <b>JobTrackr</b>, we value your privacy and are committed to protecting your personal information.  
      <br /><br />
      By signing up, you consent to the collection of basic details such as your name, contact and email address. This data is used solely for enabling and improving your experience in tracking job applications through our platform.
      <br /><br />
      We <b>do not sell or share your information</b> with third parties. You can request deletion of your account and associated data at any time.
      <br /><br />
      For questions or more details about our privacy policies, contact us at <b>infinity.5stack.seneca@gmail.com</b>
            </Box>
          }
          arrow
          placement="top"
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: "transparent",
                p: 0,
              },
            },
          }}
        >
          <Link underline="always" sx={{ cursor: "pointer", color: "#1976d2" }}>
            Terms of Service and Privacy Policy
          </Link>
        </Tooltip>
      </Typography>
    }
  />
  {agreeError && (
    <Typography variant="caption" color="error" sx={{ ml: 4 }}>
      You must agree to the policy to sign up.
    </Typography>
  )}
</FormGroup>


            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Sign Up
            </Button>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Link onClick={() => navigate("/login")} variant="body2" sx={{ cursor: "pointer" }}>
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Snackbar Alert for Messages */}
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleSnackbarClose} severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
}
