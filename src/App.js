import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Circle, Text } from 'react-konva';

const App = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [rectangles, setRectangles] = useState([]);
  const [selectedId, selectShape] = useState(null);
  const [baseImage, setBaseImage] = useState(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const image = new window.Image();
    // Mettez l'URL de votre image de fond ici
    image.src = "path/to/your/image.jpg";  
    image.onload = () => {
      setBaseImage(image);
    };
  }, []);

  const checkDeselect = e => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const addRectangle = (x, y) => {
    const rect = {
      x,
      y,
      width: 100,
      height: 100,
      id: `rect-${rectangles.length + 1}`,
      image: null,
      angle: 0,
    };
    setRectangles([...rectangles, rect]);
    selectShape(rect.id);
  };

  const updateRectangle = (id, newProps) => {
    setRectangles(
      rectangles.map(rect => (rect.id === id ? { ...rect, ...newProps } : rect))
    );
  };

  const uploadImage = (e, id) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = event => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        updateRectangle(id, { image: img });
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        type="file"
        onChange={e => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = event => {
            const img = new window.Image();
            img.src = event.target.result;
            img.onload = () => {
              setBaseImage(img);
            };
          };
          reader.readAsDataURL(file);
        }}
      />
      {selectedId && (
        <input type="file" onChange={e => uploadImage(e, selectedId)} />
      )}
      <button
        onClick={() => {
          setIsDrawing(!isDrawing);
          selectShape(null);
        }}
      >
        Toggle Drawing Mode
      </button>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={e => {
          if (isDrawing) {
            addRectangle(e.evt.layerX, e.evt.layerY);
          } else {
            checkDeselect(e);
          }
        }}
      >
        <Layer>
          {baseImage && (
            <KonvaImage image={baseImage} x={0} y={0} />
          )}
          {rectangles.map((rect, i) => (
            <React.Fragment key={i}>
              <Rect
                {...rect}
                fill={rect.image ? null : 'rgba(0,0,255,0.5)'}
                draggable={!isDrawing}
                onClick={() => {
                  selectShape(rect.id);
                }}
                onTap={() => {
                  selectShape(rect.id);
                }}
                onDragEnd={e => {
                  const attrs = e.target.attrs;
                  updateRectangle(rect.id, attrs);
                }}
                onTransformEnd={e => {
                  const attrs = e.target.attrs;
                  updateRectangle(rect.id, {
                    x: attrs.x,
                    y: attrs.y,
                    width: attrs.width,
                    height: attrs.height,
                  });
                }}
                strokeWidth={selectedId === rect.id ? 4 : 2}
                stroke={selectedId === rect.id ? 'red' : 'black'}
                name="rect"
                onTransform={e => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  node.scaleX(1);
                  node.scaleY(1);
                  updateRectangle(rect.id, {
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(5, node.width() * scaleX),
                    height: Math.max(node.height() * scaleY),
                  });
                }}
              />
              {rect.image && (
                <KonvaImage
                  x={rect.x}
                  y={rect.y}
                  image={rect.image}
                  width={rect.width}
                  height={rect.height}
                />
              )}
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
