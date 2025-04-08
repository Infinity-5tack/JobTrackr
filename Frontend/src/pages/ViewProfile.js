import React, { useEffect, useState } from "react";
import { 
  Container, Typography, Paper, Chip, Box, Divider, Avatar, Button, Link, Grid, Stack 
} from "@mui/material";
import { Business, School, Star, Work, Verified, Email, Phone, Build, Engineering } from '@mui/icons-material';
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function ViewProfile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) return;
    fetch(`http://127.0.0.1:5000/getProfile?email=${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) setProfileData(data.data);
        else setProfileData(null);
      })
      .catch(err => console.error("Fetch error:", err));
  }, [userEmail]);

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
        {profileData === null ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6">No profile data found.</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/profile")}>
              Create Profile
            </Button>
          </Paper>
        ) : (
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", mr: 2, fontSize: 24 }}>
                {profileData.firstname?.[0]}{profileData.lastname?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={600}>
                  {profileData.firstname} {profileData.lastname}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" mt={1}>
                  <Email fontSize="small" />
                  <Typography color="text.secondary">{profileData.email}</Typography>
                </Stack>
                {profileData.phone && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Phone fontSize="small" />
                    <Typography color="text.secondary">{profileData.phone}</Typography>
                  </Stack>
                )}
                {profileData.linkedin && (
                  <Link href={profileData.linkedin} target="_blank" underline="hover" sx={{ display: "block", mt: 1 }}>
                    LinkedIn Profile
                  </Link>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Skills */}
            <Typography variant="h6" gutterBottom><Engineering fontSize="small" sx={{ mr: 1 }} />Skills</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {profileData.skills.map((skill, i) => (
                <Chip key={i} label={skill} variant="outlined" />
              ))}
            </Box>

            {/* Work Experience */}
            <Typography variant="h6" gutterBottom><Work fontSize="small" sx={{ mr: 1 }} />Work Experience</Typography>
            {profileData.workExperience.length > 0 ? (
              profileData.workExperience.map((w, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography><strong>Company:</strong> {w.company}</Typography>
                  <Typography><strong>Position:</strong> {w.position}</Typography>
                  <Typography><strong>Years of Experience:</strong> {w.yearsOfExperience}</Typography>
                  <Typography sx={{ mt: 1 }}><strong>Responsibilities:</strong> {w.responsibilities}</Typography>
                  {/* <Typography variant="body2" color="text.secondary">{w.responsibilities}</Typography> */}
                </Paper>
              ))
            ) : (
              <Typography color="text.secondary">No work experience added.</Typography>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Education */}
            <Typography variant="h6" gutterBottom><School fontSize="small" sx={{ mr: 1 }} />Education</Typography>
            {profileData.education.length > 0 ? (
              profileData.education.map((edu, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography><strong>School:</strong> {edu.institution}</Typography>
                  <Typography><strong>Degree:</strong> {edu.degree}</Typography>
                  <Typography><strong>Field of Study:</strong> {edu.field}</Typography>
                  <Typography><strong>GPA:</strong> {edu.gpa}</Typography>
                  <Typography><strong>Graduation Year:</strong> {edu.endYear}</Typography>
                </Paper>
              ))
            ) : (
              <Typography color="text.secondary">No education details available.</Typography>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Certifications */}
            <Typography variant="h6" gutterBottom><Verified fontSize="small" sx={{ mr: 1 }} />Certifications</Typography>
            {profileData.certifications.length > 0 ? (
              profileData.certifications.map((cert, i) => (
                <Typography key={i} sx={{ ml: 1, mb: 1 }}>✅ {cert}</Typography>
              ))
            ) : (
              <Typography color="text.secondary">No certifications added.</Typography>
            )}

            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button variant="contained" onClick={() => navigate("/profile", { state: { email: userEmail, edit: true } })}>
                Edit Profile
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </>
  );
}
