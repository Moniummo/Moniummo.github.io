import { AnimatePresence, motion } from "framer-motion";
import { type FocusEvent, useEffect, useRef, useState } from "react";
import PageLayout from "@/components/PageLayout";
import esonicBoxChart from "@/assets/ESONIC_Box_Chart.png";
import esonicVisualizer from "@/assets/ESONIC_visualizer.png";
import bicyclePicture from "@/assets/Bicycle_picture.png";
import gearMate from "@/assets/gear_mate.png";
import matlab2dGraph from "@/assets/matlab_2d_graph.png";
import matlabHeatGraph from "@/assets/matlab_heat_graph.png";
import matlabSurfPlotAnalysis from "@/assets/matlab_surf_plot_analysis.png";
import matlabSurfPlotModification from "@/assets/matlab_surf_plot_modification.png";
import matlabVesselIdentification from "@/assets/matlab_vesel_identification.png";
import aiProjectGpuUtilization from "@/assets/ai_project_gpu_utilization.png";
import discordJson from "@/assets/Discord JSON.png";
import coinSorterAssembly from "@/assets/coin_sorter_assembly.png";
import coinSorterExploded from "@/assets/coin_sorter_exploded.png";
import coinSorterIrl from "@/assets/coin_sorter_irl.png";

const motionEase = [0.22, 1, 0.36, 1] as const;
const closeDelayMs = 220;

interface ProjectDecision {
  title: string;
  detail: string;
}

interface ProjectPerformanceBlock {
  title: string;
  lines: string[];
}

interface ProjectVisual {
  src: string;
  alt: string;
  caption: string;
}

interface ProjectDetails {
  headerLabel: string;
  status: string;
  tagline: string;
  summary: string;
  designProblem: string[];
  architectureDecisions: ProjectDecision[];
  challengesTradeoffs: ProjectDecision[];
  performanceValidation: ProjectPerformanceBlock[];
  visuals: ProjectVisual[];
}

interface ProjectCard {
  title: string;
  note: string;
  previewImage?: string;
  details?: ProjectDetails;
}

const esonicDetails: ProjectDetails = {
  headerLabel: "Flagship Build",
  status: "Prototype Complete",
  tagline: "ESP32 | IMU | UWB | ESP-NOW | Python | VisPy",
  summary:
    "ESONIC is a distributed multi-rate motion telemetry and closed-loop feedback platform built to keep sensing, transport, visualization, and actuation in sync at low latency. The system captures 400 Hz accelerometer data, 100 Hz gyroscopic orientation, and 10 Hz UWB positional validation, then relays telemetry through an ESP-NOW gateway for host-side fusion and feedback control. The core engineering objective was deterministic throughput under asynchronous sensor rates while maintaining an end-to-end response near 10 milliseconds.",
  designProblem: [
    "Acquire 400 Hz accelerometer and 100 Hz gyroscopic orientation data in real time.",
    "Integrate 10 Hz UWB positional validation without disrupting higher-rate streams.",
    "Aggregate distributed telemetry wirelessly with predictable timing behavior.",
    "Run real-time visualization and audio mapping from centralized host processing.",
    "Deliver haptic and LED feedback in a closed-loop control pathway.",
  ],
  architectureDecisions: [
    {
      title: "ESP-NOW over WiFi/BLE",
      detail:
        "Reduced communication overhead and improved latency for small, high-frequency packets.",
    },
    {
      title: "Gateway Receiver ESP32",
      detail:
        "Separated wireless transport from host computation and enabled bidirectional control relay.",
    },
    {
      title: "Bitmask Packet Structure",
      detail:
        "Used compact field flags to minimize payload size and support asynchronous updates.",
    },
    {
      title: "Centralized Fusion in Python",
      detail:
        "Moved heavier fusion and rotation calculations to the host for faster iteration and stable embedded timing.",
    },
  ],
  challengesTradeoffs: [
    {
      title: "Multi-Rate Synchronization",
      detail:
        "Aligned asynchronous 400/100/10 Hz streams with bitmask-driven packet parsing and host-side time matching.",
    },
    {
      title: "Wireless Throughput Constraints",
      detail:
        "Controlled congestion by transmitting only active fields so telemetry remained stable.",
    },
    {
      title: "Latency vs Computation",
      detail:
        "Kept embedded loops lightweight by offloading quaternion conversion and fusion logic to Python.",
    },
    {
      title: "IMU Drift Accumulation",
      detail:
        "Applied low-pass filtering and periodic UWB correction to prevent long-term divergence.",
    },
    {
      title: "Scalability Planning",
      detail:
        "Designed packet and gateway logic to support future sensor fields without firmware redesign.",
    },
  ],
  performanceValidation: [
    {
      title: "Telemetry Stability",
      lines: [
        "Sustained 400 Hz accelerometer sampling without packet flooding.",
        "Maintained stable 100 Hz orientation updates under continuous motion.",
        "Integrated 10 Hz UWB validation while preserving high-rate stream continuity.",
      ],
    },
    {
      title: "Latency Characterization",
      lines: [
        "Targeted approximately 10 ms end-to-end closed-loop response.",
        "Kept relay overhead at the gateway minimal for responsive feedback.",
        "Optimized host processing for real-time rendering and control output.",
      ],
    },
    {
      title: "Packet Efficiency and Robustness",
      lines: [
        "Bitmask payloads reduced redundant transmission and scaled with active fields.",
        "Drift correction preserved long-run stability during dynamic movement sessions.",
      ],
    },
  ],
  visuals: [
    {
      src: esonicVisualizer,
      alt: "ESONIC real-time visualizer interface",
      caption: "Real-time ESONIC visualizer for telemetry and feedback monitoring.",
    },
    {
      src: esonicBoxChart,
      alt: "ESONIC architecture and data flow chart",
      caption: "System-level transport and control flow used in the ESONIC pipeline.",
    },
  ],
};

