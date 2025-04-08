import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar"; // ✅ Add sidebar
import AdzunaJobs from "./AdzunaJobs";
import JoobleJobs from "./JoobleJobs";

const JobSearch = () => {
  const [dateSortOrder, setDateSortOrder] = useState("newest");
  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState("adzuna");
  const [location, setLocation] = useState("us");
  const [triggerSearch, setTriggerSearch] = useState(false);
  const navigate = useNavigate();

  const getFullLocation = (countryCode) => {
    return countryCode === "us" ? "United States" : "Canada";
  };

  const handleSearch = () => {
    if (!keyword.trim()) {
      alert("Please enter a keyword to search for jobs.");
      return;
    }
    setTriggerSearch(true);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Sidebar /> {/* ✅ Shared sidebar */}

        <Box sx={{ flexGrow: 1, p: 4 }}>
          <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
              Job Search
            </Typography>

            {/* Search Inputs */}
            <Box display="flex" gap={2} mb={3}>
              <TextField
                fullWidth
                label="Enter job title or keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <Select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                sx={{ width: "150px" }}
              >
                <MenuItem value="adzuna">Adzuna</MenuItem>
                <MenuItem value="jooble">Jooble</MenuItem>
              </Select>
              <Select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                sx={{ width: "150px" }}
              >
                <MenuItem value="us">🇺🇸 USA</MenuItem>
                <MenuItem value="ca">🇨🇦 Canada</MenuItem>
              </Select>
              <Button variant="contained" onClick={handleSearch}>
                Search
              </Button>
            </Box>

            <Select
              value={dateSortOrder}
              onChange={(e) => setDateSortOrder(e.target.value)}
              sx={{ width: "200px", mb: 2 }}
            >
              <MenuItem value="newest">New to Old</MenuItem>
              <MenuItem value="oldest">Old to New</MenuItem>
            </Select>

            {/* Results */}
            {triggerSearch &&
              (platform === "adzuna" ? (
                <AdzunaJobs
                  keyword={keyword}
                  location={location}
                  dateSortOrder={dateSortOrder}
                />
              ) : (
                <JoobleJobs
                  keyword={keyword}
                  location={getFullLocation(location)}
                  dateSortOrder={dateSortOrder}
                />
              ))}

            <Box display="flex" justifyContent="center" mt={3}>
              <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate(-1)}>
                Back to Job Tracker
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default JobSearch;
