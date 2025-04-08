import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
} from "@mui/material";
import Navbar from "../components/Navbar";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";

const JobTracker = () => {
  //const [filterDate, setFilterDate] = useState("");
  const [dateSortOrder, setDateSortOrder] = useState("newest");
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    jobTitle: "",
    company: "",
    jobLocation: "",
    jobType: "",
    jobStatus: "Applied",
    dateApplied: new Date().toISOString().split("T")[0],
    jobLink: "",
    jobDescription: "",
  });
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [allJobs, setAllJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobSelectionDialog, setShowJobSelectionDialog] = useState(false); 
  const [isFromJobSelection, setIsFromJobSelection] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("userEmail");

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
          
          if (!result.data || result.data.length === 0) {
            console.warn("No profile data found.");
            return;
          }
  
          const userData = result.data[0]; // Assuming API returns a list, take the first entry
  
        //   setBasicInfo({
        //     firstName: userData?.firstname || "",  // Match backend field names
        //     lastName: userData?.lastname || "",
        //     email: userData?.email || "",
        //     phone: userData?.phone || "",
        //     linkedin: userData?.linkedin || "",
        //   });
  
        //   setEducation(result.data.filter(item => item.education_id)); // Extract only education data
        //   setWorkExperience(result.data.filter(item => item.experience_id)); // Extract only work experience data
        //   setSkills(userData.skills ? userData.skills.split(",") : []); // Convert skills to an array
        //   setCertifications(userData.certifications ? userData.certifications.split(",") : []); // Convert certifications to an array
        } else {
          console.error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
  
    fetchProfileData();
  }, [email]); 

  useEffect(() => {
    const fetchJobs = async () => {
      if (!email) return; // Prevent fetching if email is missing
  
      try {
        const response = await fetch(`http://127.0.0.1:5000/getuserJobs?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (response.ok) {
          const result = await response.json();
  
          if (!result.jobs || result.jobs.length === 0) {
            console.warn("No jobs found.");
            return;
          }
  
          console.log("Fetched Jobs:", result.jobs); // Debugging
  
          // Set jobs in state
          setJobs(result.jobs.map(job => ({
            id: job.jobs_id, // Use `jobs_id` from backend
            jobTitle: job.job_title,
            company: job.company_name,
            jobLocation: job.job_location,
            jobType: job.job_type,
            jobStatus: job.job_status,
            dateApplied: job.date_applied ? job.date_applied.split("T")[0] : "", // Format date
            jobLink: job.job_link,
            jobDescription: job.job_description,
          })));
  
        } else {
          console.error("Failed to fetch jobs");
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
  
    fetchJobs();
  }, [email]);

  const handleOpen = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/getAllJobs`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.ok) {
        const result = await response.json();
        setAllJobs(result.jobs || []); // Store jobs in state
  
        if (result.jobs.length > 0) {
          setShowJobSelectionDialog(true); // Open the job selection dialog
        } else {
          setOpen(true); // Open the existing add job dialog
        }
      } else {
        console.error("Failed to fetch jobs.");
        setOpen(true); // Fallback to existing dialog
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setOpen(true); // Fallback to existing dialog
    }
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setJobForm({ ...jobForm, [e.target.name]: e.target.value });
  };
  const handleEdit = (job) => {
    setJobForm({
        jobTitle: job.jobTitle,
        company: job.company,
        jobLocation: job.jobLocation,
        jobType: job.jobType,
        jobStatus: job.jobStatus,
        dateApplied: job.dateApplied,
        jobLink: job.jobLink,
        jobDescription: job.jobDescription,
        //notes: job.notes,
        id: job.id,
    });
    setOpen(true);
};

const handleSubmit = async () => {
  const isEditMode = !!jobForm.id; // Check if we are editing or creating a job
  const endpoint = isEditMode ? "editJob" : "createJob";
  const url = `http://127.0.0.1:5000/${endpoint}`;

  // Check for duplicate jobs
  const isDuplicate = jobs.some(
    (job) => 
      job.jobTitle.toLowerCase() === jobForm.jobTitle.toLowerCase() &&
      job.company.toLowerCase() === jobForm.company.toLowerCase() &&
      (!isEditMode || job.id !== jobForm.id) 
  );

  if (isDuplicate) {
    alert("A job with the same title and company already exists.");
    return; 
  }

  // Prepare job data for API
  const jobData = {
    job_title: jobForm.jobTitle,
    company_name: jobForm.company,
    job_location: jobForm.jobLocation,
    job_type: jobForm.jobType,
    job_status: jobForm.jobStatus,
    date_applied: jobForm.dateApplied,
    job_link: jobForm.jobLink,
    job_description: jobForm.jobDescription,
    //notes: jobForm.notes,
    email: email,
    job_id: isEditMode ? jobForm.id : '', 
  };

  if (isFromJobSelection && selectedJob) {
    jobData.job_id = selectedJob.jobs_id;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    const result = await response.json();
    if (response.ok) {
      alert(`Job ${isEditMode ? "updated" : "added"} successfully!`);

      if (isEditMode) {
        setJobs(jobs.map(job => (job.id === jobForm.id ? { ...jobForm } : job)));
      } else {
        setJobs([...jobs, { ...jobForm, id: result.id || jobs.length + 1 }]);
      }

      setIsFromJobSelection(false); // Reset after job submission
      handleClose();
      
      // Reset the form
      setJobForm({
        jobTitle: "",
        company: "",
        jobLocation: "",
        jobType: "",
        jobStatus: "Applied",
        dateApplied: new Date().toISOString().split("T")[0],
        jobLink: "",
        jobDescription: "",
        //notes: "",
        id: null,
      });
    } else {
      alert(result.error || `Failed to ${isEditMode ? "update" : "add"} job`);
    }
  } catch (error) {
    console.error("Error submitting job:", error);
    alert("Something went wrong. Please try again.");
  }
};

// Function to handle Delete job
const handleDelete = async (id) => {
  try {
      const response = await fetch(`http://127.0.0.1:5000/deleteJob`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobs_id: id, email: email })
      });

      const result = await response.json();
      if (response.ok) {
          alert("Job deleted successfully!");
          setJobs(jobs.filter((job) => job.id !== id));
      } else {
          alert(result.error || "Failed to delete job.");
      }
  } catch (error) {
      console.error("Error deleting job:", error);
      alert("Something went wrong. Please try again.");
  }
};

