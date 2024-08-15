import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Move, PenLine } from 'lucide-react';

const tools = [
  { name: 'zoom-in', icon: ZoomIn },
  { name: 'zoom-out', icon: ZoomOut },
  { name: 'pan', icon: Move },
  { name: 'draw-polygon', icon: PenLine },
];

const SVGEditor = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activeTool, setActiveTool] = useState('draw-polygon');
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 50,
      });
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleToolClick = (toolName) => {
    setActiveTool(toolName);
  };

  const handleSvgMouseMove = (event) => {
    if (activeTool === 'draw-polygon') {
      const svg = svgRef.current;
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
      setMousePosition({ x: svgPoint.x, y: svgPoint.y });
    }
  };

  const handleSvgClick = (event) => {
    if (activeTool === 'draw-polygon') {
      const svg = svgRef.current;
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
      const newPoint = { x: svgPoint.x, y: svgPoint.y };

      if (currentPolygon.length > 0) {
        const startPoint = currentPolygon[0];
        const distance = Math.sqrt(
          Math.pow(newPoint.x - startPoint.x, 2) + Math.pow(newPoint.y - startPoint.y, 2)
        );

        if (distance < 10 && currentPolygon.length > 2) {
          // Close the polygon
          setPolygons([...polygons, [...currentPolygon, startPoint]]);
          setCurrentPolygon([]);
        } else {
          setCurrentPolygon([...currentPolygon, newPoint]);
        }
      } else {
        setCurrentPolygon([newPoint]);
      }
    }
  };

  const renderPolygons = () => {
    return polygons.map((polygon, index) => (
      <polygon
        key={index}
        points={polygon.map(point => `${point.x},${point.y}`).join(' ')}
        fill="none"
        stroke="black"
        strokeWidth="2"
      />
    ));
  };

  const renderCurrentPolygon = () => {
    if (currentPolygon.length === 0) return null;

    const points = currentPolygon.map(point => `${point.x},${point.y}`).join(' ');
    const lastPoint = currentPolygon[currentPolygon.length - 1];

    return (
      <>
        <polyline
          points={points}
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
        <line
          x1={lastPoint.x}
          y1={lastPoint.y}
          x2={mousePosition.x}
          y2={mousePosition.y}
          stroke="gray"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
      </>
    );
  };

  return (
    <div className="svg-editor">
      <div className="toolbar" style={{ height: '50px', width: '100%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
        {tools.map((tool) => (
          <button
            key={tool.name}
            onClick={() => handleToolClick(tool.name)}
            style={{
              backgroundColor: activeTool === tool.name ? '#ddd' : 'transparent',
              border: 'none',
              padding: '5px',
              margin: '0 5px',
              cursor: 'pointer',
            }}
          >
            <tool.icon size={24} />
          </button>
        ))}
      </div>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ border: '1px solid black' }}
        onMouseMove={handleSvgMouseMove}
        onClick={handleSvgClick}
      >
        {renderPolygons()}
        {renderCurrentPolygon()}
      </svg>
    </div>
  );
};

export default SVGEditor;