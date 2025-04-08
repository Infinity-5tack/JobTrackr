import React from "react";
import { Box, Container, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box sx={{ py: 3, mt: 4, textAlign: "center", bgcolor: "grey.100" }}>
      <Container>
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()} JobTrackr. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