const bikeDetails: ProjectDetails = {
  headerLabel: "Mechanical Systems",
  status: "Simulation Validated",
  tagline: "SolidWorks | Gear Systems | Motion Simulation | Tolerance Modeling",
  summary:
    "This project focused on designing and simulating an articulated bicycle drivetrain to study how rotational input propagates through coupled gear elements under realistic mechanical constraints. The system was built in SolidWorks with explicit mate logic for torque transfer, articulation limits, and rotational coupling. The engineering objective was to capture accurate kinematic behavior while exploring torque-speed tradeoffs across gear ratio configurations.",
  designProblem: [
    "Transmit crankset rotational input through the drivetrain to rear wheel output.",
    "Model how gear ratio selection shifts torque amplification versus rotational speed.",
    "Define articulation and rotational limits that preserve realistic motion behavior.",
    "Validate drivetrain dynamics in simulation without over-constraining assembly freedom.",
    "Refine alignment and tolerance references to avoid non-physical simulation artifacts.",
  ],
  architectureDecisions: [
    {
      title: "Gear Mate Implementation",
      detail:
        "Used gear mates to enforce proportional rotational coupling and realistic torque transfer between drivetrain components.",
    },
    {
      title: "Gear Ratio Evaluation",
      detail:
        "Tested multiple ratio configurations to quantify expected torque-speed behavior under consistent input conditions.",
    },
    {
      title: "Constraint Definition",
      detail:
        "Applied rotational limits and articulation constraints to preserve realistic motion without locking the system.",
    },
    {
      title: "Tolerance Refinement",
      detail:
        "Iteratively adjusted mate references and alignment to stabilize simulation and eliminate non-physical movement.",
    },
  ],
  challengesTradeoffs: [
    {
      title: "Torque vs Speed Tradeoff",
      detail:
        "Lower ratios increased torque amplification while reducing output speed; higher ratios produced the opposite behavior.",
    },
    {
      title: "Over-Constrained Assemblies",
      detail:
        "Early mate stacks created instability, requiring iterative removal and redefinition of redundant constraints.",
    },
    {
      title: "Alignment Sensitivity",
      detail:
        "Small misalignments introduced unrealistic motion, demanding tight rotational reference control.",
    },
    {
      title: "Stability vs Complexity",
      detail:
        "Balanced assembly detail against simulation performance by simplifying non-critical geometry while preserving drivetrain function.",
    },
  ],
  performanceValidation: [
    {
      title: "Kinematic Proportionality",
      lines: [
        "Verified angular displacement from crank input to rear wheel output matched defined gear constraints.",
        "Maintained expected rotational coupling across sustained motion tests.",
      ],
    },
    {
      title: "Ratio Behavior Validation",
      lines: [
        "Observed expected torque-speed tradeoffs across multiple tested drivetrain ratios.",
        "Compared configurations under identical input profiles for consistent relative behavior.",
      ],
    },
    {
      title: "Simulation Robustness",
      lines: [
        "Resolved redundant mates to preserve valid degrees of freedom and stable solver behavior.",
        "Eliminated constraint conflicts and non-physical motion through iterative tolerance alignment refinement.",
      ],
    },
  ],
  visuals: [
    {
      src: bicyclePicture,
      alt: "Articulated bicycle drivetrain assembly model",
      caption: "Full drivetrain assembly used for articulation, mate, and motion-validation studies.",
    },
    {
      src: gearMate,
      alt: "Gear mate and rotational coupling view for drivetrain simulation",
      caption: "Gear mate configuration showing rotational coupling and ratio-driven motion behavior.",
    },
  ],
};

const matlabDetails: ProjectDetails = {
  headerLabel: "Computational Modeling",
  status: "Model Complete",
  tagline: "Energy Balance | Experimental Modeling | System Efficiency Analysis",
  summary:
    "This MATLAB project developed a quantitative thermal modeling framework to estimate incident energy, heat retention behavior, and annual energy cost required to maintain indoor comfort under different insulation and material configurations. The model links experimental probe data with scaled environmental inputs, then applies transient energy-balance logic to evaluate heating and cooling demand. The core goal was to understand how thermal properties and system assumptions shape long-term energy efficiency decisions.",
  designProblem: [
    "Estimate steady-state and transient heating requirements from measured temperature behavior.",
    "Evaluate how thermal mass changes short-term stability and long-term energy demand.",
    "Compare multiple system configurations under matched environmental conditions.",
    "Predict long-duration and annual energy requirements from limited experimental windows.",
    "Translate modeled thermal demand into interpretable annual operating cost.",
  ],
  architectureDecisions: [
    {
      title: "Incident Energy Pipeline",
      detail:
        "Converted measured illumination values to W/m^2, computed absorbed power, and integrated over time to estimate total incident energy.",
    },
    {
      title: "Annual Extrapolation Logic",
      detail:
        "Scaled experimental measurements using NOAA solar-radiation trends and resampled climate data to align with probe resolution.",
    },
    {
      title: "Transient Thermal Balance",
      detail:
        "Applied lumped-capacitance style energy-balance equations using specific heat and temperature gradients to estimate load.",
    },
    {
      title: "HVAC Cost Mapping",
      detail:
        "Mapped modeled thermal demand through a COP=3 efficiency assumption and $0.15/kWh pricing to estimate annual cost.",
    },
  ],
  challengesTradeoffs: [
    {
      title: "Multi-Resolution Data Fusion",
      detail:
        "Handled asynchronous data streams with interpolation and smoothing to preserve meaningful trends across different sample rates.",
    },
    {
      title: "Transient vs Steady Behavior",
      detail:
        "Separated short-term fluctuation effects from longer equilibrium behavior to avoid biased long-run demand estimates.",
    },
    {
      title: "Thermal Mass Tradeoff",
      detail:
        "Observed that added water mass stabilized temperature trajectories but increased sustained energy input due to retention effects.",
    },
    {
      title: "Long-Term Projection Uncertainty",
      detail:
        "Annual extrapolation required explicit assumptions about seasonal consistency and boundary-condition repeatability.",
    },
  ],
  performanceValidation: [
    {
      title: "Efficiency Ranking Insight",
      lines: [
        "Identified insulation quality as the dominant driver in lowering projected annual energy cost.",
        "Quantified how surface transparency shifts incident-energy absorption behavior.",
      ],
    },
    {
      title: "Dynamic Thermal Behavior",
      lines: [
        "Demonstrated improved thermal stability with higher mass, alongside increased energy demand over time.",
        "Estimated annual maintenance cost near $36.50/year for the baseline modeled configuration.",
      ],
    },
    {
      title: "Measurement Consistency",
      lines: [
        "Compared probe-derived trends against manually recorded surface temperatures for sanity checks.",
        "Confirmed model outputs tracked expected relative behavior across tested configurations.",
      ],
    },
  ],
  visuals: [
    {
      src: matlabHeatGraph,
      alt: "MATLAB thermal distribution heatmap output",
      caption: "Heat-distribution visualization used to compare thermal behavior across configurations.",
    },
    {
      src: matlab2dGraph,
      alt: "MATLAB 2D energy and temperature trend analysis plot",
      caption: "Time-domain model outputs used for incident energy and thermal-demand analysis.",
    },
  ],
};

