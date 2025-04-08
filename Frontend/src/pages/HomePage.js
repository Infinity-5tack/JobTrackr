import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  CardMedia,
  CssBaseline,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import InsightsIcon from "@mui/icons-material/Insights";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import Footer from "../components/Footer";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <CssBaseline />

      {/* Navbar */}
      <AppBar position="static">
        <Toolbar>
          <WorkIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            JobTrackr
          </Typography>
          <Button color="inherit" onClick={() => navigate("/login")}>
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section with Animated Circular Gradient */}
      <Box
        sx={{
          py: 8,
          textAlign: "center",
          background: "linear-gradient(135deg, #fdfdff, #e6f0ff, #f0f8ff, #ffffff)",
          backgroundSize: "300% 300%",
          animation: "gradientShift 20s ease infinite",
          "@keyframes gradientShift": {
            "0%": {
              backgroundPosition: "0% 50%",
            },
            "50%": {
              backgroundPosition: "100% 50%",
            },
            "100%": {
              backgroundPosition: "0% 50%",
            },
          },
        }}
      >
        <Container>
          <Typography variant="h3" gutterBottom>
            Stay on Top of Your Job Applications
          </Typography>
          <Typography variant="h6" color="textSecondary" paragraph>
            Easily track, manage, and analyze your job applications in one place.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Scrolling Features Section */}
      <Container
        sx={{
          py: 6,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
            animation: "slide 20s linear infinite",
            "@keyframes slide": {
              "0%": {
                transform: "translateX(0)",
              },
              "100%": {
                transform: "translateX(-100%)",
              },
            },
            "&:hover": {
              animationPlayState: "paused",
            },
          }}
        >
          {[1, 2].flatMap(() => [
            {
              icon: <TrackChangesIcon color="primary" sx={{ fontSize: 30 }} />,
              title: "Track Applications",
              description:
                "Keep all your job applications organized and track their progress.",
              image: "https://www.ec2i.biz/hubfs/Job%20Tracking.png",
            },
            {
              icon: <InsightsIcon color="primary" sx={{ fontSize: 30 }} />,
              title: "Organize Workflow",
              description:
                "Visualize your job applications with a simple and effective workflow.",
              image:
                "https://media.sproutsocial.com/uploads/2024/04/How-to-optimize-your-social-media-workflow-Final.svg",
            },
            {
              icon: <AutoFixHighIcon color="primary" sx={{ fontSize: 30 }} />,
              title: "AI Cover Letter Generator",
              description:
                "Generate personalized cover letters based on job descriptions and your resume using ChatGPT.",
              image:
                "https://static-web.grammarly.com/1e6ajr2k4140/5Xx2WQPJ2OZejMVhlZA84X/3f460fd0a7c5b7a21040d795480b260e/Frame_31613475_1.png?w=356",
            },
            {
              icon: <InsightsIcon color="primary" sx={{ fontSize: 30 }} />,
              title: "Analyze Progress",
              description:
                "Get insights into your job search and improve your success rate.",
              image:
                "https://media-public.canva.com/nqj0E/MAFV68nqj0E/1/s-1.svg",
            },
          ]).map((card, index) => (
            <Card
              key={index}
              sx={{
                minWidth: "260px",
                maxWidth: "260px",
                flex: "0 0 auto",
              }}
            >
              <CardMedia
                component="img"
                image={card.image}
                alt={card.title}
                sx={{
                  height: 160,
                  borderRadius: 2,
                  objectFit: "cover",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "rotateZ(1.5deg) scale(1.03)",
                    boxShadow: 4,
                  },
                }}
              />
              <CardContent>
                {card.icon}
                <Typography variant="h6" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Footer */}
      <Footer />
    </>
  );
}
