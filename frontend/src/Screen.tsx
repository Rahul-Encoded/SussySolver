import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "./components/ui/button";
import { ColorSwatch, Group } from "@mantine/core";
import COLORS from "./constants";
import eraserIcon from "@/assets/eraser.png";
import { motion } from "framer-motion";
import katex from "katex";

interface ResponseItem {
  expr: string;
  result: string;
  assign: boolean;
}

interface GeneratedResult {
  expression: string;
  answer: string;
}

// Helper component to render a single math string using KaTeX
// This component will receive the LaTeX string in 'expression' and 'answer' props
const MathOutput: React.FC<{ expression: string; answer: string }> = ({
  expression,
  answer,
}) => {
  const mathRef = useRef<HTMLDivElement>(null); // Ref for the container div

  // Effect to render math whenever the props change
  useEffect(() => {
    if (mathRef.current) {
      // Construct the string to render.
      // We assume expression and answer *are* the LaTeX strings from the backend.
      // For inline math, we can just concatenate them with an equals sign.
      // KaTeX will render the LaTeX commands like \sqrt, \times, etc.
      const latexString = `${expression} = ${answer}`;

      try {
        // Use katex.render to render the string into the ref's element
        // displayMode: false for inline math
        katex.render(latexString, mathRef.current, {
          throwOnError: false, // Don't throw errors, just show the LaTeX string
          displayMode: false,
        });
      } catch (error) {
        console.error("KaTeX rendering error:", error);
        // Fallback: Display the raw text if KaTeX rendering fails
        if (mathRef.current) {
          mathRef.current.textContent = `${expression} = ${answer}`;
        }
      }
    }
  }, [expression, answer]); // Rerun effect if expression or answer changes

  // Render a div that will contain the rendered math
  // Use a specific class if needed for targeting by MathJax/KaTeX, though KaTeX works on the ref.
  return <div ref={mathRef}></div>;
};

function Screen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("rgb(255, 255, 255)");
  const [reset, setReset] = useState(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [dict, setDict] = useState<Record<string, any>>({});
  const [generatedOutputs, setGeneratedOutputs] = useState<GeneratedResult[]>(
    []
  );

  const reference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reset) {
      resetCanvas();
      setDict({});
      setGeneratedOutputs([]);
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - canvas.offsetTop;
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
      }
    }
  }, []);

  const sendData = async () => {
    const canvas = canvasRef.current;

    if (canvas) {
      const imageDataUrl = canvas.toDataURL("image/png");

      try {
        const response = await axios({
          method: "post",
          url: `${import.meta.env.VITE_API_URL}/calc`,
          data: {
            image: imageDataUrl,
            dict_of_vars: dict,
          },
        });

        const resp = response.data;
        console.log("Response: ", resp);

        if (resp && Array.isArray(resp.data)) {
          resp.data.forEach((item: ResponseItem) => {
            if (item.assign === true) {
              setDict((prevDict) => ({
                ...prevDict,
                [item.expr]: item.result,
              }));
            }
          });

          const outputs = resp.data.map((item: ResponseItem) => ({
            expression: item.expr,
            answer: item.result,
          }));
          setGeneratedOutputs(outputs); // Store all generated results
        } else {
          console.error("Unexpected response format:", resp);
          setGeneratedOutputs([
            { expression: "Error", answer: "Unexpected backend response" },
          ]);
        }
      } catch (error) {
        console.error("Error sending data:", error);
        setGeneratedOutputs([
          { expression: "Error", answer: "Failed to connect to backend" },
        ]);
      }
    } else {
      console.error("Canvas element not found.");
      setGeneratedOutputs([
        { expression: "Error", answer: "Canvas not available" },
      ]);
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.background = "black";
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (eraseMode) {
          ctx.globalCompositeOperation = "destination-out";
          ctx.lineWidth = 10;
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.lineWidth = 3;
          ctx.strokeStyle = color;
        }
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
      }
    }
  };

  return (
    <div className="bg-black w-full h-dvh p-4">
      <div className="flex bg-black">
        <Group className="z-20 m-auto">
          {COLORS.map((COLOR: string) => (
            <ColorSwatch
              key={COLOR}
              color={COLOR}
              onClick={() => setColor(COLOR)}
            ></ColorSwatch>
          ))}
        </Group>
        <Button
          onClick={() => setReset(true)}
          className="z-20 bg-black text-white m-auto"
          variant="default"
          color="black"
        >
          Reset
        </Button>
        <Button
          onClick={() => setEraseMode(!eraseMode)}
          className="z-20 bg-black text-white m-auto"
        >
          {eraseMode ? "Erasing..." : "Eraser"}
        </Button>
        <Button
          onClick={sendData}
          className="z-20 bg-black text-white m-auto"
          variant="default"
          color="black"
        >
          Calculate
        </Button>
      </div>
      <div ref={reference} className="bg-black items-center">
        <canvas
          ref={canvasRef}
          id="canvas"
          className="m-auto mt-4 block w-[95vw] h-[90vh] border border-slate-400 bg-black"
          onMouseMove={draw}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          style={{
            cursor: eraseMode ? `url(${eraserIcon}) 8 8, pointer` : "crosshair",
          }}
        ></canvas>

        {/* Display generated outputs */}
        <motion.div
          drag
          dragConstraints={reference}
          whileDrag={{ scale: 1.2 }}
          dragElastic={0.1}
          dragTransition={{
            bounceDamping: 10,
            bounceStiffness: 400,
          }}
          className="absolute inset-3/4 w-xl text-xl text-center p-2 text-green-600 rounded shadow-md z-10"
        >
          {generatedOutputs.map((output, index) => (
            <MathOutput
              key={index}
              expression={output.expression}
              answer={output.answer}
            ></MathOutput>
          ))}
          {Object.keys(dict).length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-600 text-sm text-white">
              Assigned:{" "}
              {Object.entries(dict)
                .map(([key, value]) => `${key}=${value}`)
                .join(", ")}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Screen;
