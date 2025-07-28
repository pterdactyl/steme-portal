import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import "../../styles/pathways.css";

const courses = [
  {
    courseCode: "SNC1D",
    x: 0.5,
    y: -1.75,
    connects: [],
    in: {
      engineering: "required",
      "life-health-science": "required",
      "computer-science": "required",
      business: "required",
    },
    title: "Science Grade 9, Academic (SNC1D)",
    name: "Science 9",
    grade: 9,
    type: "Academic",
    creditValue: 1.0,
    prerequisite: "None",
    description:
      "This course enables students to develop their understanding of basic concepts in biology, chemistry, earth and space science, and physics, and to relate science to technology, society, and the environment.",
    units: [
      { title: "Biology", hours: 25 },
      { title: "Chemistry", hours: 25 },
      { title: "Earth and Space Science", hours: 25 },
      { title: "Physics", hours: 25 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],   

    totalHours: 110,
  },

  {
    courseCode: "SNC2D",
    x: 1.25,
    y: -0.8,
    connects: ["SNC1D"],
    in: {
      engineering: "required",
      "life-health-science": "required",
      "computer-science": "required",
      business: "required",
    },
    title: "Science Grade 10, Academic (SNC2D)",
    name: "Science 10",
    grade: 10,
    type: "Academic",
    creditValue: 1.0,
    prerequisite: "SNC1D",
    description:
      "This course enables students to enhance their understanding of concepts in biology, chemistry, earth and space science, and physics, and of the interrelationships between science, technology, society, and the environment.",
    units: [
      { title: "Biology", hours: 25 },
      { title: "Chemistry", hours: 25 },
      { title: "Physics", hours: 25 },
      { title: "Earth and Space Science", hours: 25 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "SPH3U",
    x: 0,
    y: 0.25,
    connects: ["SNC2D"],
    in: {
      engineering: "required",
      "life-health-science": "recommended",
      "computer-science": "recommended",
    },
    title: "Physics Grade 11, University (SPH3U)",
    name: "Physics 11",
    grade: 11,
    type: "University",
    creditValue: 1.0,
    prerequisite: "SNC2D",
    description:
      "This course introduces key physics concepts, including motion, forces, energy, waves, and electromagnetism. Students will develop investigation skills through experiments and explore the impact of physics-based technologies on society and the environment.",
    units: [
      { title: "Kinematics", hours: 20 },
      { title: "Forces", hours: 20 },
      { title: "Energy and Society", hours: 20 },
      { title: "Waves and Sound", hours: 20 },
      { title: "Electricity and Magnetism", hours: 20 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "SPH4U",
    x: 0.25,
    y: 1.75,
    connects: ["SPH3U"],
    in: {
      engineering: "required",
      "life-health-science": "recommended",
      "computer-science": "recommended",
    },
    title: "Physics Grade 12, University (SPH4U)",
    name: "Physics 12",
    grade: 12,
    type: "University",
    creditValue: 1.0,
    prerequisite: "SPH3U",
    description:
      "This course deepens students’ understanding of physics, covering energy transformations, forces, fields, electromagnetic radiation, and modern topics like quantum mechanics and relativity. Students will enhance their analytical and investigation skills and examine the impact of physics-based technologies on society and the environment.",
    units: [
      { title: "Dynamics", hours: 20 },
      { title: "Energy and Momemtum", hours: 20 },
      { title: "Gravitational, Electric, and Magnetic Fields", hours: 20 },
      { title: "The Wave Nature Of Light", hours: 20 },
      { title: "Revolutions in Modern Physics: quantum Mechanics and Special Relativity", hours: 20 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "SCH3U",
    x: 1.25,
    y: 1,
    connects: ["SNC2D"],
    in: {
      engineering: "required",
      "life-health-science": "required",
    },
    title: "Chemistry Grade 11, University (SCH3U)",
    name: "Chemistry 11",
    grade: 11,
    type: "University",
    creditValue: 1.0,
    prerequisite: "SNC2D",
    description:
      "This course deepens students’ understanding of chemistry through the study of chemical properties, bonding, reactions, solutions, gases, and atmospheric chemistry. Students will build analytical skills and explore the societal and environmental impact of chemical processes.",
    units: [
      { title: "Matter, Chemical Trends, and Chemical Bonding", hours: 20 },
      { title: "Chemical Reactions", hours: 20 },
      { title: "Quantities in Chemical Reactions", hours: 20 },
      { title: "Solutions and Solubility", hours: 20 },
      { title: "Gases and Atmospheric Chemistry", hours: 20 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "SCH4U",
    x: 1,
    y: 2.35,
    connects: ["SCH3U"],
    in: {
      "life-health-science": "required",
      engineering: "required",
    },
    title: "Chemistry Grade 12, University (SCH4U)",
    name: "Chemistry 12",
    grade: 12,
    type: "University",
    creditValue: 1.0,
    prerequisite: "SCH3U",
    description:
      "This course explores organic chemistry, matter and its properties, energy changes, equilibrium, and electrochemistry. Students will strengthen their problem-solving and investigation skills, and examine the role of chemistry in daily life and its environmental impact.",
    units: [
      { title: "Organic Chemistry", hours: 20 },
      { title: "Structure and Properties of Matter", hours: 20 },
      { title: "Energy Changes and Rates of Reaction", hours: 20 },
      { title: "Chemical Systems and Equilibrium", hours: 20 },
      { title: "Electrochemistry", hours: 20 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "SBI3U",
    x: 2.15,
    y: 0.35,
    connects: ["SNC2D"],
    in: {
      "life-health-science": "required",
    },
    title: "Biology Grade 11, University (SBI3U)",
    name: "Biology 11",
    grade: 11,
    type: "University",
    creditValue: 1.0,
    prerequisite: "SNC2D",
    description:
      "This course deepens students’ understanding of biological systems through the study of biodiversity, evolution, genetics, animal and plant biology. Students will explore theoretical concepts and strengthen their scientific investigation skills.",
    units: [
      { title: "Diversity of Living Things", hours: 20 },
      { title: "Evolution", hours: 20 },
      { title: "Genetic Process", hours: 20 },
      { title: "Animal: Structure and Function", hours: 20 },
      { title: "Plants: Anatomy, Growth, and Function", hours: 20 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "SBI4U",
    x: 2.45,
    y: 1.8,
    connects: ["SBI3U"],
    in: {
      "life-health-science": "required",
    },
    title: "Biology Grade 12, University (SBI4U)",
    name: "Biology 12",
    grade: 12,
    type: "University",
    creditValue: 1.0,
    prerequisite: "SBI3U",
    description:
      "This course offers an in-depth study of biological systems, focusing on biochemistry, metabolism, molecular genetics, homeostasis, and population dynamics. Students will gain detailed knowledge and refine skills for further studies in life sciences.",
    units: [
      { title: "Biochemistry", hours: 20 },
      { title: "Metabolic Processes", hours: 20 },
      { title: "Molecular Genetics", hours: 20 },
      { title: "Homeostasis", hours: 20 },
      { title: "Population Dynamics", hours: 20 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ], 
    totalHours: 110,
  },
  {
    courseCode: "MPM1D",
    x: 4,
    y: -1,
    connects: [],
    in: {
      engineering: "required",
      "life-health-science": "required",
      "computer-science": "required",
      business: "required",
    },
    title: "Principles of Mathematics 9, Academic (MPM1D)",
    name: "Principles of Mathematics 9",
    grade: 9,
    type: "Academic",
    creditValue: 1.0,
    prerequisite: "None",
    description:
      "This course enables students to develop an understanding of mathematical concepts related to algebra, analytic geometry, and measurement and geometry through investigation, the effective use of technology, and abstract reasoning.",
    units: [
      { title: "Number Sense and Algebra", hours: 27 },
      { title: "Linear Relations", hours: 27 },
      { title: "Analytic Geometry", hours: 27 },
      { title: "Measurement and Geometry", hours: 27 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "MPM2D",
    x: 4.75,
    y: 0.25,
    connects: ["MPM1D"],
    in: {
      engineering: "required",
      "life-health-science": "required",
      "computer-science": "required",
      business: "required",
    },
    title: "Principles of Mathematics 10, Academic (MPM2D)",
    name: "Principles of Mathematics 10",
    grade: 10,
    type: "Academic",
    creditValue: 1.0,
    prerequisite: "MPM1D",
    description:
      "Students will consolidate their understanding of relationships, functions, and algebraic concepts.",
    units: [
      { title: "Modelling Linear Relations", hours: 27 },
      { title: "Quadratics", hours: 27 },
      { title: "Analytic Geometry", hours: 27 },
      { title: "Trignometry", hours: 27 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "MCR3U",
    x: 3.75,
    y: 1.25,
    connects: ["MPM2D"],
    in: {
      engineering: "required",
      "life-health-science": "required",
      "computer-science": "required",
      business: "required",
    },
    title: "Functions and Applications Grade 11, University (MCR3U)",
    name: "Functions and Applications 11",
    grade: 11,
    type: "University",
    creditValue: 1.0,
    prerequisite: "MPM2D",
    description:
      "This course introduces the concept of functions through the study of linear, quadratic, trigonometric, and exponential relations. Students will represent and analyze functions in various forms, explore inverse functions, and solve real-world problems using mathematical reasoning.",
    units: [
      { title: "Characteristics of Functions", hours: 27 },
      { title: "Exponetial Functions", hours: 27 },
      { title: "Trigonometric Functions", hours: 27 },
      { title: "Discrete Functions", hours: 27 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "MHF4U",
    x: 3.5,
    y: 2.25,
    connects: ["MCR3U"],
    in: {
      engineering: "required",
      "life-health-science": "required",
      "computer-science": "required",
      business: "required",
    },
    title: "Advanced Functions Grade 12, University (MHF4U)",
    name: "Advanced Functions 12",
    grade: 12,
    type: "University",
    creditValue: 1.0,
    prerequisite: "MCR3U",
    description:
      "This course extends students’ understanding of functions through the study of polynomial, rational, logarithmic, and trigonometric functions. Students will develop skills in combining functions, analyzing rates of change, and applying mathematical processes in preparation for university-level studies.",
    units: [
      { title: "Polynomial and Rational Functions", hours: 27 },
      { title: "Exponential and Logarithmic Functions", hours: 27 },
      { title: "Trigonometric Functions", hours: 27 },
      { title: "Characteristics of Functions", hours: 27 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "MCV4U",
    x: 4.75,
    y: 2.5,
    connects: ["MCR3U"],
    in: {
      engineering: "required",
      "life-health-science": "required",
      "computer-science": "required",
      business: "required",
    },
    title: "Calculus and Vectors Grade 12, University (MCV4U)",
    name: "Calculus and Vectors 12",
    grade: 12,
    type: "University",
    creditValue: 1.0,
    prerequisite: "MHF4U",
    description:
      "This course deepens students’ understanding of functions, including polynomial, rational, logarithmic, and trigonometric types. Students will learn to combine functions, explore rates of change, and apply advanced mathematical processes. It prepares students for Calculus and Vectors or other university-level programs in mathematics.",
    units: [
      { title: "Rate of Change", hours: 36 },
      { title: "Derivatives and Their Applications", hours: 36 },
      { title: "Geometry and Algebra of Vectors", hours: 36 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "ENG1D",
    x: 5.75,
    y: -1.5,
    connects: [],
    in: {
      engineering: "required",
      "life-health-science": "required",
      "computer-science": "required",
      business: "required",
    },
    title: "English Grade 9, Academic (ENG1D)",
    name: "English 9",
    grade: 9,
    type: "Academic",
    creditValue: 1.0,
    prerequisite: "None",
    description:
      "This course develops students’ skills in reading, writing, oral communication, and media literacy. Students will study literary, informational, and graphic texts, and create work in various forms with a focus on effective communication. It prepares students for Grade 10 academic English and future university or college pathways.",
    units: [
      { title: "Reading and Literature Studies", hours: 25 },
      { title: "Writing", hours: 25 },
      { title: "Oral Communication", hours: 25 },
      { title: "Media Studies", hours: 25 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "ENG2D",
    x: 6.5,
    y: 0,
    connects: ["ENG1D"],
    in: {
      engineering: "required",
      "life-health-science": "required",
      "computer-science": "required",
      business: "required",
    },
    title: "English Grade 10, Academic (ENG2D)",
    name: "English 10",
    grade: 10,
    type: "Academic",
    creditValue: 1.0,
    prerequisite: "ENG1D",
    description:
      "This course builds on students’ skills in reading, writing, oral communication, and media literacy. Students will analyze literary, informational, and graphic texts, and produce work in various forms, with a focus on effective communication. It prepares students for the Grade 11 university or college preparation course.",
    units: [
      { title: "Reading and Literature Studies", hours: 25 },
      { title: "Writing", hours: 25 },
      { title: "Oral Communication", hours: 25 },
      { title: "Media Studies", hours: 25 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "ENG3U",
    x: 6,
    y: 1,
    connects: ["ENG2D"],
    in: {
      engineering: "required",
      "life-health-science": "required",
      "computer-science": "required",
      business: "required",
    },
    title: "English Grade 11, University (ENG3U)",
    name: "English 11",
    grade: 11,
    type: "University",
    creditValue: 1.0,
    prerequisite: "ENG2D",
    description:
      "This course develops literacy, communication, and critical thinking skills through the analysis of complex literary, informational, and graphic texts. Students will create oral, written, and media texts with a focus on precision, clarity, and effective use of style. It prepares students for the Grade 12 university or college preparation course.",
    units: [
      { title: "Reading and Literature Studies", hours: 25 },
      { title: "Writing", hours: 25 },
      { title: "Oral Communication", hours: 25 },
      { title: "Media Studies", hours: 25 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "ENG4U",
    x: 6.75,
    y: 2.5,
    connects: ["ENG3U"],
    in: {
      engineering: "required",
      "life-health-science": "required",
      "computer-science": "required",
      business: "required",
    },
    title: "English Grade 12, University (ENG4U)",
    name: "English 12",
    grade: 12,
    type: "University",
    creditValue: 1.0,
    prerequisite: "ENG3U",
    description:
      "This course consolidates students’ literacy, communication, and critical thinking skills through the study of complex literary, informational, and graphic texts. Students will produce a variety of texts, use academic language effectively, and refine reading and writing strategies. It prepares students for university, college, or the workplace.",
    units: [
      { title: "Reading and Literature Studies", hours: 25 },
      { title: "Writing", hours: 25 },
      { title: "Oral Communication", hours: 25 },
      { title: "Media Studies", hours: 25 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "TAS1O",
    x: 2.25,
    y: -1.5,
    connects: [],
    in: {
      engineering: "recommended",
    },
    title: "Technology Grade 9, Open (TAS1O)",
    name: "Technology 9",
    grade: 9,
    type: "Open",
    creditValue: 1.0,
    prerequisite: "None",
    description:
      "This hands-on course expands students’ knowledge of the engineering design process and technology skills. Students will design and build prototypes using industry tools, apply concepts like precision measurement and safety standards, and explore career pathways, including skilled trades.",
    units: [
      { title: "Design Processes and Related Skills", hours: 50 },
      { title: "Technological Development, Impacts, and Careers", hours: 50 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },
  {
    courseCode: "TAS2O",
    x: 2.65,
    y: -0.25,
    connects: ["TAS1O"],
    in: {
      engineering: "recommended",
    },
    title: "Technology Grade 10, Open (TAS2O)",
    name: "Technology 10",
    grade: 10,
    type: "Open",
    creditValue: 1.0,
    prerequisite: "TAS1O",
    description:
      "In this hands-on course, students apply the engineering design process and build prototypes using tools from various industries. They’ll address real-world problems while applying concepts like quality control and safety standards, and explore career and training pathways, including the skilled trades.",
    units: [
      { title: "Design Processes and Related Skills", hours: 50 },
      { title: "Technological Development, Impacts, and Careers", hours: 50 },
      { title: "Independent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    totalHours: 110,
  },

  {
    courseCode: 'BEM1O',
    title: 'Entrepreneurship: Venture Planning (BEM1O)',
    x: 9.5,
    y: -2,
    connects: [],
    in: { business: 'recommended' },
    description:
      'This course introduces students to the mindset and skills needed for entrepreneurial success. Students will explore initiative, adaptability, creativity, and financial planning, while using business tools to develop and present their own ideas. The course also builds communication and project management skills.',
    units: [
      { title: 'Business Leadership, Project Management, and Connections', hours: 33 },
      { title: 'The Entrepreneurial Mindset', hours: 33 },
      { title: 'Business Communications', hours: 33 },
      { title: 'Independent Study Unit', hours: 8 },
      { title: 'Final Exam', hours: 2 }
    ],
    grade: 10,
    type: 'Open',
    creditValue: 1.0,
    prerequisite: 'None',
    totalHours: 110
  },
  {
    courseCode: 'BEP2O',
    title: 'Entrepreneurship: The Enterprising Person (BEP2O)',
    x: 7.5,
    y: -1,
    connects: ['BEM1O'],
    in: { business: 'recommended' },
    description:
      'This course introduces students to the world of business and the skills needed to succeed ethically and responsibly. Students will explore entrepreneurship and learn how to manage key business functions, including accounting, marketing, finance, HR, ICT, and production.',
    units: [
      { title: 'Business Leadership, Project Management, and Connections', hours: 25 },
      { title: 'Economic Foundations', hours: 25 },
      { title: 'Entrepreneurship: From Mindset to Venture', hours: 25 },
      { title: 'Business Functions', hours: 25 },
      { title: 'Independent Study Unit', hours: 8 },
      { title: 'Final Exam', hours: 2 }
    ],
    grade: 11,
    type: 'Open',
    creditValue: 1.0,
    prerequisite: 'None',
    totalHours: 110
  },
  {
    courseCode: 'TGJ3M',
    title: 'Communications Technology (TGJ3M)',
    x: 9.25,
    y: -0.55,
    connects: [],
    in: { business: 'recommended' },
    description:
      'This course explores communications technology through media projects in areas such as video, audio, graphic design, photography, and digital media. Students will build practical skills, examine societal and environmental impacts, and explore postsecondary and career opportunities in the field.',
    units: [
      { title: 'Communications Technology Fundamentals', hours: 25 },
      { title: 'Communications Technology Skills', hours: 25 },
      { title: 'Technology, the Environment, and Society', hours: 25 },
      { title: 'Professional Practice and Career Opportunities', hours: 25 },
      { title: 'Independent Study Unit', hours: 8 },
      { title: 'Final Exam', hours: 2 }
    ],
    grade: 11,
    type: 'College/University',
    creditValue: 1.0,
    prerequisite: 'None',
    totalHours: 110
  },
  {
    courseCode: 'TGJ4M',
    title: 'Communications Technology (TGJ4M)',
    x: 9.4,
    y: 1.05,
    connects: ['TGJ3M'],
    in: { business: 'recommended' },
    description:
      'This course builds on students’ media skills through hands-on projects in video, audio, graphic design, photography, and digital media. Students will explore the social and environmental impact of communications technology and examine career opportunities in a rapidly evolving industry.',
    units: [
      { title: 'Communications Technology Fundamentals', hours: 25 },
      { title: 'Communications Technology Skills', hours: 25 },
      { title: 'Technology, the Environment, and Society', hours: 25 },
      { title: 'Professional Practice and Career Opportunities', hours: 25 },
      { title: 'Independent', hours: 8 },
      { title: 'Final Exam', hours: 2 },
    ],
    grade: 12,
    type: 'College/University',
    creditValue: 1.0,
    prerequisite: 'TGJ3M',
    totalHours: 110
  },
  {
    courseCode: 'BAF3M',
    title: 'Introduction to Financial Accounting (BAF3M)',
    x: 8.55,
    y: 0.25,
    connects: [],
    in: { business: 'recommended' },
    description:
      'This course introduces the basics of accounting, including principles, procedures, and ethical practices. Students will learn to analyze financial information for service and merchandising businesses, use accounting software, and develop skills for business studies and careers.',
    units: [
      { title: 'Fundamental Accounting Practices', hours: 25 },
      { title: 'Advanced Accounting Practices', hours: 25 },
      { title: 'Internal Control, Financial Analysis, and Decision Making', hours: 25 },
      { title: 'Ethics, Impact of Technology, and Careers', hours: 25 },
      { title: 'Independent Study Unit', hours: 8 },
      { title: 'Final Exam', hours: 2 }
    ],
    grade: 11,
    type: 'College/University',
    creditValue: 1.0,
    prerequisite: 'None',
    totalHours: 110
  },
  {
    courseCode: 'BOH4M',
    title: 'Business Leadership (BOH4M)',
    x: 8.7,
    y: 2.45,
    connects: [],
    in: { business: 'recommended' },
    description:
      'This course develops leadership skills for business success, focusing on decision-making, team dynamics, conflict management, employee motivation, and planning. Students will also explore effective communication, ethics, and social responsibility in the workplace.',
    units: [
      { title: 'Foundations of Management', hours: 20 },
      { title: 'Leading', hours: 20 },
      { title: 'Management Challenges', hours: 20 },
      { title: 'Planning and Controlling', hours: 20 },
      { title: 'Organizing', hours: 20 },
      { title: 'Independent Study Unit', hours: 8 },
      { title: 'Final Exam', hours: 2 }
    ],
    grade: 12,
    type: 'College/University',
    creditValue: 1.0,
    prerequisite: 'None',
    totalHours: 110
  },
  {
    courseCode: 'BBB4M',
    title: 'International Business (BBB4M)',
    x: 8.25,
    y: 1.75,
    connects: [],
    in: { business: 'recommended' },
    description:
      'This course explores the role of international business and trade in the global economy. Students will examine strategies for marketing, distribution, and management in international markets, preparing them for postsecondary studies in business, marketing, and management.',
    units: [
      { title: 'Business, Trade, and the Economy', hours: 20 },
      { title: 'The Global Environment for Business- Culture, Politics and Economics of Trade', hours: 20 },
      { title: 'Factors Influencing Success in International Markets- Trade Organizations and Social Responsibility', hours: 20 },
      { title: 'Marketing Challenges and Approaches and Distribution and Logistics', hours: 20 },
      { title: 'Working in International Markets ', hours: 20 },
      { title: 'Independent Study Unit', hours: 8 },
      { title: 'Final Exam', hours: 2 }
    ],
    grade: 12,
    type: 'College/University',
    creditValue: 1.0,
    prerequisite: 'None',
    totalHours: 110
  },
  {
    courseCode: 'BDV4C',
    title: 'Entrepreneurship: Venture Creation (BDV4C)',
    x: 9.25,
    y: 1.95,
    connects: [],
    in: {'business': 'recommended'},
    description:
      "This course helps students develop entrepreneurial skills by creating a venture plan focused on e-commerce. Students will research a business opportunity and build a comprehensive plan, including a website.",
    units: [
      { title: 'E-Commerce and Venture Planning', hours: 20 },
      { title: 'The Venture Concept', hours: 20 },
      { title: 'Preparing for Start-up', hours: 20 },
      { title: 'Targeting Customers', hours: 20 },
      { title: 'Developing a Venture Plan', hours: 20 },
      { title: 'Independent Study Unit', hours: 8 },
      { title: 'Final Exam', hours: 2 }
    ],
    grade: 12,
    type: 'College',
    creditValue: 1.0,
    prerequisite: 'None',
    totalHours: 110
  },

   {
    courseCode: 'ICS3U',
    x: 7.35,
    y: 0.65,
    connects: [],
    in: {'engineering': 'recommended', 'computer-science':'recommended'},
    description:
      "This course introduces programming fundamentals and problem-solving techniques. Students will design, write, and test programs using the software development life cycle. They will also explore computer systems, environmental concerns, safe computing, emerging technologies, and postsecondary opportunities in computing.",
    units: [
      { title: 'Programming Concepts and Skills', hours: 25 },
      { title: 'Software Development', hours: 25 },
      { title: 'Computer Environments and Systems', hours: 25 },
      { title: 'Computers and Society', hours: 25 },
      { title: 'Independent Study Unit', hours: 8 },
      { title: 'Final Exam', hours: 2 }
    ],
    grade: 12,
    type: 'University',
    creditValue: 1.0,
    prerequisite: 'None',
    totalHours: 110
  },

     {
    courseCode: 'ICS4U',
    x: 7.15,
    y: 1.65,
    connects: ['ICS3U'],
    in: {'engineering': 'recommended', 'computer-science':'recommended'},
    description:
      "This course introduces programming concepts and problem-solving strategies. Students will design, write, and test programs while applying the software development life cycle. They’ll also explore computer systems, environmental issues, safe computing, emerging technologies, and related postsecondary opportunities.",
    units: [
      { title: 'Programming Concepts and Skills', hours: 25 },
      { title: 'Software Development', hours: 25 },
      { title: 'Designing Modular Programs', hours: 25 },
      { title: 'Topics in Computer Science', hours: 25 },
      { title: 'Independent Study Unit', hours: 8 },
      { title: 'Final Exam', hours: 2 }
    ],
    grade: 12,
    type: 'University',
    creditValue: 1.0,
    prerequisite: 'None',
    totalHours: 110
  },

  {
    courseCode: "required",
    x: -1,
    y: -1,
    connects: [],
    in: {
      engineering: "required",
      "life-health-science": "required",
      "computer-science": "required",
      business: "required",
    },
  },
  {
    courseCode: "recommend",
    x: -1,
    y: -0.5,
    connects: [],
    in: {
      engineering: "recommended",
      "life-health-science": "recommended",
      "computer-science": "recommended",
      business: "recommended",
    },
    description:
      "This course allows students to develop entrepreneurial skills by creating a venture plan focused on e-commerce. Students will research a business opportunity and design a plan that includes a functional website.",
    units: [
      { title: "E-Commerce and Venture Planning", hours: 20 },
      { title: "The Venture Concept", hours: 20 },
      { title: "Preparing for Start-up", hours: 20 },
      { title: "Targeting Customers", hours: 20 },
      { title: "Developing a Venture Plan", hours: 20 },
      { title: "Indpedent Study Unit", hours: 8 },
      { title: "Final Exam", hours: 2 },
    ],
    grade: 12,
    type: "College",
    creditValue: 1.0,
    prerequisite: "None",
    totalHours: 110,
  },
];

const pathwayColors = {
  engineering: "#953EDE",
  "engineering-light": "#C99BEE",

  "life-health-science": "#73c6b6",
  "life-health-science-light": "#c3e6df",

  "computer-science": "#3a94cf",
  "computer-science-light": "#b7d7ec",

  business: "#e74c3c",
  "business-light": "#f5b7b1",
};

export default function Pathways() {
  const [activeCategory, setActiveCategory] = useState("engineering");
  const navigate = useNavigate();

  const handleClick = (category) => {
    setActiveCategory(category);
  };

  const renderCourseDetails = (course) => {
    if (!course) return null;

    return (
      <div
        style={{
          textAlign: "left",
          maxWidth: 300,
          fontSize: 13,
          whiteSpace: "normal",
          overflowWrap: "break-word",
        }}
      >
        <strong>{course.title}</strong>
        <p>{course.description}</p>
        <p>
          <b>Grade:</b> {course.grade} | <b>Type:</b> {course.type} |{" "}
          <b>Credits:</b> {course.creditValue}
        </p>
        <p>
          <b>Prerequisite:</b> {course.prerequisite}
        </p>
        <b>Units:</b>
        <ul style={{ paddingLeft: "1.2em" }}>
          {course.units?.map((unit, i) => (
            <li key={i}>
              {unit.title} - {unit.hours} hours
            </li>
          ))}
        </ul>
        <p>
          <b>Total Hours:</b> {course.totalHours}
        </p>
      </div>
    );
  };

  const renderCourses = () => {
    const scale = 120;
    return courses.map((course) => {
      const isDummy = course.courseCode === "required" || course.courseCode === "recommend";

      const relevance = course.in?.[activeCategory];
      const isRelevant = relevance !== undefined;
      const isRecommended = relevance === "recommended";

      const nodeStyle = {
        backgroundColor: isRelevant
          ? isRecommended
            ? pathwayColors[`${activeCategory}-light`]
            : pathwayColors[activeCategory]
          : "#f0f3f4",
        border: isRecommended
          ? `2px dashed ${pathwayColors[activeCategory]}`
          : isRelevant
          ? `2px solid ${pathwayColors[activeCategory]}`
          : "1px solid #ccc",
        left: `${course.x * scale}px`,
        top: `${course.y * scale + 200}px`,
        cursor: isDummy ? "default" : "pointer",
        position: "absolute",
        width: 100,
        height: 50,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        userSelect: "none",
        transition: "box-shadow 0.3s",
        zIndex: 1,
      };

      const content = (
        <div
          className={`course-node ${!isRelevant ? "dimmed" : ""}`}
          style={nodeStyle}
          onClick={() => navigate(`/view/${course.courseCode}`)}
        >
          {course.courseCode}
        </div>
      );

      return isDummy ? (
        content
      ) : (
        <Tooltip
          key={course.courseCode}
          title={renderCourseDetails(course)}
          arrow
          placement="top"
          enterTouchDelay={0}
        >
          {content}
        </Tooltip>
      );
    });
  };

  const renderLines = () => {
    const scale = 120;
    const nodeWidth = 100;
    const nodeHeight = 50;

    const lines = [];

    courses.forEach((course) => {
      if (!course.connects || course.connects.length === 0) return;

      course.connects.forEach((fromCode) => {
        const from = courses.find((c) => c.courseCode === fromCode);
        if (!from) return;

        const isRelevant =
          course.in?.[activeCategory] !== undefined &&
          from.in?.[activeCategory] !== undefined;
        const color = isRelevant ? pathwayColors[activeCategory] : "#f7f9f9";

        const x1 = from.x * scale + nodeWidth / 2;
        const y1 = from.y * scale + 200 + nodeHeight / 2;
        const x2 = course.x * scale + nodeWidth / 2;
        const y2 = course.y * scale + 200 + nodeHeight / 2;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        lines.push(
          <div
            key={`${fromCode}->${course.courseCode}`}
            className="connection-line"
            style={{
              width: `${length}px`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: "0 0",
              left: `${x1}px`,
              top: `${y1}px`,
              backgroundColor: color,
              position: "absolute",
              height: "2px",
              zIndex: 0,
            }}
          />
        );
      });
    });

    return lines;
  };

  return (
    <div style={{ paddingBottom: 30 }}>
    <div className="pathways-container" style={{ position: "relative", minHeight: 600}}>
      <div className="navbar" style={{ marginBottom: 20 }}>
        {["engineering", "life-health-science", "computer-science", "business"].map(
          (cat) => (
            <button
              key={cat}
              className={`nav-link ${activeCategory === cat ? "active" : ""}`}
              onClick={() => handleClick(cat)}
              style={
                activeCategory === cat
                  ? {
                      color: pathwayColors[cat],
                      borderBottom: `2px solid ${pathwayColors[cat]}`,
                    }
                  : {}
              }
            >
              {cat === "life-health-science"
               ? "Life / Health Science"
               : cat.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
          )
        )}
      </div>

      <div className="canvas" style={{ position: "relative", height: "100%" }}>
        {renderLines()}
        {renderCourses()}
      </div>
    </div>
    </div>
  );
}