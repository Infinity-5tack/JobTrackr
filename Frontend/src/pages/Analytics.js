import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import { fetchAnalyticsData } from "../api/analyticsApi"; // adjust path as needed
import KPIcard from "../components/KPIcard";
import JobStatusChart from "../components/JobStatusChart";
import ApplicationsOverTimeChart from "../components/ApplicationsOverTimeChart";
import JobTypePieChart from "../components/JobTypePieChart";
import TopJobTitles from "../components/TopJobTitles";

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [jobStatusData, setJobStatusData] = useState([]);
  const [jobTitleData, setJobTitleData] = useState([]);
  const [applicationsOverTime, setApplicationsOverTime] = useState([]);
  const [jobTypeData, setJobTypeData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          jobStatus,
          topJobTitles,
          applicationsOverTime,
          jobTypes,
        } = await fetchAnalyticsData();

        setJobStatusData(jobStatus);
        setJobTitleData(topJobTitles);
        setApplicationsOverTime(applicationsOverTime);
        setJobTypeData(jobTypes);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isEmpty =
    jobStatusData.length === 0 &&
    jobTitleData.length === 0 &&
    applicationsOverTime.length === 0 &&
    jobTypeData.length === 0;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Analytics
      </Typography>

      {loading ? (
        <Box sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : isEmpty ? (
        <Box
          sx={{
            mt: 10,
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          <InsertChartOutlinedIcon sx={{ fontSize: 80, color: "#90caf9" }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            No analytics data available yet.
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Start applying to jobs and return here to see your progress!
          </Typography>
        </Box>
      ) : (
        <>
          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <KPIcard title="Applications" value={applicationsOverTime.length} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPIcard title="Job Titles" value={jobTitleData.length} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPIcard title="Job Types" value={jobTypeData.length} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPIcard title="Statuses" value={jobStatusData.length} />
            </Grid>
          </Grid>

          {/* Charts and Visualizations */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <JobStatusChart data={jobStatusData} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <JobTypePieChart data={jobTypeData} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <ApplicationsOverTimeChart data={applicationsOverTime} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <TopJobTitles data={jobTitleData} />
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AnalyticsPage;
