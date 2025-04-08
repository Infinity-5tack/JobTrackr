import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  Stack,
} from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const ResumeGenerator = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const resumeRef = useRef();

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleGenerateResume = async () => {
    setError("");
    setResume(null);
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/generateResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate resume");
      }

      const data = await response.json();
      const cleaned = data.Resume.replace(/---/g, "").trim();
      setResume(cleaned);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    const element = resumeRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
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

    pdf.save("Generated_Resume.pdf");
  };

  const handleDownloadDocx = () => {
    if (!resume) return;

    const lines = resume.split("\n");
    const docContent = [];

    const heading1 = { bold: true, size: 36, font: "Arial" };
    const heading2 = { bold: true, size: 28, font: "Arial" };
    const body = { size: 24, font: "Arial" };
    const hrLine = "__________________________________________________________________";

    const isHeading1 = (line) => line.trim().startsWith("# ");
    const isHeading2 = (line) => line.trim().startsWith("## ");
    const isBullet = (line) => line.trim().startsWith("- ") || line.trim().startsWith("* ");
    const isFinalBlurb = (line) => line.includes("Poonam Agarwal is an experienced Cloud Analyst focused");

    const stripMarkdown = (line) =>
      line
        .replace(/^#+\s*/, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$2")
        .trim();

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || isFinalBlurb(trimmed)) return;

      if (isHeading1(trimmed)) {
        docContent.push(
          new Paragraph({ alignment: "center", children: [new TextRun({ text: stripMarkdown(trimmed), ...heading1 })], spacing: { after: 150 } })
        );
        docContent.push(
          new Paragraph({ alignment: "center", children: [new TextRun({ text: hrLine, ...body })], spacing: { after: 50 } })
        );
      } else if (isHeading2(trimmed)) {
        docContent.push(
          new Paragraph({ children: [new TextRun({ text: stripMarkdown(trimmed), ...heading2 })], spacing: { before: 50, after: 50 } })
        );
        docContent.push(
          new Paragraph({ children: [new TextRun({ text: hrLine, ...body })], spacing: { after: 100 } })
        );
      } else if (isBullet(trimmed)) {
        docContent.push(
          new Paragraph({ children: [new TextRun({ text: stripMarkdown(trimmed).replace(/^[-*] /, ""), ...body })], bullet: { level: 0 }, spacing: { after: 100 } })
        );
      } else {
        docContent.push(
          new Paragraph({ children: [new TextRun({ text: stripMarkdown(trimmed), ...body })], spacing: { after: 200 } })
        );
      }

      const nextLine = lines[index + 1]?.trim();
      const isNextHeading = nextLine && (isHeading1(nextLine) || isHeading2(nextLine));
      if (isNextHeading) {
        docContent.push(new Paragraph({ text: "" }));
      }
    });

    const doc = new Document({ sections: [{ properties: {}, children: docContent }] });
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Formatted_Resume.docx");
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
              Resume Generator
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
                  onClick={handleGenerateResume}
                  disabled={loading || !jobDescription.trim()}
                  sx={{ mt: 2 }}
                >
                  {loading ? "Generating..." : "Generate Resume"}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <Typography color="error" align="center" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            {resume && (
              <Card elevation={4} sx={{ p: 3, backgroundColor: "#fafafa", border: "1px solid #ddd", borderRadius: 2 }}>
                <CardContent ref={resumeRef}>
                  <Box sx={{ lineHeight: 1.8 }}>
                    <ReactMarkdown
                      components={{
                        h1: ({ node, children }) => (
                          <>
                            <Typography variant="h6" align="center" sx={{ fontFamily: "Roboto, sans-serif", mt: 3, mb: 1 }}>
                              {children}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                          </>
                        ),
                        h2: ({ node, children }) => (
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: "Roboto, sans-serif", mt: 3, mb: 1 }}>
                            {children}
                          </Typography>
                        ),
                        h3: ({ node, children }) => (
                          <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: "Roboto, sans-serif", mt: 2 }}>
                            {children}
                          </Typography>
                        ),
                        p: ({ node, children }) => {
                          const raw = children?.[0];
                          const text = typeof raw === "string" ? raw : "";
                          const isContactInfo = text.includes("@") || text.includes("LinkedIn") || text.includes("|");
                          const isJobMeta = /^\d{4}\s*-\s*(Present|\d{4})$/.test(text) || text.includes("Toronto");
                          return (
                            <Typography
                              variant={isContactInfo ? "body2" : "body1"}
                              color={isContactInfo ? "text.secondary" : "text.primary"}
                              align={isContactInfo ? "center" : "left"}
                              sx={{ fontFamily: "Roboto, sans-serif", mb: isJobMeta ? 0.5 : 2 }}
                            >
                              {children}
                            </Typography>
                          );
                        },
                        li: ({ node, children }) => (
                          <li style={{ marginBottom: "10px", fontFamily: "Roboto, sans-serif", lineHeight: 1 }}>
                            {children}
                          </li>
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            style={{ color: "#1976d2", textDecoration: "underline", fontFamily: "Roboto, sans-serif" }}
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                      }}
                    >
                      {resume}
                    </ReactMarkdown>
                  </Box>
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

export default ResumeGenerator;