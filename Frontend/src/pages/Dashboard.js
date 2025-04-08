import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CssBaseline,
  Typography,
  Container,
  Paper,
  Divider,
  Stack,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Sidebar from "../components/Sidebar";
import BarChartIcon from "@mui/icons-material/BarChart";
import StarRateIcon from "@mui/icons-material/StarRate";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

export default function Dashboard() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const [profileExists, setProfileExists] = useState(false);
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState("monthly");

  function hasAdditionalInfo(userProfile) {
    if (!userProfile || typeof userProfile !== "object") return false;
    return (
      (userProfile.education && userProfile.education.length > 0) ||
      (userProfile.workExperience && userProfile.workExperience.length > 0) ||
      (userProfile.skills && userProfile.skills.length > 0) ||
      (userProfile.certifications && userProfile.certifications.length > 0) ||
      userProfile.phone ||
      userProfile.linkedin ||
      userProfile.city
    );
  }

  useEffect(() => {
    const checkProfileExists = async () => {
      if (!userEmail) return;
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/getProfile?email=${encodeURIComponent(userEmail)}`
        );
        const result = await response.json();
        if (response.ok && result.data && hasAdditionalInfo(result.data)) {
          setProfileExists(true);
        }
      } catch (error) {
        console.error("Error checking profile existence:", error);
      }
    };

    checkProfileExists();
  }, [userEmail]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar Always Full Height */}
      <Sidebar handleLogout={handleLogout} />

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Feature Banner */}
        <Box
          sx={{
            backgroundColor: "#1976d2",
            color: "#f3fbff",
            px: 4,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Level up your Job Search with JobTrackr+
            </Typography>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BarChartIcon />
                <Typography>Unlimited Analysis</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <StarRateIcon />
                <Typography>Unlimited Keywords</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AutoFixHighIcon />
                <Typography>Unlimited AI</Typography>
              </Box>
            </Box>
          </Box>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#1565c0" },
            }}
            onClick={() => setOpen(true)}
          >
            UPGRADE TO JOBTRACKR+
          </Button>
        </Box>

        {/* Subscription Modal */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Select your upgrade option</DialogTitle>
          <DialogContent>
            <RadioGroup value={plan} onChange={(e) => setPlan(e.target.value)}>
              <FormControlLabel value="weekly" control={<Radio />} label="$9 Every Week" />
              <FormControlLabel value="monthly" control={<Radio />} label="$29 Every Month" />
              <FormControlLabel value="quarterly" control={<Radio />} label="$79 Every 3 Months" />
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => alert(`Subscribed to ${plan}`)} variant="contained">
              Pay
            </Button>
          </DialogActions>
        </Dialog>

        {/* Main Layout */}
        <Box sx={{ flexGrow: 1, p: 4 }}>
          <CssBaseline />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Container maxWidth="md">
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    color: "#0d47a1",
                    animation: "fadeIn 1.2s ease-in-out",
                    "@keyframes fadeIn": {
                      from: { opacity: 0, transform: "translateY(-10px)" },
                      to: { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  👋 Welcome to your Job Tracking Hub!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  This is your hub for career tracking, resume optimization, and more.
                  Stay on top of your job search journey with these tools.
                </Typography>

                {/* View Profile Card */}
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    mb: 4,
                    backgroundColor: "#f3fbff",
                    borderLeft: "6px solid #42a5f5",
                    boxShadow: "0 2px 8px #1565c0)",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: '#1565c0' }}>

                        {profileExists ? "View your profile!" : "Complete your profile!"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profileExists
                          ? "Make sure your profile is up to date for better personalized resumes."
                          : "Start by completing your profile to unlock all features."}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() =>
                        navigate(profileExists ? "/viewProfile" : "/profile", {
                          state: { email: userEmail },
                        })
                      }
                    >
                      {profileExists ? "View Profile" : "Create Profile"}
                    </Button>
                  </Stack>
                </Paper>

                {/* Checklist Card */}
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    backgroundColor: "#f8fcff",
                    borderLeft: "6px solid #42a5f5",
                    boxShadow: "0 2px 8px rgba(66, 165, 245, 0.08)",
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, color: "#1565c0" }}>
                    ✅ Complete your checklist!
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={3}>
                    {[
                      ["Track Job Applications", "Organize and monitor your job applications using Job Tracker."],
                      ["Generate AI Resume", "Use AI to tailor resumes to any job description."],
                      ["Create AI Cover Letters", "Quickly generate custom cover letters for each job."],
                      ["Job Search (North America)", "Latest jobs posted in the past week in North America region."],
                      ["Analyze Your Progress", "Visualize how you're progressing and improve your application strategy."],
                      ["Get Company Socials", "Instantly discover LinkedIn, Instagram, Twitter, and other socials of companies."],
                    ].map(([title, desc], i) => (
                      <Box key={i}>
                        <Typography fontWeight="bold">
                          <CheckCircleOutlineIcon sx={{ mr: 1 }} />
                          {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {desc}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Container>
            </Grid>

            {/* Right Image Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
                <img
                  src="https://img.freepik.com/free-vector/flat-employment-agency-search-new-employees-hire_88138-802.jpg"
                  alt="JobTrackr Visual"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "calc(100vh - 64px)",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}