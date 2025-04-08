import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Stepper,
  Step,
  StepLabel,
  Grid,
  IconButton,
  Paper,
  MenuItem
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "../components/Navbar";

const steps = ["Basic Info", "Education", "Work Experience & Skills"];
const degrees = ["Bachelor's", "Master's", "PhD", "Diploma", "Associate's", "Other"];
const years = Array.from(new Array(50), (_, i) => new Date().getFullYear() - i);

export default function ProfileSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, edit } = location.state || {}; // Prepopulate from Sign-Up

  const [activeStep, setActiveStep] = useState(0);

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    firstName: "",
    lastName: "",
    email: email || "",
    phone: "",
    city: "",
    linkedin: "",
  });

  // Step 2: Education
  const [education, setEducation] = useState([]);

  // Step 3: Work Experience, Skills, Certifications
  const [workExperience, setWorkExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillsInput, setSkillsInput] = useState("");
  const [certifications, setCertifications] = useState([]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async() => {
    console.log({ basicInfo, education, workExperience, skills, certifications });

    const profileData = {
      originalEmail: email,
      email: basicInfo.email,
      firstname: basicInfo.firstName,   // ✅ add this
      lastname: basicInfo.lastName,     // ✅ and this
      phone: basicInfo.phone,
      city: basicInfo.city,
      linkedin: basicInfo.linkedin,
      skills,
      certifications: certifications.map(cert => ({ name: cert.name })),
      education: education.map(edu => ({
        degree: edu.degree || "",
        institution: edu.institution || "",
        field: edu.field || "",
        gpa: edu.gpa || 0,
        endYear: edu.graduationYear ? edu.graduationYear.toString() : null,
      })),
      workExperience: workExperience.map(work => ({
        company: work.company || "",
        position: work.position || "",
        yearsOfExperience: work.yearsOfExperience || 0,
        responsibilities: work.responsibilities || "",
      })),
    };
  
    try {
      const response = await fetch(`http://127.0.0.1:5000/${edit ? "edit" : "create"}Profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });
  
      const result = await response.json();
      if (response.ok) {
        alert(`Profile ${edit ? "edited" : "created"} successfully!`);
      if (basicInfo.email !== email) {
          localStorage.setItem("userEmail", basicInfo.email);
        }
        navigate("/dashboard")
      } 
      else {
        alert(result.error || `Failed to ${edit ? "edit" : "create"} profile`);
      }
    } catch (error) {
      console.error(`Error ${edit ? "editing" : "creating"} profile:`, error);
      alert("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
        if (!email) return; // Prevent fetching if email is missing

        try {
            const response = await fetch(`http://127.0.0.1:5000/getProfile?email=${encodeURIComponent(email)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Fetched Profile Data:", result.data);

                if (!result.data) {
                    console.warn("No profile data found.");
                    return;
                }

                const userData = result.data; 
                console.log("Certifications from Backend:", userData.certifications);

                setBasicInfo({
                    firstName: userData?.firstname || "",  // Match backend field names
                    lastName: userData?.lastname || "",
                    email: userData?.email || "",
                    phone: userData?.phone || "",
                    city: userData?.city || "",
                    linkedin: userData?.linkedin || "",
                });

                setEducation(
                    userData.education?.map(edu => ({
                    degree: edu.degree || "",
                    institution: edu.institution || "",
                    field: edu.field || "",
                    gpa: edu.gpa || "",
                    graduationYear: edu.endYear ? edu.endYear.toString() : ""  
                })) || []);

                setWorkExperience(userData.workExperience || []);
                setSkills(userData.skills ?? []);
                setSkillsInput((userData.skills ?? []).join(", ")); // Sync input text with skill array
                setCertifications(
                  (userData.certifications || []).map(cert => (typeof cert === "string" ? { name: cert } : cert))
                );
          
            } else {
                console.error("Failed to fetch profile data");
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    };

    fetchProfileData();
}, [email]);

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          {edit && edit ? "Edit" : "Complete"} Your Profile
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper sx={{ p: 3, mt: 3 }}>
          {/* Step 1: Basic Info */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6">Basic Information</Typography>
              <TextField
  fullWidth
  label="First Name"
  value={basicInfo.firstName}
  onChange={(e) => setBasicInfo({ ...basicInfo, firstName: e.target.value })}
  sx={{ mt: 2 }}
/>

<TextField
  fullWidth
  label="Last Name"
  value={basicInfo.lastName}
  onChange={(e) => setBasicInfo({ ...basicInfo, lastName: e.target.value })}
  sx={{ mt: 2 }}
/>

<TextField
  fullWidth
  label="Email"
  value={basicInfo.email}
  onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
  sx={{ mt: 2 }}
/>

              <TextField
                fullWidth
                label="Phone Number"
                value={basicInfo.phone}
                onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="City"
                value={basicInfo.city}
                onChange={(e) => setBasicInfo({ ...basicInfo, city: e.target.value })}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="LinkedIn Profile"
                value={basicInfo.linkedin}
                onChange={(e) => setBasicInfo({ ...basicInfo, linkedin: e.target.value })}
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          {/* Step 2: Education */}
          {activeStep === 1 && (
          <Box>
            <Typography variant="h6">Education</Typography>
            {education.map((edu, index) => (
              <Paper key={index} sx={{ p: 2, mt: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  {/* Degree and Institution in the Same Row */}
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      select
                      label="Degree"
                      variant="outlined"
                      value={edu.degree}
                      onChange={(e) =>
                        setEducation(
                          education.map((ed, i) =>
                            i === index ? { ...ed, degree: e.target.value } : ed
                          )
                        )
                      }
                    >
                      {degrees.map((deg) => (
                        <MenuItem key={deg} value={deg}>
                          {deg}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Institution"
                      variant="outlined"
                      value={edu.institution}
                      onChange={(e) =>
                        setEducation(
                          education.map((ed, i) =>
                            i === index ? { ...ed, institution: e.target.value } : ed
                          )
                        )
                      }
                    />
                  </Grid>

                  {/* Field of Study and GPA in the Same Row */}
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Field of Study"
                      variant="outlined"
                      value={edu.field}
                      onChange={(e) =>
                        setEducation(
                          education.map((ed, i) =>
                            i === index ? { ...ed, field: e.target.value } : ed
                          )
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="GPA"
                      variant="outlined"
                      type="number"
                      inputProps={{ step: "0.01", min: "0", max: "4" }}
                      value={edu.gpa || ""}
                      onChange={(e) =>
                        setEducation(
                          education.map((ed, i) =>
                            i === index ? { ...ed, gpa: e.target.value } : ed
                          )
                        )
                      }
                    />
                  </Grid>

                  {/* Graduation Year */}
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      select
                      label="Graduation Year"
                      variant="outlined"
                      value={edu.graduationYear}
                      onChange={(e) =>
                        setEducation(
                          education.map((ed, i) =>
                            i === index
                              ? { ...ed, graduationYear: e.target.value }
                              : ed
                          )
                        )
                      }
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Delete Button */}
                  <Grid item xs={12} display="flex" justifyContent="flex-end">
                    <IconButton
                      color="error"
                      onClick={() =>
                        setEducation(education.filter((_, i) => i !== index))
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            {/* Add Education Button */}
            <Button
              startIcon={<AddCircleOutlineIcon />}
              sx={{ mt: 2 }}
              onClick={() =>
                setEducation([
                  ...education,
                  { degree: "", institution: "", field: "", gpa: "", graduationYear: "" },
                ])
              }
            >
              Add Education
            </Button>
          </Box>
        )}


          {/* Step 3: Work Experience, Skills, Certifications */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6">Work Experience</Typography>
              {workExperience.map((work, index) => (
                <Paper key={index} sx={{ p: 2, mt: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    {/* Company, Position, and Years of Experience in One Row */}
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Company"
                        value={work.company}
                        onChange={(e) =>
                          setWorkExperience(
                            workExperience.map((we, i) =>
                              i === index ? { ...we, company: e.target.value } : we
                            )
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Position"
                        value={work.position}
                        onChange={(e) =>
                          setWorkExperience(
                            workExperience.map((we, i) =>
                              i === index ? { ...we, position: e.target.value } : we
                            )
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Years of Experience"
                        variant="outlined"
                        type="number"
                        inputProps={{ step: "0.1", min: "0", max: "50" }}
                        value={work.yearsOfExperience || ""}
                        onChange={(e) =>
                          setWorkExperience(
                            workExperience.map((we, i) =>
                              i === index ? { ...we, yearsOfExperience: e.target.value } : we
                            )
                          )
                        }
                      />
                    </Grid>

                    {/* Job Description Field */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Job Responsibilities"
                        value={work.responsibilities}
                        onChange={(e) => setWorkExperience(workExperience.map((we, i) => (i === index ? { ...we, responsibilities: e.target.value } : we)))}
                      />
                    </Grid>
                    <Grid item xs={12} display="flex" justifyContent="flex-end">
                      <IconButton color="error" onClick={() => setWorkExperience(workExperience.filter((_, i) => i !== index))}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button startIcon={<AddCircleOutlineIcon />} sx={{ mt: 2 }} onClick={() => setWorkExperience([...workExperience, { company: "", position: "", startYear: "", endYear: "", ongoing: false, responsibilities: "" }])}>
                Add Experience
              </Button>

              <Typography variant="h6" sx={{ mt: 3 }}>Skills</Typography>
              <TextField
  fullWidth
  label="Skills"
  variant="outlined"
  placeholder="Enter skills separated by commas"
  value={skillsInput}
  onChange={(e) => setSkillsInput(e.target.value)}
  onBlur={() =>
    setSkills(
      skillsInput
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)
    )
  }
/>

              <Typography variant="h6" sx={{ mt: 3 }}>Certifications</Typography>
              {/* <TextField fullWidth label="Certification Name" sx={{ mt: 2 }} onChange={(e) => setCertifications([...certifications, e.target.value])} />
              <Button startIcon={<AddCircleOutlineIcon />} sx={{ mt: 2 }} onClick={() => setCertifications([...certifications, ""])}>Add Certification</Button> */}
              {certifications.map((cert, index) => (
                <Paper key={index} sx={{ p: 2, mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={8}>
                            <TextField
                                fullWidth
                                label="Certification Name"
                                value={cert.name}
                                onChange={(e) =>
                                    setCertifications(
                                        certifications.map((c, i) =>
                                            i === index ? { ...c, name: e.target.value } : c
                                        )
                                    )
                                }
                            />
                        </Grid>
                        
                        <Grid item xs={1}>
                            <IconButton color="error" onClick={() => setCertifications(certifications.filter((_, i) => i !== index))}>
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Paper>
            ))}
              <Button startIcon={<AddCircleOutlineIcon />} sx={{ mt: 2 }} onClick={() => setCertifications([...certifications, { name: ""}])}>
                Add Certification
              </Button>
            </Box>
          )}

        </Paper>

       

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleSubmit}>
              Finish
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Container>
    </>
  );
}
