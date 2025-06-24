import { useState } from 'react'
import './pathways.css'

const courses = [
  {
    id: 'SNC1D',
    x: 0.5,
    y: -1.75,
    connects: [],
    in: ['engineering', 'life-health-science', 'computer-science', 'business']
  },
  {
    id: 'SNC2D',
    x: 1.25,
    y: -0.8,
    connects: ['SNC1D'],
    in: ['engineering', 'life-health-science', 'computer-science', 'business']
  },
  {
    id: 'SPH3U',
    x: 0,
    y: 0.25,
    connects: ['SNC2D'],
    in: ['engineering']
  },

  {
    id: 'SPH4U',
    x: 0.25,
    y: 1.75,
    connects: ['SPH3U'],
    in: ['engineering']
  },
  {
    id: 'SCH3U',
    x: 1.25,
    y: 1,
    connects: ['SNC2D'],
    in: ['engineering', 'life-health-science']
  },
    {
    id: 'SCH4U',
    x: 1,
    y: 2.35,
    connects: ['SCH3U'],
    in: ['life-health-science']
  },
  {
    id: 'SBI3U',
    x: 2.15,
    y: 0.35,
    connects: ['SNC2D'],
    in: ['life-health-science']
  },

  {
    id: 'SBI4U',
    x: 2.45,
    y: 1.8,
    connects: ['SBI3U'],
    in: ['life-health-science']
  },

  {
    id: 'MPM1D',
    x: 4,
    y: -1,
    connects: [],
    in: ['engineering', 'life-health-science', 'computer-science', 'business']
  },

  {
    id: 'MPM2D',
    x: 4.75,
    y: 0.25,
    connects: ['MPM1D'],
    in: ['engineering', 'life-health-science', 'computer-science', 'business']
  },

    {
    id: 'MCR3U',
    x: 3.75,
    y: 1.25,
    connects: ['MPM2D'],
    in: ['engineering', 'life-health-science', 'computer-science', 'business']
  },

    {
    id: 'MHF4U',
    x: 3.5,
    y: 2.25,
    connects: ['MCR3U'],
    in: ['engineering', 'life-health-science', 'computer-science', 'business']
  },

    {
    id: 'MCV4U',
    x: 4.75,
    y: 2.75,
    connects: ['MCR3U'],
    in: ['engineering', 'life-health-science', 'computer-science', 'business']
  },

  {
    id: 'ENG1D',
    x: 5.75,
    y: -1.5,
    connects: [],
    in: ['engineering', 'life-health-science', 'computer-science', 'business']
  },
  {
    id: 'ENG2D',
    x: 6.5,
    y: 0,
    connects: ['ENG1D'],
   in: ['engineering', 'life-health-science', 'computer-science', 'business']
  },
  {
    id: 'ENG3U',
    x: 6,
    y: 1,
    connects: ['ENG2D'],
    in: ['engineering', 'life-health-science', 'computer-science', 'business']
  },
  {
    id: 'ENG4U',
    x: 6.75,
    y: 2.5,
    connects: ['ENG3U'],
 in: ['engineering', 'life-health-science', 'computer-science', 'business']
  },

   {
    id: 'TAS1O',
    x: 2.25,
    y: -1.5,
    connects: [],
 in: ['engineering']
  },

   {
    id: 'TAS2O',
    x: 2.65,
    y: -0.25,
    connects: ['TAS1O'],
    in: ['engineering']
  },

  {
    id: 'BEM1O',
    x: 9.5,
    y: -2,
    connects: [],
    in: ['business']
  },

  {
    id: 'BEP2O',
    x: 7.5,
    y: -1.5,
    connects: [],
    in: ['business']
  },

   {
    id: 'TGJ3M',
    x: 9.25,
    y: -0.55,
    connects: [],
    in: ['business']
  },

   {
    id: 'TGJ4M',
    x: 9.4,
    y: 1.05,
    connects: ['TGJ3M'],
    in: ['business']
  },

  {
    id: 'BDI3C',
    x: 8,
    y: -0.25,
    connects: [],
    in: ['business']
  },

   {
    id: 'BAF3M',
    x: 8.55,
    y: 0.25,
    connects: [],
    in: ['business']
  },

  {
    id: 'BOH4M',
    x: 8.7,
    y: 2.45,
    connects: [],
    in: ['business']
  },

   {
    id: 'BBB4M',
    x: 8.25,
    y: 1.75,
    connects: [],
    in: ['business']
  },

   {
    id: 'BDV4C',
    x: 9.25,
    y: 1.95,
    connects: [],
    in: ['business']
  },

   {
    id: 'ICS3U',
    x: 7.35,
    y: 0.65,
    connects: [],
    in: ['engineering', 'computer-science']
  },

     {
    id: 'ICS4U',
    x: 7.15,
    y: 1.65,
    connects: ['ICS3U'],
    in: ['engineering', 'computer-science']
  }
];


