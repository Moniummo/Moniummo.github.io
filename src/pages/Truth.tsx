import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Eraser, MousePointer2, PaintBucket, Pencil, RotateCcw, Save, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Stroke {
  color: string;
  points: Array<{ x: number; y: number }>;
  size: number;
  tool: "brush" | "eraser";
}

interface FillAction {
  href: string;
  height: number;
  width: number;
}

type PaintAction = { stroke: Stroke; type: "stroke" } | { fill: FillAction; type: "fill" };
type Tool = "select" | "brush" | "eraser" | "fill";
interface SavedPaintState {
  canvasFillColor: string;
  canvasSize: typeof defaultCanvasSize;
  paintActions: PaintAction[];
}

const colors = ["#111111", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];
const defaultCanvasSize = { height: 760, width: 1200 };
const minCanvasSize = { height: 420, width: 640 };
const maxCanvasSize = { height: 1400, width: 2200 };
interface ArtworkFrame {
  height: number;
  href: string;
  preserveAspectRatio: string;
  width: number;
  x: number;
  y: number;
}

const starterArtwork = [
  { href: "/arkan.svg", height: 200, preserveAspectRatio: "xMidYMid meet", width: 430, x: 0, y: 34 },
  { href: "/Dave.svg", height: 200, preserveAspectRatio: "xMidYMid meet", width: 290, x: 340, y: 25 },
  { href: "/navbox.svg", height: 700, preserveAspectRatio: "xMidYMid meet", width: 760, x: 450, y: 100 },
  { href: "/failure.svg", height: 200, preserveAspectRatio: "xMinYMid meet", width: 640, x: 0, y: 200 },
] satisfies ArtworkFrame[];

const sectionArtwork: Record<string, ArtworkFrame[]> = {
  projects: [
    { href: "/projects.svg", height: defaultCanvasSize.height, preserveAspectRatio: "none", width: defaultCanvasSize.width, x: 0, y: 0 },
  ],
  research: [
    { href: "/research.svg", height: defaultCanvasSize.height, preserveAspectRatio: "none", width: defaultCanvasSize.width, x: 0, y: 0 },
  ],
  cv: [
    { href: "/cv.svg", height: defaultCanvasSize.height, preserveAspectRatio: "none", width: defaultCanvasSize.width, x: 0, y: 0 },
  ],
  about: [
    { href: "/aboutme.svg", height: defaultCanvasSize.height, preserveAspectRatio: "none", width: defaultCanvasSize.width, x: 0, y: 0 },
  ],
};

const navBoxFrame = starterArtwork.find((artwork) => artwork.href === "/navbox.svg") ?? starterArtwork[2];
const navBoxViewBox = { height: 793.70081, width: 1122.5197 };
const truthNavLinks = [
  { label: "Projects", path: "/ally/projects", pathId: "path2" },
  { label: "Research", path: "/ally/research", pathId: "path3" },
  { label: "CV", path: "/ally/cv", pathId: "path4" },
  { label: "About me", path: "/ally/about", pathId: "path5" },
] as const;

const toolButtons: Array<{ icon: typeof MousePointer2; label: string; tool: Tool }> = [
  { icon: MousePointer2, label: "Select", tool: "select" },
  { icon: Pencil, label: "Pencil", tool: "brush" },
  { icon: Eraser, label: "Eraser", tool: "eraser" },
  { icon: PaintBucket, label: "Fill", tool: "fill" },
];

