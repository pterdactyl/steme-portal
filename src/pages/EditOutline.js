import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import html2pdf from "html2pdf.js";
import "../App.css";

import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  StrikethroughS,
  FormatListBulleted,
  FormatListNumbered,
  HorizontalRule,
  Link as LinkIcon,
  Image as ImageIcon,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  TableChart,
} from "@mui/icons-material";

import { IconButton, Select, MenuItem } from "@mui/material";

export default function EditOutline() {
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: `<p>Start editing...</p>`,
  });

  useEffect(() => {
    const savedData = localStorage.getItem("course_ENG1D_full");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setCourseCode(parsed.courseCode || "");
      setCourseName(parsed.courseName || "");
      if (editor && parsed.outlineContent) {
        editor.commands.setContent(parsed.outlineContent);
      }
    }
  }, [editor]);

  const handleSave = () => {
    if (!editor) return;
    const dataToSave = {
      courseCode,
      courseName,
      outlineContent: editor.getHTML(),
    };
    localStorage.setItem("course_ENG1D_full", JSON.stringify(dataToSave));
    alert("Saved locally!");
  };

  const handleExportPDF = () => {
    if (!editor) return;

    const html = `
      <h1>${courseCode} - ${courseName}</h1>
      ${editor.getHTML()}
    `;

    const container = document.createElement("div");
    container.style.width = "794px";
    container.style.minHeight = "1122px";
    container.style.padding = "40px 60px";
    container.style.fontFamily = "'Times New Roman', serif";
    container.style.fontSize = "12pt";
    container.style.lineHeight = "1.5";
    container.style.background = "white";
    container.innerHTML = html;

    html2pdf()
      .set({
        margin: 0,
        filename: `${courseCode || "course-outline"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      })
      .from(container)
      .save();
  };

  if (!editor) return null;

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: 20 }}>
      {/* Inputs */}
      <input
        type="text"
        placeholder="Course Code"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10, fontSize: 16 }}
      />
      <input
        type="text"
        placeholder="Course Name"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 20, fontSize: 16 }}
      />

      {/* Toolbar */}
      <div
        style={{
          marginBottom: 12,
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "#fff",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        <Select
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
              ? "h3"
              : "paragraph"
          }
          onChange={(e) => {
            const value = e.target.value;
            const chain = editor.chain().focus();
            if (value === "paragraph") {
              chain.setParagraph().run();
            } else {
              const level = parseInt(value.replace("h", ""), 10);
              chain.toggleHeading({ level }).run();
            }
          }}
          size="small"
        >

          <MenuItem value="paragraph">Normal</MenuItem>
          <MenuItem value="h1">Heading 1</MenuItem>
          <MenuItem value="h2">Heading 2</MenuItem>
          <MenuItem value="h3">Heading 3</MenuItem>
        </Select>

        {/* Format Buttons */}
        <IconButton onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive("bold") ? "primary" : "default"}><FormatBold /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive("italic") ? "primary" : "default"}><FormatItalic /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor.isActive("underline") ? "primary" : "default"}><FormatUnderlined /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleStrike().run()} color={editor.isActive("strike") ? "primary" : "default"}><StrikethroughS /></IconButton>

        {/* Lists */}
        <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive("bulletList") ? "primary" : "default"}><FormatListBulleted /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()} color={editor.isActive("orderedList") ? "primary" : "default"}><FormatListNumbered /></IconButton>

        {/* Horizontal Rule */}
        <IconButton onClick={() => editor.chain().focus().setHorizontalRule().run()}><HorizontalRule /></IconButton>

        {/* Link & Image */}
        <IconButton
          onClick={() => {
            const url = prompt("Enter URL");
            if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
          color={editor.isActive("link") ? "primary" : "default"}
        >
          <LinkIcon />
        </IconButton>

        <IconButton
          onClick={() => {
            const url = prompt("Enter image URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          <ImageIcon />
        </IconButton>

        {/* Align */}
        <IconButton onClick={() => editor.chain().focus().setTextAlign("left").run()} color={editor.isActive({ textAlign: "left" }) ? "primary" : "default"}><FormatAlignLeft /></IconButton>
        <IconButton onClick={() => editor.chain().focus().setTextAlign("center").run()} color={editor.isActive({ textAlign: "center" }) ? "primary" : "default"}><FormatAlignCenter /></IconButton>
        <IconButton onClick={() => editor.chain().focus().setTextAlign("right").run()} color={editor.isActive({ textAlign: "right" }) ? "primary" : "default"}><FormatAlignRight /></IconButton>

        {/* Table */}
        <IconButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableChart /></IconButton>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        style={{
          border: "1px solid #ccc",
          borderRadius: 4,
          minHeight: 400,
          padding: 10,
          backgroundColor: "white",
          marginBottom: 20,
        }}
      />

      {/* Save & Export Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleSave} style={{ padding: "10px 20px" }}>
          Save
        </button>
        <button onClick={handleExportPDF} style={{ padding: "10px 20px" }}>
          Export as PDF
        </button>
      </div>
    </div>
  );
}