const pathwayColors = {
  engineering: '#800080',
  'life-health-science': '#73c6b6',
  'computer-science': '#3a94cf',
  'business' : '#e74c3c',
};

export default function Pathways() {
  const [activeCategory, setActiveCategory] = useState('engineering')

  const handleClick = (category) => {
    setActiveCategory(category)
  }
const renderCourses = () => {
  const scale = 120;
  return courses.map(course => {
    const isRelevant = course.in.includes(activeCategory);
    return (
      <div
        key={course.id}
        className={`course-node ${!isRelevant ? 'dimmed' : ''}`}
        style={{
          backgroundColor: isRelevant ? pathwayColors[activeCategory] : '#f0f3f4',
          left: `${course.x * scale}px`,
          top: `${course.y * scale + 200}px`
        }}
      >
        {course.id}
      </div>
    );
  });
};
const renderLines = () => {
  const scale = 120;
  const nodeWidth = 100;   // match your .course-node CSS width
  const nodeHeight = 50;   // match your .course-node CSS height

  const lines = [];

  courses.forEach(course => {
    if (!course.connects || course.connects.length === 0) return;

    course.connects.forEach(fromId => {
      const from = courses.find(c => c.id === fromId);
      if (!from) return;

      const isRelevant = course.in.includes(activeCategory) && from.in.includes(activeCategory);
      const color = isRelevant ? pathwayColors[activeCategory] : '#f7f9f9';

      // Compute center points of both boxes
      const x1 = from.x * scale + nodeWidth / 2;
      const y1 = from.y * scale + 200 + nodeHeight / 2;
      const x2 = course.x * scale + nodeWidth / 2;
      const y2 = course.y * scale + 200 + nodeHeight / 2;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;

      lines.push(
        <div
          key={`${fromId}->${course.id}`}
          className="connection-line"
          style={{
            width: `${length}px`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: '0 0',
            left: `${x1}px`,
            top: `${y1}px`,
            backgroundColor: color
          }}
        />
      );
    });
  });

  return lines;
};
  return (
    <div className="pathways-container">
      <div className="navbar">

        <button
           className={`nav-link ${activeCategory === 'engineering' ? 'active' : ''}`}
           onClick={() => handleClick('engineering')}
           style={
            activeCategory === 'engineering'
          ? {
           color: pathwayColors['engineering'],
            borderBottom: `2px solid ${pathwayColors['engineering']}`
         }: {}  }>Engineering</button>


        <button 
         className={`nav-link ${activeCategory === 'life-health-science' ? 'active' : ''}`}
         onClick={() => handleClick('life-health-science')}
         style={
         activeCategory === 'life-health-science'
         ? {
          color: pathwayColors['life-health-science'],
          borderBottom: `2px solid ${pathwayColors['life-health-science']}`
         }: {} }>Life/Health Science</button>


        <button      
        className={`nav-link ${activeCategory === 'computer-science' ? 'active' : ''}`}
         onClick={() => handleClick('computer-science')}
         style={
         activeCategory === 'computer-science'
         ? {
         color: pathwayColors['computer-science'],
        borderBottom: `2px solid ${pathwayColors['computer-science']}`
        }: {}}>Computer Science</button>


        <button 
         className={`nav-link ${activeCategory === 'business' ? 'active' : ''}`}
         onClick={() => handleClick('business')}
         style={
        activeCategory === 'business'
         ? {
          color: pathwayColors['business'],
          borderBottom: `2px solid ${pathwayColors['business']}`
        } : {} }>Business</button>

      </div>
      <div className="canvas">
     {renderLines()}
     {renderCourses()}
    </div>
    </div>
  )
}