const buildPath = (points: Stroke["points"]) => {
  if (points.length === 0) {
    return "";
  }

  return points.reduce((path, point, index) => `${path}${index === 0 ? "M" : " L"} ${point.x} ${point.y}`, "");
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${src}`));
    image.src = src;
  });

const drawImageContained = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  frame: ArtworkFrame,
) => {
  if (frame.preserveAspectRatio === "none") {
    context.drawImage(image, frame.x, frame.y, frame.width, frame.height);
    return;
  }

  const imageRatio = image.naturalWidth / image.naturalHeight;
  const frameRatio = frame.width / frame.height;
  const fitByWidth = imageRatio > frameRatio;
  const drawnWidth = fitByWidth ? frame.width : frame.height * imageRatio;
  const drawnHeight = fitByWidth ? frame.width / imageRatio : frame.height;
  const alignLeft = frame.preserveAspectRatio.startsWith("xMin");
  const x = frame.x + (alignLeft ? 0 : (frame.width - drawnWidth) / 2);
  const y = frame.y + (frame.height - drawnHeight) / 2;

  context.drawImage(image, x, y, drawnWidth, drawnHeight);
};

const getContainedFrame = (frame: ArtworkFrame, source: { height: number; width: number }) => {
  const sourceRatio = source.width / source.height;
  const frameRatio = frame.width / frame.height;
  const fitByWidth = sourceRatio > frameRatio;
  const width = fitByWidth ? frame.width : frame.height * sourceRatio;
  const height = fitByWidth ? frame.width / sourceRatio : frame.height;

  return {
    height,
    scale: width / source.width,
    width,
    x: frame.x + (frame.width - width) / 2,
    y: frame.y + (frame.height - height) / 2,
  };
};

const drawStroke = (context: CanvasRenderingContext2D, stroke: Stroke) => {
  if (stroke.points.length === 0) {
    return;
  }

  context.beginPath();
  context.moveTo(stroke.points[0].x, stroke.points[0].y);
  stroke.points.slice(1).forEach((point) => {
    context.lineTo(point.x, point.y);
  });
  context.strokeStyle = stroke.color;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = stroke.size;
  context.stroke();
};

const hexToRgba = (hex: string) => {
  const normalizedHex = hex.replace("#", "");
  const value = Number.parseInt(normalizedHex, 16);

  return {
    a: 255,
    b: value & 255,
    g: (value >> 8) & 255,
    r: (value >> 16) & 255,
  };
};

const colorDistance = (data: Uint8ClampedArray, index: number, target: ReturnType<typeof hexToRgba>) =>
  Math.abs(data[index] - target.r) +
  Math.abs(data[index + 1] - target.g) +
  Math.abs(data[index + 2] - target.b) +
  Math.abs(data[index + 3] - target.a);

const distanceToSegment = (
  point: { x: number; y: number },
  start: { x: number; y: number },
  end: { x: number; y: number },
) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const amount = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
  const projectionX = start.x + amount * dx;
  const projectionY = start.y + amount * dy;

  return Math.hypot(point.x - projectionX, point.y - projectionY);
};

const sectionLabels: Record<string, string> = {
  about: "About me",
  cv: "CV",
  projects: "Projects",
  research: "Research",
};

const Truth = () => {
  const navigate = useNavigate();
  const { section } = useParams();
  const boardRef = useRef<SVGSVGElement | null>(null);
  const resizeStateRef = useRef<{ height: number; pointerX: number; pointerY: number; width: number } | null>(null);
  const paintStateByPageRef = useRef<Record<string, SavedPaintState>>({});
  const currentPaintPageRef = useRef("main");
  const latestPaintStateRef = useRef<SavedPaintState>({
    canvasFillColor: "#ffffff",
    canvasSize: defaultCanvasSize,
    paintActions: [],
  });
  const navButtonFrame = getContainedFrame(navBoxFrame, navBoxViewBox);
  const [tool, setTool] = useState<Tool>("brush");
  const [activeColor, setActiveColor] = useState(colors[0]);
  const [brushSize, setBrushSize] = useState(5);
  const [canvasFillColor, setCanvasFillColor] = useState("#ffffff");
  const [canvasSize, setCanvasSize] = useState(defaultCanvasSize);
  const [isHoveringClickableNav, setIsHoveringClickableNav] = useState(false);
  const [navButtonPaths, setNavButtonPaths] = useState<Record<string, string>>({});
  const [paintActions, setPaintActions] = useState<PaintAction[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);
  const paintPageKey = section ?? "main";
  const artwork = section ? sectionArtwork[section] ?? starterArtwork : starterArtwork;

  useEffect(() => {
    latestPaintStateRef.current = {
      canvasFillColor,
      canvasSize,
      paintActions,
    };
  }, [canvasFillColor, canvasSize, paintActions]);

  useEffect(() => {
    const previousPaintPage = currentPaintPageRef.current;

    paintStateByPageRef.current[previousPaintPage] = latestPaintStateRef.current;

    const savedPaintState = paintStateByPageRef.current[paintPageKey];

    setActiveStroke(null);
    setPaintActions(savedPaintState?.paintActions ?? []);
    setCanvasFillColor(savedPaintState?.canvasFillColor ?? "#ffffff");
    setCanvasSize(savedPaintState?.canvasSize ?? defaultCanvasSize);
    setTool("brush");
    setIsHoveringClickableNav(false);
    currentPaintPageRef.current = paintPageKey;
  }, [paintPageKey]);

  useEffect(() => {
    const loadNavButtonPaths = async () => {
      const response = await fetch("/navbox.svg");
      const svgText = await response.text();
      const navDocument = new DOMParser().parseFromString(svgText, "image/svg+xml");
      const nextPaths = Object.fromEntries(
        truthNavLinks
          .map((link) => [link.pathId, navDocument.getElementById(link.pathId)?.getAttribute("d")])
          .filter((entry): entry is [string, string] => Boolean(entry[1])),
      );

      setNavButtonPaths(nextPaths);
    };

    void loadNavButtonPaths();
  }, []);

  const getBoardPoint = (clientX: number, clientY: number) => {
    const board = boardRef.current;

    if (!board) {
      return { x: 0, y: 0 };
    }

    const point = board.createSVGPoint();
    point.x = clientX;
    point.y = clientY;

    return point.matrixTransform(board.getScreenCTM()?.inverse());
  };

  const getPoint = (event: ReactPointerEvent<SVGSVGElement>) => getBoardPoint(event.clientX, event.clientY);

  const drawCurrentBoard = async (context: CanvasRenderingContext2D) => {
    context.fillStyle = canvasFillColor;
    context.fillRect(0, 0, canvasSize.width, canvasSize.height);

    const artworkImages = await Promise.all(artwork.map((artworkItem) => loadImage(artworkItem.href)));

    artwork.forEach((artworkItem, index) => {
      drawImageContained(context, artworkImages[index], artworkItem);
    });

    for (const action of paintActions) {
      if (action.type === "stroke") {
        drawStroke(context, action.stroke);
      } else {
        const fillImage = await loadImage(action.fill.href);
        context.drawImage(fillImage, 0, 0, action.fill.width, action.fill.height);
      }
    }
  };

  const floodFill = async (point: { x: number; y: number }) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      return;
    }

    await drawCurrentBoard(context);

    const startX = Math.floor(clamp(point.x, 0, canvas.width - 1));
    const startY = Math.floor(clamp(point.y, 0, canvas.height - 1));
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    const fillColor = hexToRgba(activeColor);
    const startIndex = (startY * canvas.width + startX) * 4;
    const targetColor = {
      a: data[startIndex + 3],
      b: data[startIndex + 2],
      g: data[startIndex + 1],
      r: data[startIndex],
    };

    if (colorDistance(data, startIndex, fillColor) < 8) {
      return;
    }

    const fillCanvas = document.createElement("canvas");
    fillCanvas.width = canvas.width;
    fillCanvas.height = canvas.height;
    const fillContext = fillCanvas.getContext("2d");

    if (!fillContext) {
      return;
    }

    const fillData = fillContext.createImageData(canvas.width, canvas.height);
    const stack = [[startX, startY]];
    const visited = new Uint8Array(canvas.width * canvas.height);
    const tolerance = 60;

    while (stack.length > 0) {
      const currentPoint = stack.pop();

      if (!currentPoint) {
        continue;
      }

      const [x, y] = currentPoint;

      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
        continue;
      }

      const pixelIndex = y * canvas.width + x;

      if (visited[pixelIndex]) {
        continue;
      }

      const dataIndex = pixelIndex * 4;
      visited[pixelIndex] = 1;

      if (colorDistance(data, dataIndex, targetColor) > tolerance) {
        continue;
      }

      fillData.data[dataIndex] = fillColor.r;
      fillData.data[dataIndex + 1] = fillColor.g;
      fillData.data[dataIndex + 2] = fillColor.b;
      fillData.data[dataIndex + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    fillContext.putImageData(fillData, 0, 0);
    setPaintActions((currentActions) => [
      ...currentActions,
      {
        fill: {
          height: canvas.height,
          href: fillCanvas.toDataURL("image/png"),
          width: canvas.width,
        },
        type: "fill",
      },
    ]);
  };

  const startDrawing = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (tool === "select") {
      return;
    }

    const point = getPoint(event);

    if (tool === "fill") {
      void floodFill(point);
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    setActiveStroke({
      color: tool === "eraser" ? canvasFillColor : activeColor,
      points: [point],
      size: tool === "eraser" ? brushSize * 2.5 : brushSize,
      tool,
    });
  };

  const continueDrawing = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!activeStroke) {
      return;
    }

    const point = getPoint(event);
    setActiveStroke((currentStroke) =>
      currentStroke ? { ...currentStroke, points: [...currentStroke.points, point] } : currentStroke,
    );
  };

  const finishDrawing = () => {
    if (!activeStroke) {
      return;
    }

    if (activeStroke.points.length > 1) {
      setPaintActions((currentActions) => [...currentActions, { stroke: activeStroke, type: "stroke" }]);
    }

    setActiveStroke(null);
  };

  const undoStroke = () => {
    setPaintActions((currentActions) => currentActions.slice(0, -1));
  };

  const isPointErased = (point: { x: number; y: number }) =>
    paintActions.some((action) => {
      if (action.type !== "stroke" || action.stroke.tool !== "eraser") {
        return false;
      }

      return action.stroke.points.slice(1).some((strokePoint, index) => {
        const previousPoint = action.stroke.points[index];

        return distanceToSegment(point, previousPoint, strokePoint) <= action.stroke.size / 2 + 2;
      });
    });

  const handleTruthNavClick = (event: ReactPointerEvent<SVGPathElement>, path: string) => {
    if (tool !== "select") {
      return;
    }

    const point = getBoardPoint(event.clientX, event.clientY);

    if (!isPointErased(point)) {
      navigate(path);
    }
  };

  const handleTruthNavPointerMove = (event: ReactPointerEvent<SVGPathElement>) => {
    if (tool !== "select") {
      setIsHoveringClickableNav(false);
      return;
    }

    const point = getBoardPoint(event.clientX, event.clientY);
    setIsHoveringClickableNav(!isPointErased(point));
  };

  const setCanvasWidth = (width: number) => {
    setCanvasSize((currentSize) => ({
      ...currentSize,
      width: clamp(width, minCanvasSize.width, maxCanvasSize.width),
    }));
  };

  const setCanvasHeight = (height: number) => {
    setCanvasSize((currentSize) => ({
      ...currentSize,
      height: clamp(height, minCanvasSize.height, maxCanvasSize.height),
    }));
  };

  const startResizing = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    resizeStateRef.current = {
      height: canvasSize.height,
      pointerX: event.clientX,
      pointerY: event.clientY,
      width: canvasSize.width,
    };

    const continueResizing = (moveEvent: PointerEvent) => {
      const initialState = resizeStateRef.current;

      if (!initialState) {
        return;
      }

      setCanvasSize({
        height: clamp(
          initialState.height + moveEvent.clientY - initialState.pointerY,
          minCanvasSize.height,
          maxCanvasSize.height,
        ),
        width: clamp(
          initialState.width + moveEvent.clientX - initialState.pointerX,
          minCanvasSize.width,
          maxCanvasSize.width,
        ),
      });
    };

    const finishResizing = () => {
      resizeStateRef.current = null;
      window.removeEventListener("pointermove", continueResizing);
      window.removeEventListener("pointerup", finishResizing);
    };

    window.addEventListener("pointermove", continueResizing);
    window.addEventListener("pointerup", finishResizing);
  };

  const savePng = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    await drawCurrentBoard(context);

    const downloadLink = document.createElement("a");
    downloadLink.download = "secret-paint-drawing.png";
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.click();
  };

  const sectionLabel = section ? sectionLabels[section] ?? section : null;

  return (
    <main
      className="min-h-screen bg-[#d7d7d7] text-[#111111]"
      aria-label={sectionLabel ? `${sectionLabel} secret paint canvas` : "Secret paint site canvas"}
    >
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-[#9a9a9a] bg-[#f4f4f4] shadow-[inset_0_-1px_0_#ffffff]">
          <div className="flex h-9 items-center justify-between px-3">
            <p className="font-sans text-sm">{sectionLabel ? `${sectionLabel} - Secret Paint` : "Untitled - Secret Paint"}</p>
            {sectionLabel ? (
              <Link
                to="/ally"
                className="border border-[#9b9b9b] bg-[#eeeeee] px-3 py-1 text-xs shadow-[inset_1px_1px_0_#ffffff] hover:bg-white"
              >
                Back
              </Link>
            ) : (
              <div className="flex gap-1">
                <span className="h-3 w-3 border border-[#767676] bg-white" />
                <span className="h-3 w-3 border border-[#767676] bg-white" />
                <span className="h-3 w-3 border border-[#767676] bg-white" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-stretch gap-2 border-t border-[#c8c8c8] px-3 py-2">
            <div className="flex gap-1 border-r border-[#b6b6b6] pr-2">
              {toolButtons.map(({ icon: Icon, label, tool: nextTool }) => (
                <button
                  key={nextTool}
                  type="button"
                  title={label}
                  aria-label={label}
                  onClick={() => setTool(nextTool)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center border border-[#9b9b9b] bg-[#eeeeee] shadow-[inset_1px_1px_0_#ffffff] transition-colors hover:bg-white",
                    tool === nextTool ? "bg-[#dcecff] shadow-[inset_0_0_0_2px_#7aa7e8]" : "",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 border-r border-[#b6b6b6] pr-2">
              <input
                aria-label="Brush size"
                type="range"
                min="2"
                max="18"
                value={brushSize}
                onChange={(event) => setBrushSize(Number(event.target.value))}
                className="w-28 accent-[#2d6cdf]"
              />
              <div className="flex h-10 w-10 items-center justify-center border border-[#9b9b9b] bg-white">
                <span
                  className="rounded-full bg-black"
                  style={{
                    height: `${brushSize}px`,
                    width: `${brushSize}px`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 border-r border-[#b6b6b6] pr-2">
              <div className="grid grid-cols-4 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    aria-label={`Use ${color}`}
                    onClick={() => setActiveColor(color)}
                    className={cn(
                      "h-5 w-5 border border-[#777777]",
                      activeColor === color ? "outline outline-2 outline-[#2d6cdf] outline-offset-1" : "",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <label className="flex h-10 items-center gap-2 border border-[#9b9b9b] bg-white px-2 text-xs">
                <span>Color</span>
                <input
                  aria-label="Pick custom color"
                  type="color"
                  value={activeColor}
                  onChange={(event) => setActiveColor(event.target.value)}
                  className="h-6 w-8 cursor-pointer border border-[#777777] bg-transparent p-0"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 border-r border-[#b6b6b6] pr-2 text-xs">
              <label className="flex items-center gap-1">
                W
                <input
                  aria-label="Canvas width"
                  type="number"
                  min={minCanvasSize.width}
                  max={maxCanvasSize.width}
                  value={canvasSize.width}
                  onChange={(event) => setCanvasWidth(Number(event.target.value))}
                  className="h-8 w-20 border border-[#9b9b9b] px-2"
                />
              </label>
              <label className="flex items-center gap-1">
                H
                <input
                  aria-label="Canvas height"
                  type="number"
                  min={minCanvasSize.height}
                  max={maxCanvasSize.height}
                  value={canvasSize.height}
                  onChange={(event) => setCanvasHeight(Number(event.target.value))}
                  className="h-8 w-20 border border-[#9b9b9b] px-2"
                />
              </label>
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                title="Undo"
                aria-label="Undo"
                onClick={undoStroke}
                className="flex h-10 w-10 items-center justify-center border border-[#9b9b9b] bg-[#eeeeee] shadow-[inset_1px_1px_0_#ffffff] hover:bg-white"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
              <button
                type="button"
                title="Clear"
                aria-label="Clear"
                onClick={() => setPaintActions([])}
                className="flex h-10 w-10 items-center justify-center border border-[#9b9b9b] bg-[#eeeeee] shadow-[inset_1px_1px_0_#ffffff] hover:bg-white"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                type="button"
                title="Save"
                aria-label="Save"
                onClick={() => {
                  void savePng();
                }}
                className="flex h-10 w-10 items-center justify-center border border-[#9b9b9b] bg-[#eeeeee] shadow-[inset_1px_1px_0_#ffffff] hover:bg-white"
              >
                <Save className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-auto bg-[#bfc3ca] p-5">
          <div className="relative inline-block min-w-[640px]">
            <svg
              ref={boardRef}
              viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
              className={cn(
                "bg-white shadow-[0_0_0_1px_#7f7f7f,6px_6px_0_rgba(0,0,0,0.18)]",
                tool === "select" ? "cursor-default" : "cursor-crosshair",
              )}
              style={{
                height: `${canvasSize.height}px`,
                width: `${canvasSize.width}px`,
              }}
              onPointerDown={startDrawing}
              onPointerMove={continueDrawing}
              onPointerUp={finishDrawing}
              onPointerCancel={finishDrawing}
              onPointerLeave={finishDrawing}
            >
              <rect x="0" y="0" width={canvasSize.width} height={canvasSize.height} fill={canvasFillColor} />
              {artwork.map((artworkItem) => (
                <image
                  key={artworkItem.href}
                  href={artworkItem.href}
                  x={artworkItem.x}
                  y={artworkItem.y}
                  width={artworkItem.width}
                  height={artworkItem.height}
                  preserveAspectRatio={artworkItem.preserveAspectRatio}
                />
              ))}
              {paintActions.map((action, index) =>
                action.type === "fill" ? (
                  <image
                    key={`fill-${index}`}
                    href={action.fill.href}
                    x="0"
                    y="0"
                    width={action.fill.width}
                    height={action.fill.height}
                  />
                ) : (
                  <path
                    key={`${action.stroke.tool}-${index}`}
                    d={buildPath(action.stroke.points)}
                    fill="none"
                    stroke={action.stroke.color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={action.stroke.size}
                  />
                ),
              )}
              {activeStroke ? (
                <path
                  d={buildPath(activeStroke.points)}
                  fill="none"
                  stroke={activeStroke.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={activeStroke.size}
                />
              ) : null}
              {!section ? (
                <g transform={`translate(${navButtonFrame.x} ${navButtonFrame.y}) scale(${navButtonFrame.scale})`}>
                  {truthNavLinks.map((link) =>
                    navButtonPaths[link.pathId] ? (
                      <path
                        key={link.path}
                        aria-label={link.label}
                        d={navButtonPaths[link.pathId]}
                        fill="transparent"
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          handleTruthNavClick(event, link.path);
                        }}
                        onPointerLeave={() => setIsHoveringClickableNav(false)}
                        onPointerMove={handleTruthNavPointerMove}
                        pointerEvents={tool === "select" ? "fill" : "none"}
                        stroke="transparent"
                        strokeWidth="18"
                        style={{ cursor: tool === "select" && isHoveringClickableNav ? "pointer" : "default" }}
                      />
                    ) : null,
                  )}
                </g>
              ) : null}
            </svg>
            <button
              type="button"
              aria-label="Resize canvas"
              title="Resize canvas"
              onPointerDown={startResizing}
              className="absolute bottom-[-13px] right-[-13px] h-7 w-7 cursor-nwse-resize border border-[#6f6f6f] bg-[#eeeeee] shadow-[inset_1px_1px_0_#ffffff]"
            >
              <span className="absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-[#606060]" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Truth;
