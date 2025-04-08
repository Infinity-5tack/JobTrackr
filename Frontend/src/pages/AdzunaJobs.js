import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Typography,
  Box
} from "@mui/material";

const AdzunaJobs = ({ keyword, location, dateSortOrder }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (keyword) fetchJobs(1);
  }, [keyword, location]); // Re-fetch when keyword or location changes

  const fetchJobs = async (page) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/jobsearchapi?keyword=${encodeURIComponent(
          keyword
        )}&page=${page}&country=${location}` // Use the selected location
      );

      if (response.ok) {
        const result = await response.json();
        setJobs(result.jobs_data || []);
        setTotalPages(result.total_pages || 1);
        setCurrentPage(page);
      } else {
        setError("Failed to fetch job results.");
      }
    } catch (error) {
      console.error("Error fetching job search:", error);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  const sortedJobs = [...jobs].sort((a, b) => {
    const dateA = new Date(a.created);
    const dateB = new Date(b.created);
    return dateSortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });
  
  return (
    <>
      {loading && <Typography>Loading jobs...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {jobs.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Posted Date</TableCell>
                  <TableCell>Contract Type</TableCell>
                  <TableCell>Salary Range</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>Link</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
      
                {sortedJobs.map((job, index) => (
                  <TableRow key={index}>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{job.company.display_name}</TableCell>
                    <TableCell>{job.location.display_name}</TableCell>
                    <TableCell>
                      {new Date(job.created).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{job.contract_time || "N/A"}</TableCell>
                    <TableCell>
                      {job.salary_min && job.salary_max
                        ? `$${job.salary_min} - $${job.salary_max}`
                        : "Not Specified"}
                    </TableCell>
                    <TableCell>
                    <a
  href={job.redirect_url} // or job.link
  target="_blank"
  rel="noopener noreferrer"
  style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}
>
  View Job
</a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Improved Pagination Alignment */}
          <Box display="flex" justifyContent="center" mt={3} mb={3}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => fetchJobs(value)}
              color="primary"
              size="large"
            />
          </Box>
        </>
      )}
    </>
  );
};

export default AdzunaJobs;