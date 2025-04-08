import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  CssBaseline,
  CircularProgress,
} from "@mui/material";
import Navbar from "../components/Navbar";

export default function PasswordReset() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password, 4: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5000/generateOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        setStep(2);
        setSuccessMessage("OTP sent! Check your email.");
      } else {
        setError(result.error || "Failed to send OTP.");
      }
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Try again.");
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5000/verifyOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }), // ✅ include email
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        setStep(3);
      } else {
        setError(result.message || "Invalid OTP! Try again.");
      }
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Try again.");
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        setStep(4); // ✅ Prevent form flash
        setSuccessMessage("Password reset successful!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(result.message || "Failed to reset password.");
      }
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <>
      <Navbar />
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Paper elevation={3} sx={{ p: 4, width: "100%", textAlign: "center", borderRadius: "12px" }}>
            <Typography variant="h5" gutterBottom>
              {step === 1 && "Reset Your Password"}
              {step === 2 && "Enter OTP"}
              {step === 3 && "Set New Password"}
              {step === 4 && "Success!"}
            </Typography>

            {successMessage && (
              <Typography sx={{ color: "green", mb: 2 }}>{successMessage}</Typography>
            )}
            {error && <Typography sx={{ color: "red", mb: 2 }}>{error}</Typography>}

            {loading && <CircularProgress sx={{ my: 2 }} />}

            {/* Step 1: Enter Email */}
            {step === 1 && !loading && (
              <>
                <TextField
                  fullWidth
                  label="Enter your email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button fullWidth variant="contained" color="primary" onClick={handleRequestOTP}>
                  Send OTP
                </Button>
              </>
            )}

            {/* Step 2: Enter OTP */}
            {step === 2 && !loading && (
              <>
                <TextField
                  fullWidth
                  label="Enter OTP"
                  variant="outlined"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button fullWidth variant="contained" color="primary" onClick={handleVerifyOTP}>
                  Verify OTP
                </Button>
              </>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && !loading && (
              <>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  variant="outlined"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button fullWidth variant="contained" color="primary" onClick={handleResetPassword}>
                  Reset Password
                </Button>
              </>
            )}

            {/* Step 4: Redirecting to login.. */}
            {step === 4 && (
              <Typography variant="body1" sx={{ mt: 2, color: "green" }}>
                Redirecting to login...
              </Typography>
            )}
          </Paper>
        </Box>
      </Container>
    </>
  );
}