const frostigImagingDetails: ProjectDetails = {
  headerLabel: "Frostig Lab Work",
  status: "Pipeline Validated",
  tagline: "MATLAB | Image Segmentation | Signal Processing | Interactive Data Analysis",
  summary:
    "This project developed a quantitative neurovascular imaging pipeline in MATLAB to transform high-noise cortical imaging data into stable vessel dilation metrics over time. The workflow combined vessel segmentation, user-guided segment selection, state-aligned temporal analysis, and surface artifact correction to preserve analytical integrity while improving interpretability. The primary engineering objective was to balance structural fidelity, noise suppression, and computational practicality in a reproducible imaging pipeline.",
  designProblem: [
    "Robustly segment vessel structures from non-uniform grayscale intensity fields.",
    "Extract centerline-based radius metrics from irregular vascular geometries.",
    "Align multi-frame sequences to pre-stimulus, stimulus, and post-stimulus states.",
    "Preserve quantitative signal while correcting non-physical surf-plot artifacts.",
    "Support user-guided vessel interrogation without sacrificing reproducibility.",
  ],
  architectureDecisions: [
    {
      title: "Vessel Segmentation and Identification",
      detail:
        "Used thresholding with morphological filtering and ROI constraints to isolate vascular masks while limiting false detections.",
    },
    {
      title: "Interactive Vessel Selection",
      detail:
        "Implemented user-guided vessel targeting and segment-specific extraction for controlled yet repeatable analysis.",
    },
    {
      title: "Quantitative Dilation Analysis",
      detail:
        "Computed state-wise terminal-frame radius values and percent dilation relative to baseline across grouped conditions.",
    },
    {
      title: "Selective Surface Smoothing",
      detail:
        "Applied threshold-based surf-plot corrections to visualization layers only, preserving raw analytical measurements.",
    },
  ],
  challengesTradeoffs: [
    {
      title: "Noise vs Structural Accuracy",
      detail:
        "Aggressive smoothing removed artifacts but risked distorting vessel boundary geometry and radius accuracy.",
    },
    {
      title: "Mask Sensitivity",
      detail:
        "Segmentation continuity depended strongly on threshold settings across heterogeneous intensity regions.",
    },
    {
      title: "User Interaction vs Automation",
      detail:
        "Balanced manual flexibility for vessel targeting with standardized downstream computation flow.",
    },
    {
      title: "Artifact Propagation in 3D Surf Plots",
      detail:
        "Needed to suppress non-physical rendering patterns without modifying underlying quantitative vessel data.",
    },
  ],
  performanceValidation: [
    {
      title: "Segmentation Stability",
      lines: [
        "Maintained stable vessel segmentation across multiple sessions and experimental contexts.",
        "Enabled repeatable segment-specific dilation analysis across independent datasets.",
      ],
    },
    {
      title: "Temporal and Physiological Consistency",
      lines: [
        "Confirmed extracted dilation profiles aligned with stimulus onset and recovery phases.",
        "Preserved expected vessel-response trends across grouped experimental conditions.",
      ],
    },
    {
      title: "Signal Integrity Under Correction",
      lines: [
        "Reduced surf-plot artifacts without changing underlying quantitative measurements.",
        "Validated that percent-dilation metrics remained invariant under smoothing adjustments.",
      ],
    },
  ],
  visuals: [
    {
      src: matlabVesselIdentification,
      alt: "Cortical vessel identification and segmentation mask output",
      caption: "Vessel identification stage used to isolate analyzable vascular structures.",
    },
    {
      src: matlabSurfPlotAnalysis,
      alt: "Neurovascular surface analysis visualization",
      caption: "Surface-based analysis view of neurovascular signal structure before correction.",
    },
    {
      src: matlabSurfPlotModification,
      alt: "Corrected neurovascular surface plot after selective smoothing",
      caption: "Post-correction surf view showing reduced visualization artifacts with preserved signal integrity.",
    },
  ],
};

const nickAiDetails: ProjectDetails = {
  headerLabel: "Applied AI Systems",
  status: "Locally Deployed",
  tagline: "HuggingFace | QLoRA | LLaMA 8B | PEFT | WSL Ubuntu | Discord API | Web Deployment",
  summary:
    "NickAI is a full training-to-deployment conversational LLM pipeline built around parameter-efficient fine-tuning and local inference. The system takes structured dialogue logs, converts them into supervised conversational pairs, fine-tunes a LLaMA 8B base model with QLoRA, and serves responses through both a private web client and a Discord bot integration. The primary engineering objective was to maintain high stylistic coherence while staying within consumer-GPU memory limits and preserving deployment flexibility.",
  designProblem: [
    "Learn consistent conversational style from raw exported dialogue logs.",
    "Support low-latency local inference on consumer RTX-class hardware.",
    "Avoid cloud moderation and hosting constraints that limit experimental control.",
    "Maintain a modular stack across data, training, serving, and interface layers.",
    "Deploy one model backend that supports both web and messaging endpoints.",
  ],
  architectureDecisions: [
    {
      title: "Data Engineering Pipeline",
      detail:
        "Parsed exported Discord JSON logs into prompt/completion pairs, filtered noise and metadata, and generated train/validation splits in HuggingFace-ready format.",
    },
    {
      title: "QLoRA Fine-Tuning Strategy",
      detail:
        "Used 8-bit loading with bitsandbytes and LoRA adapters on attention projection layers to reduce memory footprint while preserving adaptation quality.",
    },
    {
      title: "Local Hosting Migration",
      detail:
        "Moved from cloud attempts to local deployment for full preprocessing control, adapter experimentation, and private inference behavior.",
    },
    {
      title: "Service Integration Layer",
      detail:
        "Deployed FastAPI inference endpoints with runtime adapter loading and asynchronous Discord bot routing for real-time external interaction.",
    },
  ],
  challengesTradeoffs: [
    {
      title: "Memory vs Performance",
      detail:
        "Consumer-GPU limits required careful quantization, adapter rank, and context-length choices to keep inference stable.",
    },
    {
      title: "Cloud vs Local Constraints",
      detail:
        "Cloud hosting reduced operational control and introduced moderation bottlenecks; local hosting improved flexibility at the cost of self-managed infrastructure.",
    },
    {
      title: "Dataset Structure Quality",
      detail:
        "Unstructured logs needed robust cleanup and formatting to produce consistent supervised dialogue pairs for fine-tuning.",
    },
    {
      title: "Context Management",
      detail:
        "Implemented token-length filtering and chunking to avoid context overflow and unstable training behavior.",
    },
    {
      title: "System Modularity",
      detail:
        "Kept training, inference, and client integrations decoupled to support future upgrades without full-stack rewrites.",
    },
  ],
  performanceValidation: [
    {
      title: "Inference Stability",
      lines: [
        "Maintained stable local 8-bit inference on RTX 4080-class hardware.",
        "Observed VRAM use in approximately the 6-8 GB range during active model operation.",
      ],
    },
    {
      title: "Behavior and Integration",
      lines: [
        "Validated stylistic adaptation while avoiding obvious overfitting artifacts in live prompts.",
        "Confirmed consistent response flow through both the private web UI and Discord bot endpoints.",
      ],
    },
    {
      title: "Scalability Roadmap",
      lines: [
        "Prepared migration path toward 4-bit QLoRA and dynamic context management for lower memory overhead.",
        "Planned containerized deployment and formal response-quality metrics for broader portability and evaluation.",
      ],
    },
  ],
  visuals: [
    {
      src: aiProjectGpuUtilization,
      alt: "NickAI local LLaMA inference GPU utilization view",
      caption: "Local inference performance profile during NickAI operation on consumer GPU hardware.",
    },
    {
      src: discordJson,
      alt: "NickAI Discord JSON preprocessing and structured dataset workflow view",
      caption: "Discord log preprocessing stage used to build structured prompt/completion training data.",
    },
  ],
};