// Filter jobs based on selected filter
const filteredJobs = jobs
  .filter((job) => filter === "All" || job.jobStatus === filter)
  .filter((job) =>
    job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
    job.jobLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.jobType.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .sort((a, b) => {
    const dateA = new Date(a.dateApplied);
    const dateB = new Date(b.dateApplied);
    return dateSortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Job Tracker</Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" color="primary" onClick={() => navigate("/getsocials")}>
            Get Company Socials
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate("/job-search")}>
            Search Job
          </Button>
          <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleOpen}>
            Add Job
          </Button>
        </Box>
      </Box>

        <Box display="flex" gap={2} mb={2}>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Applied">Applied</MenuItem>
            <MenuItem value="Interview">Interview</MenuItem>
            <MenuItem value="Offer">Offer</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
          <TextField
            fullWidth
            label="Search jobs..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
          <TableHead>
  <TableRow sx={{ backgroundColor: '#1976d2' }}>
    <TableCell sx={{ color: 'white' }}>Job Title</TableCell>
    <TableCell sx={{ color: 'white' }}>Company</TableCell>
    <TableCell sx={{ color: 'white' }}>Location</TableCell>
    <TableCell sx={{ color: 'white' }}>Job Type</TableCell>
    <TableCell sx={{ color: 'white' }}>Status</TableCell>
    <TableCell sx={{ color: 'white', minWidth: '100px' }}>
  <Box display="flex" flexDirection="column">
    <span>Date Applied</span>
    <Select
      value={dateSortOrder}
      onChange={(e) => setDateSortOrder(e.target.value)}
      variant="standard"
      sx={{
        backgroundColor: 'white',
        fontSize: '0.8rem',
        borderRadius: '4px',
        mt: 1,
        paddingX: 1,
        paddingY: 0,
      }}
    >
      <MenuItem value="newest">Newest</MenuItem>
      <MenuItem value="oldest">Oldest</MenuItem>
    </Select>
  </Box>
</TableCell>
    <TableCell sx={{ color: 'white' }}>Job Link</TableCell>
    <TableCell sx={{ color: 'white' }}>Description</TableCell>
    <TableCell sx={{ color: 'white' }}>Actions</TableCell>
  </TableRow>
</TableHead>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} hover sx={{ '&:hover': { backgroundColor: '#f5faff' } }}>
                  <TableCell>{job.jobTitle}</TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell>{job.jobLocation}</TableCell>
                  <TableCell>{job.jobType}</TableCell>
                  <TableCell>{job.jobStatus}</TableCell>
                  <TableCell>{job.dateApplied}</TableCell>
                  <TableCell
  style={{
    maxWidth: 140,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }}
>
  <a
    href={job.jobLink}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: '#1976d2', textDecoration: 'underline' }}
    title={job.jobLink} // Tooltip on hover
  >
    {job.jobLink}
  </a>
