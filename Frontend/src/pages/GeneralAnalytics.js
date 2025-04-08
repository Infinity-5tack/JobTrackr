import React, { useEffect, useState } from "react";
import { ScatterChart, Scatter, ZAxis } from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Treemap,
} from "recharts";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  TextField,
  Container,
  Typography,
  CssBaseline,
  Grid,
  Paper,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import Navbar from "../components/Navbar";

// 🎨 Color Constants
const PRIMARY_COLOR = "#0d6efd";
const GREEN_COLOR = "#28a745";
const ORANGE_COLOR = "#ffc658";
const RED_COLOR = "#dc3545";
const KPI_BG = "#f8f9fa";
const SECONDARY_COLOR = "#6c757d";

// 💡 Custom KPI card component
const KpiCard = ({ label, value }) => (
  <Card
    sx={{
      height: "100%",
      borderRadius: 2,
      backgroundColor: KPI_BG,
      border: "1px solid #dee2e6",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
    }}
  >
    <CardContent>
      <Typography variant="subtitle2" sx={{ color: SECONDARY_COLOR, mb: 1 }}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight="bold">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

// 📊 Chart wrapper
const ChartCard = ({ title, children }) => (
  <Paper elevation={2} sx={{ height: "100%", p: 3, borderRadius: 2 }}>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      {title}
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <ResponsiveContainer width="100%" height="85%">
      {children}
    </ResponsiveContainer>
  </Paper>
);

export default function GeneralAnalytics() {
  const [data, setData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/generalanalytics")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ General Analytics Data:", data);
        setData(data);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <Typography color="error" variant="h6" textAlign="center" mt={4}>
        Failed to load data. Please try again.
      </Typography>
    );
  }

  if (!data) {
    return (
      <Typography variant="h6" textAlign="center" mt={4}>
        Loading...
      </Typography>
    );
  }

  // 🔍 Destructure & map data
  const companyData = data.company_data || [];
  const jobTitleData = data.job_title_data || [];
  const jobLocationData = data.job_location_data || [];
  const offersRejectionsData = data.offers_rejections_data || [];

  const totalApplications = companyData.reduce((sum, item) => sum + item.count, 0);
  const totalCompanies = companyData.length;
  const totalJobTitles = jobTitleData.length;
  const offersCount = offersRejectionsData.find((item) => item.status === "Offer")?.count || 0;

  const filteredJobTitles = jobTitleData
    .map((item, idx) => ({
      id: idx + 1,
      name: item.job_title,
      count: item.count,
    }))
    .filter((row) => row.name.toLowerCase().includes(searchText.toLowerCase()));

  // ✅ Handle Empty State
  const isEmpty =
    companyData.length === 0 &&
    jobTitleData.length === 0 &&
    jobLocationData.length === 0 &&
    offersRejectionsData.length === 0;

  if (isEmpty) {
    return (
      <>
        <Navbar />
        <CssBaseline />
        <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom color="text.secondary">
            No analytics data available yet.
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Once more users begin applying, you'll see community trends here.
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CssBaseline />
      <Container maxWidth="xl" sx={{ mt: 4, minHeight: "90vh" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Community Insights
        </Typography>

        {/* 🔢 KPIs */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[{ label: "Total Applications", value: totalApplications },
            { label: "Companies Applied", value: totalCompanies },
            { label: "Job Titles Applied", value: totalJobTitles },
            { label: "Offers Received", value: offersCount },
          ].map((kpi, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx} sx={{ height: 120 }}>
              <KpiCard label={kpi.label} value={kpi.value} />
            </Grid>
          ))}
        </Grid>

        {/* 📊 Charts */}
        <Grid container spacing={4}>
          {/* Applications per Company (Bubble Chart) */}
          <Grid item xs={12} md={6} sx={{ height: 400 }}>
            <ChartCard title="Applications per Company">
              <ScatterChart>
                <XAxis type="category" dataKey="name" name="Company" tick={{ fontSize: 12 }} />
                <YAxis type="number" dataKey="count" name="Applications" />
                <ZAxis type="number" dataKey="count" range={[60, 400]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter
                  name="Applications"
                  data={companyData.map((item) => ({
                    name: item.company_name,
                    count: item.count,
                  }))}
                  fill={PRIMARY_COLOR}
                />
              </ScatterChart>
            </ChartCard>
          </Grid>

          {/* Job Locations (Horizontal Bar) */}
          <Grid item xs={12} md={6} sx={{ height: 400 }}>
            <ChartCard title="Popular Job Locations">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={jobLocationData}
                  margin={{ left: 20, right: 20 }}
                >
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="job_location"
                    width={120}
                    tick={{ fontSize: 14 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={PRIMARY_COLOR} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Offers vs Rejections (Pie Chart) [optional] */}
          {/* Uncomment this if you're ready to show pie charts later */}
          {/* <Grid item xs={12} md={6} sx={{ height: 400 }}>
            <ChartCard title="Offers vs Rejections">
              <PieChart>
                <Pie
                  data={offersRejectionsData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  label
                >
                  {offersRejectionsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.status === "Offer" ? GREEN_COLOR : RED_COLOR}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartCard>
          </Grid> */}

          {/* Job Titles Table */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ height: 500, p: 2, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Popular Jobs
              </Typography>
              <TextField
                label="Search Job Title"
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 2 }}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Box sx={{ height: "calc(100% - 100px)" }}>
                <DataGrid
                  rows={filteredJobTitles}
                  columns={[
                    { field: "name", headerName: "Job Title", flex: 1 },
                    {
                      field: "count",
                      headerName: "Applications",
                      width: 140,
                      type: "number",
                    },
                  ]}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 30]}
                  disableRowSelectionOnClick
                  sx={{
                    border: 0,
                    fontSize: 14,
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#f5f5f5",
                      fontWeight: "bold",
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
