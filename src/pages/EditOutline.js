import React, { useState, useEffect, useRef } from "react";
import { Editor } from "primereact/editor";
import { Button } from "@mui/material";
import html2pdf from "html2pdf.js";
import "../styles/EditOutline.css";
import { useNavigate } from "react-router-dom";

export default function EditOutline() {
  const [value, setValue] = useState("");
  const editorRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("course_ENG1D");
    if (saved) {
      setValue(saved);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("course_ENG1D", value);
    navigate("/dashboard/teacher");
  };

  const [usagePercent, setUsagePercent] = useState(0);

  
  const handleEditorChange = (e) => {
    const newHtml = e.htmlValue;
    setValue(newHtml);
  
    const contentEl = editorRef.current?.querySelector(".ql-editor");
    if (contentEl) {
      const totalHeight = contentEl.scrollHeight;
      const pageHeight = 880;
      const pageCount = Math.ceil(totalHeight / pageHeight);
      setUsagePercent(Math.min(100, Math.round((totalHeight / pageHeight) * 100)));
      
      // Optional if you want to use custom attributes later
      contentEl.setAttribute("data-pages", pageCount.toString());
    }
  };

  const handleExportPDF = () => {
    const editorContent = editorRef.current?.querySelector(".ql-editor");
    if (!editorContent) {
        alert("Editor content not found");
        return;
    }

    // Clone the editor content into a clean wrapper
    const clone = editorContent.cloneNode(true);
    const container = document.createElement("div");

    // Set A4-style page layout
    container.style.width = "794px"; // A4 width in px
    container.style.minHeight = "1122px";
    container.style.padding = "40px 60px";
    container.style.fontFamily = "'Times New Roman', serif";
    container.style.fontSize = "12pt";
    container.style.lineHeight = "1.5";
    container.style.background = "white";
    container.appendChild(clone);

    const opt = {
        margin: 0,
        filename: "course-outline.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
        scale: 2,
        useCORS: true,
        },
        jsPDF: {
        unit: "pt",
        format: "a4",
        orientation: "portrait",
        },
    };

    html2pdf().set(opt).from(container).save();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20 }}>
      {/* Page-style container */}
      <div className="editor-container" ref={editorRef}>
        <Editor
          value={value}
          onTextChange={handleEditorChange}
          style={{ height: "100%", width: "100%", border: "none" }}
        />
      </div>

      {/* Buttons outside the document area */}
      <div style={{ marginTop: 20 }}>
        <Button variant="contained" onClick={handleSave} sx={{ mr: 2 }}>
          Save
        </Button>
        <Button variant="outlined" onClick={handleExportPDF}>
          Export as PDF
        </Button>
      </div>
      
    </div>
  );
}