</TableCell>

                  <TableCell
  sx={{ maxWidth: 170, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
>
  <Tooltip
    title={job.jobDescription}
    arrow
    placement="top"
    componentsProps={{
      tooltip: {
        sx: {
          bgcolor: 'white',          // Background color
          color: 'black',            // Font color
          border: '1px solid #1976d2', // Blue outline
          boxShadow: 2,              // Optional: adds soft shadow
          fontSize: '0.9rem',        // Slightly smaller text
        },
      },
    }}
  >
    <span>
      {job.jobDescription.length > 50
        ? `${job.jobDescription.slice(0, 50)}...`
        : job.jobDescription}
    </span>
  </Tooltip>
</TableCell>



                  {/* <TableCell>{job.notes}</TableCell> */}
                  <TableCell>
                  <Button onClick={() => handleEdit(job)}>
                    <EditIcon color="primary" />
                    </Button>
                    <Button onClick={() => handleDelete(job.id)}>
                      <DeleteIcon color="error" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Job Selection Dialog (if jobs exist) */}
        <Dialog open={showJobSelectionDialog} onClose={() => setShowJobSelectionDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Select an Existing Job</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1">Choose from the available jobs:</Typography>
            <Select
              fullWidth
              value={selectedJob || ""}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (!selectedValue) {
                  // User selected "Create New Job"
                  setShowJobSelectionDialog(false);
                  setOpen(true);
                } else {
                  setSelectedJob(selectedValue);
                }
              }}
              sx={{ mt: 2 }}
              displayEmpty
              renderValue={(selected) =>
                selected
                  ? `${selected.job_title} - ${selected.company_name} (${selected.job_location})`
                  : "Select a job..."
              }
            >
              {/* Clicking this will directly open the job creation dialog */}
              <MenuItem  value="" onClick={() => {
                setShowJobSelectionDialog(false); 
                setOpen(true);
              }}>Create New Job</MenuItem>
              {allJobs.map((job) => (
                <MenuItem key={job.jobs_id} value={job}>
                  <Box display="flex" flexDirection="column">
                    <Typography variant="body1" fontWeight="bold">{job.job_title}</Typography>
                    <Typography variant="body2" color="text.secondary">{job.company_name} - {job.job_location}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowJobSelectionDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowJobSelectionDialog(false); 
              setOpen(true);
            }}>
              New
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (selectedJob) {
                  setIsFromJobSelection(true); // Track that user came from job selection
                  setJobForm((prevForm) => ({
                    ...prevForm,  // Preserve jobStatus, dateApplied
                    jobTitle: selectedJob.job_title,
                    company: selectedJob.company_name,
                    jobLocation: selectedJob.job_location,
                    jobType: selectedJob.job_type,
                    jobLink: selectedJob.job_link,
                    jobDescription: selectedJob.job_description,
                  }));
                }
                setShowJobSelectionDialog(false); // Close job selection dialog
                setOpen(true); // Open job application form
              }}
            >
              Next
            </Button>
          </DialogActions>
        </Dialog>


        {/* Add Job Dialog */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add Job Application</DialogTitle>
          <DialogContent>
          <TextField 
              fullWidth 
              label="Job Title" 
              name="jobTitle" 
              value={jobForm.jobTitle} 
              onChange={handleChange} 
              sx={{ mt: 2 }} 
              disabled={isFromJobSelection} 
            />
            <TextField 
              fullWidth 
              label="Company" 
              name="company" 
              value={jobForm.company} 
              onChange={handleChange} 
              sx={{ mt: 2 }} 
              disabled={isFromJobSelection} 
            />
            <TextField 
              fullWidth 
              label="Location" 
              name="jobLocation" 
              value={jobForm.jobLocation} 
              onChange={handleChange} 
              sx={{ mt: 2 }} 
              disabled={isFromJobSelection} 
            />
            <TextField 
              fullWidth 
              label="Job Type" 
              name="jobType" 
              value={jobForm.jobType} 
              onChange={handleChange} 
              sx={{ mt: 2 }} 
              disabled={isFromJobSelection} 
            />
            <Select fullWidth name="jobStatus" value={jobForm.jobStatus} onChange={handleChange} sx={{ mt: 2 }}>
              <MenuItem value="Applied">Applied</MenuItem>
              <MenuItem value="Interview">Interview</MenuItem>
              <MenuItem value="Offer">Offer</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
            <TextField fullWidth type="date" name="dateApplied" value={jobForm.dateApplied} onChange={handleChange} sx={{ mt: 2 }} />
            <TextField 
              fullWidth 
              label="Job Link" 
              name="jobLink" 
              value={jobForm.jobLink} 
              onChange={handleChange} 
              sx={{ mt: 2 }} 
              disabled={isFromJobSelection} 
            />
            <TextField 
              fullWidth 
              label="Job Description" 
              name="jobDescription" 
              value={jobForm.jobDescription} 
              onChange={handleChange} 
              multiline rows={3} 
              sx={{ mt: 2 }} 
              disabled={isFromJobSelection} 
            />
            {/* <TextField fullWidth label="Notes" name="notes" value={jobForm.notes} onChange={handleChange} multiline rows={3} sx={{ mt: 2 }} /> */}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default JobTracker;
