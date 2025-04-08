import React from "react";
import { Button, Box, Typography, Divider } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SearchIcon from "@mui/icons-material/Search";
import PublicIcon from "@mui/icons-material/Public";
import DescriptionIcon from "@mui/icons-material/Description";
import EditNoteIcon from "@mui/icons-material/EditNote";
import BarChartIcon from "@mui/icons-material/BarChart";
import InsightsIcon from "@mui/icons-material/Insights";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ handleLogout }) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: "250px",
        bgcolor: "#f9fbfc",
        borderRight: "1px solid #1976d2",
        px: 2,
        py: 3,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Section */}
      <Box>
        {/* Branding */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3, px: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="#1976d2">
            JobTrackr
          </Typography>
        </Box>

        {/* Dashboard */}
        <Button
          fullWidth
          startIcon={<DashboardIcon />}
          sx={{
            justifyContent: "flex-start",
            my: 1,
            color: "#1673ff",
            backgroundColor: "#eaf2ff",
            fontWeight: "bold",
            borderRadius: 4,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#d6e9ff",
            },
          }}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </Button>

        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
          Features
        </Typography>

        {/* Navigation Buttons */}
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Button startIcon={<WorkOutlineIcon />} onClick={() => navigate("/jobtracker")} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
            Job Tracker
          </Button>
          <Button startIcon={<SearchIcon />} onClick={() => navigate("/job-search")} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
            Job Search
          </Button>
          <Button startIcon={<PublicIcon />} onClick={() => navigate("/getsocials")} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
            Get Company Socials
          </Button>
          <Button startIcon={<DescriptionIcon />} onClick={() => navigate("/resume")} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
            Resume Generator
          </Button>
          <Button startIcon={<EditNoteIcon />} onClick={() => navigate("/coverletter")} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
            Cover Letter Generator
          </Button>
          <Button startIcon={<BarChartIcon />} onClick={() => navigate("/analytics")} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
            User's Analytics
          </Button>
          <Button startIcon={<InsightsIcon />} onClick={() => navigate("/general-analytics")} sx={{ justifyContent: "flex-start", textTransform: "none" }}>
            General Analytics
          </Button>
        </Box>
      </Box>

      {/* Bottom Section: Logout */}
      <Box>
        <Divider sx={{ my: 2 }} />
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          sx={{ justifyContent: "flex-start", textTransform: "none", color: "#d32f2f" }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}