const coinSorterDetails: ProjectDetails = {
  headerLabel: "Mechanical Product Design",
  status: "Fabricated and Tested",
  tagline: "CAD | Tolerance Design | Iterative Prototyping | 3D Printing | Mechanical Flow Control",
  summary:
    "This project designed and fabricated an autonomous gravity-driven coin sorting system that separates mixed U.S. coins by diameter without electronics. The design translated subtle dimensional differences into reliable mechanical filtering by combining slot geometry, tolerance-aware CAD, and iterative 3D-printed prototyping. The core engineering objective was stable, repeatable one-at-a-time flow while minimizing jams, overlap, and misclassification under real-world manufacturing variation.",
  designProblem: [
    "Sort mixed coins by diameter using purely mechanical geometry.",
    "Prevent jams, overlap stacking, and premature slot drops.",
    "Maintain consistent gravity-fed flow with minimal user intervention.",
    "Account for real print variability, shrinkage, and tolerance stack-up.",
    "Keep the assembly compact, modular, and manufacturable via FDM printing.",
  ],
  architectureDecisions: [
    {
      title: "Geometric Sorting Strategy",
      detail:
        "Guided individual coins across progressively sized drop slots calibrated against nominal U.S. coin diameters with engineered clearance margins.",
    },
    {
      title: "Tolerance Calibration Workflow",
      detail:
        "Measured real coin diameters, added controlled offsets in CAD, and iterated slot widths across print revisions to balance fit and flow.",
    },
    {
      title: "Modular Plate Design",
      detail:
        "Separated denomination channels into adjustable sliding plates for rapid tuning, maintenance, and future redesign.",
    },
    {
      title: "Parametric CAD and Print Iteration",
      detail:
        "Built the assembly with dimension-driven constraints to quickly modify geometry between prototypes and validate under physical testing.",
    },
  ],
  challengesTradeoffs: [
    {
      title: "Print Accuracy vs Fit",
      detail:
        "Narrower slots improved discrimination but increased jamming sensitivity under FDM dimensional variance.",
    },
    {
      title: "Surface Friction Effects",
      detail:
        "Layer lines and print texture altered coin slip behavior and required edge and channel refinement.",
    },
    {
      title: "Manufacturability Constraints",
      detail:
        "Geometry was tuned around practical overhang, bridging, and tolerance limits of desktop FDM printing.",
    },
    {
      title: "Scalability Choice",
      detail:
        "Optimized for controlled single-coin feed rather than bulk handling to prioritize robust geometric sorting performance.",
    },
  ],
  performanceValidation: [
    {
      title: "Sorting Accuracy",
      lines: [
        "Successfully routed coins into correct denomination bins under repeated manual-feed trials.",
        "Validated slot dimensions against physical measurements and functional sorting outcomes.",
      ],
    },
    {
      title: "Flow Reliability",
      lines: [
        "Achieved repeatable one-at-a-time gravity flow with reduced sticking after iterative geometry updates.",
        "Improved entrance and alignment features to reduce misclassification between adjacent slot sizes.",
      ],
    },
    {
      title: "Prototype Convergence",
      lines: [
        "Multiple fabrication revisions reduced jamming and improved consistency across denominations.",
        "Final mechanical behavior remained stable under sustained test sequences.",
      ],
    },
  ],
  visuals: [
    {
      src: coinSorterAssembly,
      alt: "Coin sorter CAD assembly view",
      caption: "Primary CAD assembly showing channel geometry, slot progression, and plate structure.",
    },
    {
      src: coinSorterExploded,
      alt: "Coin sorter exploded view and component breakdown",
      caption: "Exploded view used to evaluate modular part relationships and manufacturability details.",
    },
    {
      src: coinSorterIrl,
      alt: "Physical 3D-printed coin sorter prototype",
      caption: "Fabricated prototype used for real-world jam testing and denomination sorting validation.",
    },
  ],
};

const projects: ProjectCard[] = [
  {
    title: "ESONIC",
    note: "Distributed motion telemetry and closed-loop feedback with multi-rate sensing.",
    previewImage: esonicVisualizer,
    details: esonicDetails,
  },
  {
    title: "Bike Drivetrain",
    note: "Articulated drivetrain simulation with gear-ratio and constraint tradeoff analysis.",
    previewImage: bicyclePicture,
    details: bikeDetails,
  },
  {
    title: "Thermal Energy Modeling",
    note: "MATLAB thermal-energy framework for efficiency analysis, extrapolation, and cost prediction.",
    previewImage: matlabHeatGraph,
    details: matlabDetails,
  },
  {
    title: "Neurovascular Imaging Pipeline",
    note: "MATLAB vessel-segmentation and dilation-analysis pipeline with artifact-aware visualization correction.",
    previewImage: matlabVesselIdentification,
    details: frostigImagingDetails,
  },
  {
    title: "NickAI Conversational LLM",
    note: "QLoRA fine-tuned LLaMA pipeline with local FastAPI serving, private web UI, and Discord integration.",
    previewImage: aiProjectGpuUtilization,
    details: nickAiDetails,
  },
  {
    title: "Autonomous Coin Sorter",
    note: "Gravity-driven mechanical sorter with tolerance-calibrated geometry and iterative 3D-printed validation.",
    previewImage: coinSorterIrl,
    details: coinSorterDetails,
  },
  {
    title: "Project Seven",
    note: "Placeholder layout for the seventh project page.",
  },
  {
    title: "Project Eight",
    note: "Placeholder layout for the eighth project page.",
  },
];

interface OrbitMetrics {
  buttonSize: number;
  cardHeight: number;
  cardWidth: number;
  imageHeight: number;
  radius: number;
  stageSize: number;
}

const getOrbitMetrics = (): OrbitMetrics => {
  if (typeof window === "undefined") {
    return {
      buttonSize: 204,
      cardHeight: 126,
      cardWidth: 164,
      imageHeight: 72,
      radius: 230,
      stageSize: 660,
    };
  }

  if (window.innerWidth >= 1440) {
    return {
      buttonSize: 228,
      cardHeight: 138,
      cardWidth: 178,
      imageHeight: 78,
      radius: 300,
      stageSize: 760,
    };
  }

  if (window.innerWidth >= 1100) {
    return {
      buttonSize: 208,
      cardHeight: 126,
      cardWidth: 164,
      imageHeight: 72,
      radius: 230,
      stageSize: 660,
    };
  }

  if (window.innerWidth >= 768) {
    return {
      buttonSize: 176,
      cardHeight: 110,
      cardWidth: 138,
      imageHeight: 58,
      radius: 186,
      stageSize: 540,
    };
  }

  return {
    buttonSize: 138,
    cardHeight: 92,
    cardWidth: 112,
    imageHeight: 42,
    radius: 132,
    stageSize: 380,
  };
};

