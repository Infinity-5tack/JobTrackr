import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const CoverLetterGenerator = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const letterRef = useRef();

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setCoverLetter("");

    try {
      const response = await fetch("/generateCoverLetter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_description: jobDescription,
          email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setCoverLetter(data.cover_letter);
      } else {
        setError(data.error || "Failed to generate cover letter.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!letterRef.current) return;

    const canvas = await html2canvas(letterRef.current, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save("Generated_Cover_Letter.pdf");
  };

  const handleDownloadDocx = () => {
    if (!coverLetter) return;

    const lines = coverLetter.split("\n");
    const docContent = [];
    const style = { font: "Arial", size: 24 };

    lines.forEach((line) => {
      if (line.trim()) {
        docContent.push(
          new Paragraph({
            children: [new TextRun({ text: line.trim(), ...style })],
            spacing: { after: 200 },
          })
        );
      }
    });

    const doc = new Document({
      sections: [{ properties: {}, children: docContent }],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Formatted_Cover_Letter.docx");
    });
  };

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, p: 4 }}>
          <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>
              Cover Letter Generator
            </Typography>

            <Card elevation={3} sx={{ p: 2, mb: 3 }}>
              <CardContent>
                <TextField
                  label="Job Description"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleGenerate}
                  disabled={loading || !jobDescription.trim()}
                  sx={{ mt: 2 }}
                >
                  {loading ? "Generating..." : "Generate Cover Letter"}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <Typography color="error" align="center" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            {coverLetter && (
              <Card elevation={4} sx={{ p: 3, backgroundColor: "#fafafa", border: "1px solid #ddd", borderRadius: 2 }}>
                <CardContent ref={letterRef}>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{coverLetter}</Box>
                </CardContent>

                <Stack direction="row" spacing={2} sx={{ mt: 3, px: 2, justifyContent: "center" }}>
                  <Button variant="outlined" color="secondary" onClick={handleDownloadPdf}>
                    Download PDF
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={handleDownloadDocx}>
                    Download DOCX
                  </Button>
                </Stack>
              </Card>
            )}
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default CoverLetterGenerator;