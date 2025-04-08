import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Link,
  Paper,
  Container
} from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const isUrl = (value) => {
  if (typeof value !== 'string') return false;
  try {
    new URL(value);
    return true;
  } catch (error) {
    return false;
  }
};

const ScrapetableForm = () => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const scrapeTableApi = process.env.REACT_APP_SCRAPETABLE_API_KEY;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const websiteArray = websites
      .split(',')
      .map(site => site.trim())
      .filter(site => site);

    const payload = {
      websites: websiteArray
    };

    try {
      const response = await fetch("https://api.scrapetable.com/website/email-socials", {
        method: "POST",
        headers: {
          "api-key": scrapeTableApi,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderResult = (dataObj) => {
    if (!dataObj || typeof dataObj !== 'object') return null;

    const entries = Object.entries(dataObj);

    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {entries.map(([key, value]) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{key}</Typography>
                {isUrl(value) ? (
                  <Link
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                  >
                    {value}
                  </Link>
                ) : (
                  <Typography variant="body2">{String(value)}</Typography>
                )}
              </CardContent>
              <CardActions />
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Box sx={{ width: 240, flexShrink: 0 }}>
          <Sidebar />
        </Box>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Container maxWidth="lg">
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Get Email & Socials of Companies
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  label="Website"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={websites}
                  onChange={(e) => setWebsites(e.target.value)}
                />
                <Box display="flex" gap={2} mt={2}>
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Submit"}
                  </Button>
                  <Button variant="contained" onClick={() => navigate(-1)}>
                    Back
                  </Button>
                </Box>
              </form>

              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}

              {result && renderResult(result)}
            </Paper>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default ScrapetableForm;