const Projects = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isFloatingHovered, setIsFloatingHovered] = useState(false);
  const [isFloatingPinned, setIsFloatingPinned] = useState(false);
  const [hoveredOrbitIndex, setHoveredOrbitIndex] = useState<number | null>(null);
  const [hoveredFloatingIndex, setHoveredFloatingIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<OrbitMetrics>(getOrbitMetrics);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedSectionRef = useRef<HTMLDivElement | null>(null);
  const selectorAnchorRef = useRef<HTMLDivElement | null>(null);
  const [showFloatingSelector, setShowFloatingSelector] = useState(false);
  const [activeVisual, setActiveVisual] = useState<ProjectVisual | null>(null);

  const isExpanded = isHovered || isPinned;
  const isFloatingExpanded = showFloatingSelector && (isFloatingHovered || isFloatingPinned);
  const selectedProject = selectedIndex === null ? null : projects[selectedIndex];
  const selectedDetails = selectedProject?.details;

  useEffect(() => {
    const handleResize = () => {
      setMetrics(getOrbitMetrics());
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedProject || !selectedSectionRef.current) {
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      selectedSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(raf);
  }, [selectedProject]);

  useEffect(() => {
    setActiveVisual(null);
  }, [selectedIndex]);

  useEffect(() => {
    if (!activeVisual) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveVisual(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activeVisual]);

  useEffect(() => {
    if (!selectorAnchorRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingSelector(!entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(selectorAnchorRef.current);

    return () => observer.disconnect();
  }, []);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openOrbit = () => {
    clearCloseTimer();
    setIsHovered(true);
  };

  const queueCloseOrbit = () => {
    clearCloseTimer();
    setHoveredOrbitIndex(null);

    if (isPinned) {
      return;
    }

    closeTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, closeDelayMs);
  };

  const toggleOrbit = () => {
    clearCloseTimer();
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    setIsHovered(nextPinned);
  };

  const handleOrbitRegionBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (isPinned) {
      return;
    }

    const nextFocused = event.relatedTarget as Node | null;
    if (nextFocused && event.currentTarget.contains(nextFocused)) {
      return;
    }

    queueCloseOrbit();
  };

  const openFloatingOrbit = () => {
    setIsFloatingHovered(true);
  };

  const queueCloseFloatingOrbit = () => {
    setHoveredFloatingIndex(null);

    if (isFloatingPinned) {
      return;
    }

    setIsFloatingHovered(false);
  };

  const toggleFloatingOrbit = () => {
    const nextPinned = !isFloatingPinned;
    setIsFloatingPinned(nextPinned);
    setIsFloatingHovered(nextPinned);
  };

  const handleFloatingRegionBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (isFloatingPinned) {
      return;
    }

    const nextFocused = event.relatedTarget as Node | null;
    if (nextFocused && event.currentTarget.contains(nextFocused)) {
      return;
    }

    queueCloseFloatingOrbit();
  };

  const floatingMetrics = {
    buttonSize: 68,
    cardHeight: 62,
    cardWidth: 86,
    stackGap: 12,
    stackOffset: 10,
  };
  const floatingBoundsWidth = Math.max(floatingMetrics.cardWidth, floatingMetrics.buttonSize);
  const floatingBoundsHeight =
    projects.length * (floatingMetrics.cardHeight + floatingMetrics.stackGap) +
    floatingMetrics.buttonSize;
  const floatingInteractiveHeight = isFloatingExpanded
    ? floatingBoundsHeight
    : floatingMetrics.buttonSize;
  const hoveredOrbitPosition =
    hoveredOrbitIndex === null
      ? null
      : {
          x:
            Math.cos((Math.PI * 2 * hoveredOrbitIndex) / projects.length - Math.PI / 2) *
            metrics.radius,
          y:
            Math.sin((Math.PI * 2 * hoveredOrbitIndex) / projects.length - Math.PI / 2) *
            metrics.radius,
        };

  return (
    <PageLayout title="Projects" mainClassName="max-w-none px-0 sm:px-0">
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[120rem]">
          {/* Enforce a strict 1/3 + 2/3 split on wider viewports so intro and selector stay inline. */}
          <section className="pb-8 pt-2">
            <div className="rounded-[3.8rem] border border-white/32 bg-white/32 p-4 shadow-[0_28px_92px_rgba(173,133,37,0.12)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_34px_110px_rgba(8,5,18,0.5)] sm:rounded-[4.6rem] sm:p-6 lg:p-8">
              <div
                className="grid min-h-[calc(100vh-11rem)] gap-6 lg:gap-8 xl:gap-10"
                style={
                  metrics.stageSize > 380
                    ? { alignItems: "center", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)" }
                    : undefined
                }
              >
                <div ref={selectorAnchorRef} className="flex flex-col justify-center">
                  <div className="rounded-[3.2rem] border border-white/30 bg-white/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.26)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:rounded-[3.8rem] sm:p-8">
                    <p className="font-display text-[10px] uppercase tracking-[0.34em] text-primary/80">
                      Project Page
                    </p>
                    <h1 className="mt-4 text-3xl text-foreground sm:text-4xl">
                      Explore the work.
                    </h1>
                    <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Hover over the selector to open the project orbit, then choose a tile to
                      open its page below.
                    </p>
                  </div>
                </div>

                <div
                  className="flex min-w-0 items-center justify-center rounded-[3.2rem] border border-white/28 bg-white/22 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.03] sm:rounded-[3.8rem] sm:p-4 lg:min-h-[42rem] xl:min-h-[46rem]"
                  style={
                    metrics.stageSize > 380
                      ? { minHeight: `${metrics.stageSize + 64}px` }
                      : undefined
                  }
                >
                  <div
                    className="pointer-events-auto relative"
                    onMouseLeave={queueCloseOrbit}
                    onFocusCapture={openOrbit}
                    onBlurCapture={handleOrbitRegionBlur}
                    style={{
                      height: metrics.stageSize,
                      width: metrics.stageSize,
                    }}
                  >
                    {projects.map((project, index) => {
                      const angle = (Math.PI * 2 * index) / projects.length - Math.PI / 2;
                      const x = Math.cos(angle) * metrics.radius;
                      const y = Math.sin(angle) * metrics.radius;
                      let pushedX = x;
                      let pushedY = y;
                      let popupScale = 1;

                      if (hoveredOrbitPosition) {
                        if (hoveredOrbitIndex === index) {
                          popupScale = 1.24;
                        } else {
                          const dx = x - hoveredOrbitPosition.x;
                          const dy = y - hoveredOrbitPosition.y;
                          const distance = Math.hypot(dx, dy) || 1;
                          const influence = Math.max(0, 1 - distance / (metrics.radius * 1.45));
                          const pushDistance = influence * 34;
                          pushedX += (dx / distance) * pushDistance;
                          pushedY += (dy / distance) * pushDistance;
                          popupScale = 1 - influence * 0.08;
                        }
                      }

                      return (
                        <div
                          key={project.title}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                          <motion.button
                            type="button"
                            initial={false}
                            animate={
                              isExpanded
                                ? {
                                    opacity: 1,
                                    scale: popupScale,
                                    x: pushedX,
                                    y: pushedY,
                                    filter: "blur(0px)",
                                  }
                                : {
                                    opacity: 0,
                                    scale: 0.7,
                                    x: 0,
                                    y: 0,
                                    filter: "blur(14px)",
                                  }
                            }
                            transition={{
                              duration: 0.6,
                              delay: isExpanded ? index * 0.035 : 0,
                              ease: motionEase,
                            }}
                            style={{
                              height: metrics.cardHeight,
                              width: metrics.cardWidth,
                            }}
                            onMouseEnter={() => {
                              openOrbit();
                              setHoveredOrbitIndex(index);
                            }}
                            onMouseLeave={() => {
                              setHoveredOrbitIndex((current) =>
                                current === index ? null : current
                              );
                            }}
                            onFocus={openOrbit}
                            onClick={() => {
                              clearCloseTimer();
                              setSelectedIndex(index);
                              setIsPinned(true);
                              setIsHovered(true);
                            }}
                            className="pointer-events-auto relative overflow-hidden rounded-[2.2rem] border border-white/22 bg-white/34 text-left shadow-[0_26px_72px_rgba(173,133,37,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_24px_66px_rgba(8,5,18,0.5)] sm:rounded-[2.5rem]"
                          >
                            <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-90" />
                            <div className="absolute inset-0 overflow-hidden">
                              {project.previewImage ? (
                                <img
                                  src={project.previewImage}
                                  alt={`${project.title} thumbnail`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-white/62 via-white/20 to-white/6 dark:from-white/[0.14] dark:via-white/[0.05] dark:to-transparent" />
                              )}
                              <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/45 dark:from-black/8 dark:to-black/58" />
                            </div>
                            <div className="pointer-events-none absolute inset-x-2 bottom-2 flex justify-center">
                              <p className="max-w-full rounded-[1rem] border border-white/24 bg-white/34 px-3 py-1.5 text-center font-display text-[9px] leading-tight uppercase tracking-[0.1em] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.13] dark:text-white">
                                {project.title}
                              </p>
                            </div>
                          </motion.button>
                        </div>
                      );
                    })}

                    {/* The selector stays centered in the right-hand stage and only changes scale. */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <motion.button
                        type="button"
                        aria-label="Project selector"
                        onMouseEnter={openOrbit}
                        onFocus={openOrbit}
                        onClick={toggleOrbit}
                        animate={
                          isExpanded
                            ? {
                                scale: 1,
                                boxShadow: "0px 28px 110px rgba(173,133,37,0.22)",
                              }
                            : {
                                scale: 0.9,
                                boxShadow: "0px 24px 80px rgba(173,133,37,0.12)",
                              }
                        }
                        transition={{ duration: 0.45, ease: motionEase }}
                        style={{
                          height: metrics.buttonSize,
                          width: metrics.buttonSize,
                        }}
                        className="pointer-events-auto relative overflow-hidden rounded-full border border-white/24 bg-white/18 backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.06]"
                      >
                        <motion.span
                          aria-hidden="true"
                          animate={
                            isExpanded
                              ? { opacity: 0.95, scale: 1.08 }
                              : { opacity: 0.6, scale: 1 }
                          }
                          transition={{ duration: 0.45, ease: motionEase }}
                          className="pointer-events-none absolute -inset-7 rounded-full bg-primary/18 blur-3xl dark:bg-primary/20"
                        />

                        <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.72),transparent_32%),radial-gradient(circle_at_72%_78%,rgba(255,255,255,0.08),transparent_42%)]" />
                        <span className="pointer-events-none absolute inset-x-[18%] top-[10%] h-px bg-gradient-to-r from-transparent via-white/90 to-transparent opacity-95" />
                        <span className="pointer-events-none absolute inset-[8%] rounded-full border border-white/16 bg-white/[0.03] dark:border-white/10 dark:bg-white/[0.02]" />

                        <motion.span
                          aria-hidden="true"
                          animate={
                            isExpanded ? { rotate: 360, scale: 1.02 } : { rotate: 0, scale: 1 }
                          }
                          transition={
                            isExpanded
                              ? { duration: 6.6, ease: "linear", repeat: Infinity }
                              : { duration: 0.6, ease: motionEase }
                          }
                          className="pointer-events-none absolute inset-[22%] rounded-full"
                        >
                          <span className="absolute inset-[8%] rounded-full border border-white/18 bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.18),transparent_56%)] dark:border-white/10" />
                          <span className="absolute left-1/2 top-[4%] h-[22%] w-[28%] -translate-x-1/2 rounded-full border border-white/18 bg-gradient-to-br from-white/60 via-white/20 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:from-white/[0.14] dark:via-white/[0.05] dark:to-transparent" />
                          <span className="absolute bottom-[14%] left-[9%] h-[18%] w-[30%] rotate-[28deg] rounded-full border border-white/16 bg-gradient-to-br from-white/42 via-white/14 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:from-white/[0.11] dark:via-white/[0.04] dark:to-transparent" />
                          <span className="absolute bottom-[14%] right-[9%] h-[18%] w-[30%] -rotate-[28deg] rounded-full border border-white/16 bg-gradient-to-br from-white/42 via-white/14 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:from-white/[0.11] dark:via-white/[0.04] dark:to-transparent" />
                        </motion.span>

                        <span className="pointer-events-none absolute inset-[30%] rounded-full border border-primary/16 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_68%)] dark:border-primary/22 dark:bg-[radial-gradient(circle_at_center,rgba(167,129,255,0.12),transparent_68%)]" />

                        <motion.span
                          aria-hidden="true"
                          animate={isExpanded ? { rotate: 360 } : { rotate: 0 }}
                          transition={
                            isExpanded
                              ? { duration: 2.8, ease: "linear", repeat: Infinity }
                              : { duration: 0.5, ease: motionEase }
                          }
                          className="pointer-events-none absolute inset-[19%] rounded-full border border-primary/22"
                        >
                          <span className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/90 shadow-[0_0_26px_rgba(173,133,37,0.45)] sm:h-4 sm:w-4 dark:bg-primary/85 dark:shadow-[0_0_24px_rgba(155,120,255,0.34)]" />
                        </motion.span>

                        <motion.span
                          aria-hidden="true"
                          animate={isExpanded ? { rotate: -360 } : { rotate: 0 }}
                          transition={
                            isExpanded
                              ? { duration: 3.8, ease: "linear", repeat: Infinity }
                              : { duration: 0.55, ease: motionEase }
                          }
                          className="pointer-events-none absolute inset-[29%] rounded-full border border-dashed border-white/26 dark:border-primary/30"
                        />

                        <motion.span
                          aria-hidden="true"
                          animate={
                            isExpanded
                              ? {
                                  scale: [1, 1.08, 1],
                                  opacity: [0.52, 0.78, 0.52],
                                }
                              : {
                                  scale: 1,
                                  opacity: 0.58,
                                }
                          }
                          transition={
                            isExpanded
                              ? { duration: 1.8, ease: "easeInOut", repeat: Infinity }
                              : { duration: 0.45, ease: motionEase }
                          }
                          className="pointer-events-none absolute inset-[37%] rounded-full border border-white/18 bg-white/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/10 dark:bg-white/[0.05]"
                        />

                        <span className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
                          <span className="h-4 w-4 rounded-full bg-white/82 shadow-[0_0_28px_rgba(255,255,255,0.48)] dark:bg-primary/82 dark:shadow-[0_0_28px_rgba(155,120,255,0.34)] sm:h-5 sm:w-5" />
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <AnimatePresence>
            {showFloatingSelector ? (
              <motion.div
                key="floating-selector"
                initial={{ opacity: 0, y: 12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.92 }}
                transition={{ duration: 0.35, ease: motionEase }}
                className="pointer-events-none fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6"
                style={{
                  height: floatingBoundsHeight,
                  width: floatingBoundsWidth,
                }}
              >
                <div
                  className="pointer-events-auto absolute bottom-0 right-0"
                  style={{
                    height: floatingInteractiveHeight,
                    width: floatingBoundsWidth,
                  }}
                  onMouseLeave={queueCloseFloatingOrbit}
                  onFocusCapture={openFloatingOrbit}
                  onBlurCapture={handleFloatingRegionBlur}
                >
                  <div className="pointer-events-none absolute bottom-0 right-0">
                    {projects.map((project, index) => {
                      const yOffset =
                        (index + 1) * (floatingMetrics.cardHeight + floatingMetrics.stackGap) +
                        floatingMetrics.stackOffset;
                      let yShift = 0;
                      let popupScale = 1;

                      if (hoveredFloatingIndex !== null) {
                        if (hoveredFloatingIndex === index) {
                          popupScale = 1.22;
                        } else {
                          const relativeDistance = Math.abs(index - hoveredFloatingIndex);
                          const influence = Math.max(0, 1 - relativeDistance / 3);
                          const direction = index < hoveredFloatingIndex ? 1 : -1;
                          yShift = direction * influence * 12;
                          popupScale = 1 - influence * 0.06;
                        }
                      }

                      return (
                        <div
                          key={`floating-${project.title}`}
                          className="absolute bottom-0 right-0"
                        >
                          <motion.button
                            type="button"
                            initial={false}
                            animate={
                              isFloatingExpanded
                                ? {
                                    opacity: 1,
                                    scale: popupScale,
                                    x: 0,
                                    y: -yOffset + yShift,
                                    filter: "blur(0px)",
                                  }
                                : {
                                    opacity: 0,
                                    scale: 0.7,
                                    x: 0,
                                    y: 0,
                                    filter: "blur(10px)",
                                  }
                            }
                            transition={{
                              duration: 0.45,
                              delay: isFloatingExpanded ? index * 0.02 : 0,
                              ease: motionEase,
                            }}
                            style={{
                              height: floatingMetrics.cardHeight,
                              width: floatingMetrics.cardWidth,
                            }}
                            onMouseEnter={() => {
                              openFloatingOrbit();
                              setHoveredFloatingIndex(index);
                            }}
                            onMouseLeave={() => {
                              setHoveredFloatingIndex((current) =>
                                current === index ? null : current
                              );
                            }}
                            onFocus={openFloatingOrbit}
                            onClick={() => {
                              setSelectedIndex(index);
                              setIsFloatingPinned(true);
                              setIsFloatingHovered(true);
                            }}
                            className="pointer-events-auto relative overflow-hidden rounded-[1.5rem] border border-white/26 bg-white/32 p-1 text-left shadow-[0_18px_40px_rgba(173,133,37,0.18)] backdrop-blur-2xl dark:border-white/12 dark:bg-white/[0.08]"
                          >
                            <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-90" />
                            <div className="h-full overflow-hidden rounded-[1.1rem] border border-white/20 bg-white/30 dark:border-white/10 dark:bg-white/[0.05]">
                              {project.previewImage ? (
                                <img
                                  src={project.previewImage}
                                  alt={`${project.title} mini preview`}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>

                  <motion.button
                    type="button"
                    aria-label="Open project selector"
                    onMouseEnter={openFloatingOrbit}
                    onFocus={openFloatingOrbit}
                    onClick={toggleFloatingOrbit}
                    animate={
                      isFloatingExpanded
                        ? { scale: 1, boxShadow: "0px 18px 70px rgba(173,133,37,0.3)" }
                        : { scale: 0.92, boxShadow: "0px 12px 46px rgba(173,133,37,0.2)" }
                    }
                    transition={{ duration: 0.35, ease: motionEase }}
                    style={{
                      height: floatingMetrics.buttonSize,
                      width: floatingMetrics.buttonSize,
                    }}
                    className="pointer-events-auto absolute bottom-0 right-0 overflow-hidden rounded-full border border-white/32 bg-white/30 backdrop-blur-3xl dark:border-white/12 dark:bg-white/[0.08]"
                  >
                    <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_24%,rgba(255,255,255,0.8),transparent_42%)]" />
                    <span className="pointer-events-none absolute inset-[14%] rounded-full border border-white/24 bg-white/10" />
                    <span className="pointer-events-none absolute inset-[34%] rounded-full bg-primary/70 shadow-[0_0_18px_rgba(173,133,37,0.4)] dark:bg-primary/85 dark:shadow-[0_0_18px_rgba(155,120,255,0.32)]" />
                  </motion.button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {selectedProject ? (
              <motion.section
                key={selectedProject.title}
                initial={{ opacity: 0, y: 26, scale: 0.985, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 20, scale: 0.985, filter: "blur(8px)" }}
                transition={{ duration: 0.48, ease: motionEase }}
                className="pointer-events-auto pb-14"
              >
                <div
                  ref={selectedSectionRef}
                  className="mx-auto w-full max-w-[120rem] scroll-mt-28 overflow-hidden rounded-[4.25rem] border border-white/30 bg-white/32 p-4 shadow-[0_36px_120px_rgba(173,133,37,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_36px_122px_rgba(8,5,18,0.52)] sm:rounded-[5rem] sm:p-6"
                >
                  <div className="rounded-[3.5rem] border border-white/24 bg-white/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/10 dark:bg-white/[0.04] sm:rounded-[4.2rem] sm:p-8 lg:p-10">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-display text-[10px] uppercase tracking-[0.34em] text-primary/80">
                          {selectedDetails?.headerLabel ?? "Project Placeholder"}
                        </p>
                        <h2 className="mt-3 text-2xl text-foreground sm:text-4xl">
                          {selectedProject.title}
                        </h2>
                        {selectedDetails?.tagline ? (
                          <p className="mt-3 text-xs uppercase tracking-[0.26em] text-muted-foreground">
                            {selectedDetails.tagline}
                          </p>
                        ) : null}
                      </div>
                      <span className="rounded-full border border-white/18 bg-white/26 px-4 py-1.5 font-display text-[10px] uppercase tracking-[0.28em] text-muted-foreground dark:border-white/10 dark:bg-white/[0.05]">
                        {selectedDetails?.status ?? "In Progress"}
                      </span>
                    </div>

                    {selectedDetails ? (
                      <div className="mt-8 columns-1 gap-5 lg:columns-2 xl:gap-6">
                        <section className="mb-5 break-inside-avoid rounded-[3rem] border border-white/28 bg-gradient-to-br from-white/72 via-white/28 to-white/12 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.26)] dark:border-white/10 dark:from-white/[0.11] dark:via-white/[0.04] dark:to-transparent sm:p-7">
                          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-primary/80">
                            Project Summary
                          </p>
                          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {selectedDetails.summary}
                          </p>
                        </section>

                        {selectedDetails.visuals[0] ? (
                          <figure className="mb-5 break-inside-avoid rounded-[3rem] border border-white/26 bg-white/22 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.03]">
                            <button
                              type="button"
                              onClick={() => setActiveVisual(selectedDetails.visuals[0])}
                              className="w-full text-left"
                            >
                              <div className="overflow-hidden rounded-[2.1rem] border border-white/20 bg-white/22 dark:border-white/10 dark:bg-white/[0.04]">
                                <img
                                  src={selectedDetails.visuals[0].src}
                                  alt={selectedDetails.visuals[0].alt}
                                  className="h-72 w-full object-cover sm:h-80"
                                />
                              </div>
                            </button>
                            <figcaption className="mt-3 px-1 text-xs leading-relaxed text-muted-foreground">
                              {selectedDetails.visuals[0].caption}
                            </figcaption>
                            <p className="mt-1 px-1 font-display text-[10px] uppercase tracking-[0.2em] text-primary/75">
                              Click to zoom
                            </p>
                          </figure>
                        ) : null}

                        <section className="mb-5 break-inside-avoid rounded-[3rem] border border-white/26 bg-white/24 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.03] sm:p-7">
                          <h3 className="font-display text-sm uppercase tracking-[0.24em] text-foreground/90">
                            Design Problem
                          </h3>
                          <div className="mt-4 space-y-3">
                            {selectedDetails.designProblem.map((item, itemIndex) => (
                              <div
                                key={item}
                                className="flex items-start gap-3 rounded-[1.4rem] border border-white/22 bg-white/24 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-white/[0.03]"
                              >
                                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/24 bg-white/34 font-display text-[10px] text-foreground/90 dark:border-white/10 dark:bg-white/[0.06]">
                                  {itemIndex + 1}
                                </span>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {item}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="mb-5 break-inside-avoid rounded-[3rem] border border-white/26 bg-white/24 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.03] sm:p-7">
                          <h3 className="font-display text-sm uppercase tracking-[0.24em] text-foreground/90">
                            Build Stack
                          </h3>
                          <div className="mt-4 flex flex-wrap gap-2.5">
                            {selectedDetails.tagline
                              .split("|")
                              .map((item) => item.trim())
                              .filter(Boolean)
                              .map((item) => (
                                <span
                                  key={item}
                                  className="rounded-full border border-white/22 bg-white/28 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.2em] text-foreground/90 dark:border-white/10 dark:bg-white/[0.05]"
                                >
                                  {item}
                                </span>
                              ))}
                          </div>
                        </section>

                        <section className="mb-5 break-inside-avoid rounded-[3rem] border border-white/26 bg-white/24 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.03] sm:p-7">
                          <h3 className="font-display text-sm uppercase tracking-[0.24em] text-foreground/90">
                            Key Architecture Decisions
                          </h3>
                          <div className="mt-4 space-y-3">
                            {selectedDetails.architectureDecisions.map((decision) => (
                              <article
                                key={decision.title}
                                className="rounded-[1.5rem] border border-white/22 bg-white/24 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-white/[0.03]"
                              >
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  <span className="font-semibold text-foreground/90">
                                    {decision.title}
                                  </span>{" "}
                                  {decision.detail}
                                </p>
                              </article>
                            ))}
                          </div>
                        </section>

                        {selectedDetails.visuals[1] ? (
                          <figure className="mb-5 break-inside-avoid rounded-[3rem] border border-white/26 bg-white/22 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.03]">
                            <button
                              type="button"
                              onClick={() => setActiveVisual(selectedDetails.visuals[1])}
                              className="w-full text-left"
                            >
                              <div className="overflow-hidden rounded-[2.1rem] border border-white/20 bg-white/22 dark:border-white/10 dark:bg-white/[0.04]">
                                <img
                                  src={selectedDetails.visuals[1].src}
                                  alt={selectedDetails.visuals[1].alt}
                                  className="h-80 w-full object-cover sm:h-[26rem]"
                                />
                              </div>
                            </button>
                            <figcaption className="mt-3 px-1 text-xs leading-relaxed text-muted-foreground">
                              {selectedDetails.visuals[1].caption}
                            </figcaption>
                            <p className="mt-1 px-1 font-display text-[10px] uppercase tracking-[0.2em] text-primary/75">
                              Click to zoom
                            </p>
                          </figure>
                        ) : null}

                        <section className="mb-5 break-inside-avoid rounded-[3rem] border border-white/26 bg-white/24 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.03] sm:p-7">
                          <h3 className="font-display text-sm uppercase tracking-[0.24em] text-foreground/90">
                            Engineering Challenges & Tradeoffs
                          </h3>
                          <div className="mt-4 space-y-3">
                            {selectedDetails.challengesTradeoffs.map((challenge) => (
                              <article
                                key={challenge.title}
                                className="rounded-[1.5rem] border border-white/22 bg-white/24 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-white/[0.03]"
                              >
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  <span className="font-semibold text-foreground/90">
                                    {challenge.title}
                                  </span>{" "}
                                  {challenge.detail}
                                </p>
                              </article>
                            ))}
                          </div>
                        </section>

                        {selectedDetails.visuals[2] ? (
                          <figure className="mb-5 break-inside-avoid rounded-[3rem] border border-white/26 bg-white/22 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.03]">
                            <button
                              type="button"
                              onClick={() => setActiveVisual(selectedDetails.visuals[2])}
                              className="w-full text-left"
                            >
                              <div className="overflow-hidden rounded-[2.1rem] border border-white/20 bg-white/22 dark:border-white/10 dark:bg-white/[0.04]">
                                <img
                                  src={selectedDetails.visuals[2].src}
                                  alt={selectedDetails.visuals[2].alt}
                                  className="h-72 w-full object-cover sm:h-80"
                                />
                              </div>
                            </button>
                            <figcaption className="mt-3 px-1 text-xs leading-relaxed text-muted-foreground">
                              {selectedDetails.visuals[2].caption}
                            </figcaption>
                            <p className="mt-1 px-1 font-display text-[10px] uppercase tracking-[0.2em] text-primary/75">
                              Click to zoom
                            </p>
                          </figure>
                        ) : null}

                        <section className="mb-5 break-inside-avoid rounded-[3rem] border border-white/26 bg-white/24 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.03] sm:p-7">
                          <h3 className="font-display text-sm uppercase tracking-[0.24em] text-foreground/90">
                            Performance & Validation
                          </h3>
                          <div className="mt-4 space-y-3">
                            {selectedDetails.performanceValidation.map((block) => (
                              <article
                                key={block.title}
                                className="rounded-[1.5rem] border border-white/22 bg-white/24 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-white/[0.03]"
                              >
                                <h4 className="font-display text-[11px] uppercase tracking-[0.2em] text-foreground/90">
                                  {block.title}
                                </h4>
                                <div className="mt-2 space-y-1.5">
                                  {block.lines.map((line) => (
                                    <p key={line} className="text-sm leading-relaxed text-muted-foreground">
                                      {line}
                                    </p>
                                  ))}
                                </div>
                              </article>
                            ))}
                          </div>
                        </section>
                      </div>
                    ) : (
                      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                        <div className="rounded-[3.1rem] border border-white/28 bg-gradient-to-br from-white/70 via-white/26 to-white/10 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/10 dark:from-white/[0.11] dark:via-white/[0.04] dark:to-transparent sm:rounded-[3.6rem] sm:p-7">
                          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {selectedProject.note}
                          </p>
                          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                            This is placeholder content for {selectedProject.title}. Lorem ipsum
                            dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                            incididunt ut labore et dolore magna aliqua.
                          </p>
                          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                            ut aliquip ex ea commodo consequat. This section will be replaced with
                            your real project summary later.
                          </p>
                        </div>

                        <div className="flex flex-col gap-4 rounded-[3.1rem] border border-white/26 bg-white/20 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:rounded-[3.6rem] sm:p-6">
                          {["Project 1", "Project 2", "Project 3"].map((label) => (
                            <div
                              key={label}
                              className="rounded-[2.2rem] border border-white/24 bg-white/22 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                            >
                              <div className="h-24 rounded-[1.7rem] border border-white/20 bg-gradient-to-br from-white/56 via-white/22 to-transparent dark:border-white/10 dark:from-white/[0.06] dark:via-white/[0.02] dark:to-transparent" />
                              <p className="mt-3 text-center font-display text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                                {label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {activeVisual ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveVisual(null)}
                className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md sm:p-8"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 8 }}
                  transition={{ duration: 0.28, ease: motionEase }}
                  onClick={(event) => event.stopPropagation()}
                  className="w-full max-w-5xl rounded-[2.6rem] border border-white/26 bg-white/24 p-4 shadow-[0_38px_120px_rgba(8,5,18,0.7)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.06] sm:p-5"
                >
                  <div className="mb-3 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveVisual(null)}
                      className="rounded-full border border-white/24 bg-white/26 px-4 py-1.5 font-display text-[10px] uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-white/36 dark:border-white/10 dark:bg-white/[0.07] dark:hover:bg-white/[0.12]"
                    >
                      Close
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-[2rem] border border-white/22 bg-white/24 dark:border-white/10 dark:bg-white/[0.04]">
                    <img
                      src={activeVisual.src}
                      alt={activeVisual.alt}
                      className="max-h-[76vh] w-full object-contain"
                    />
                  </div>
                  <p className="mt-3 px-1 text-xs leading-relaxed text-muted-foreground">
                    {activeVisual.caption}
                  </p>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
};

export default Projects;

