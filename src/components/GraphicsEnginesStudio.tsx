import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as fabric from 'fabric';
import {
  Layers,
  Palette,
  Box,
  Sparkles,
  Download,
  CloudUpload,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Type,
  Square,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Star as StarIcon,
  Brush,
  Trash2,
  Copy,
  Sliders,
  Sun,
  Camera,
  Code2,
  Compass,
  Check,
  Maximize2,
  Atom,
  Cpu,
  Monitor,
  Flame,
  Wand2,
  Move,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { uploadImageToDrive, uploadTextFileToDrive } from '../services/googleDriveService';
import { SocialShareBar } from './SocialShareBar';

interface GraphicsEnginesStudioProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestDriveConfirmation: (details: {
    title: string;
    message: string;
    itemDetails: string;
    onConfirm: () => Promise<void>;
  }) => void;
  isDriveConnected: boolean;
  onNavigateHome?: () => void;
}

export const GraphicsEnginesStudio: React.FC<GraphicsEnginesStudioProps> = ({
  onNotify,
  onRequestDriveConfirmation,
  isDriveConnected,
  onNavigateHome,
}) => {
  const [activeEngine, setActiveEngine] = useState<'three' | 'fabric' | 'glsl' | 'generative'>('three');

  // ==========================================
  // 1. THREE.JS 3D PBR ENGINE STATE
  // ==========================================
  const threeMountRef = useRef<HTMLDivElement | null>(null);
  const threeSceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    currentMeshGroup: THREE.Group;
    lights: {
      keyLight: THREE.DirectionalLight;
      fillLight: THREE.HemisphereLight;
      rimLight: THREE.PointLight;
    };
    animFrameId: number;
    clock: THREE.Clock;
    isSoftwareGl: boolean;
  } | null>(null);

  const [threeModel, setThreeModel] = useState<'crystal' | 'dna' | 'accelerator' | 'gyroscope' | 'lattice'>('crystal');
  const [threeMaterial, setThreeMaterial] = useState<'gold' | 'hologram' | 'neon' | 'glass' | 'carbon'>('gold');
  const [isThreeRotating, setIsThreeRotating] = useState(true);
  const [threeRotationSpeed, setThreeRotationSpeed] = useState(1);
  const [isThreeWireframe, setIsThreeWireframe] = useState(false);
  const [threeLightIntensity, setThreeLightIntensity] = useState(1.2);

  // ==========================================
  // 2. FABRIC.JS 2D VECTOR STUDIO STATE
  // ==========================================
  const fabricCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricInstanceRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'brush'>('select');
  const [fillColor, setFillColor] = useState('#06b6d4');
  const [brushColor, setBrushColor] = useState('#38bdf8');
  const [brushSize, setBrushSize] = useState(4);
  const [brushType, setBrushType] = useState<'Pencil' | 'Spray' | 'Circle'>('Pencil');
  const [canvasBg, setCanvasBg] = useState('#090d16');
  const [canvasAspect, setCanvasAspect] = useState<'1:1' | '16:9' | '9:16'>('16:9');
  const [selectedFabricObj, setSelectedFabricObj] = useState<any | null>(null);
  const [objectOpacity, setObjectOpacity] = useState(1);

  // ==========================================
  // 3. GLSL RAYMARCHING SHADER ENGINE STATE
  // ==========================================
  const glslCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const glslContextRef = useRef<{
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    animId: number;
    startTime: number;
    uTimeLoc: WebGLUniformLocation | null;
    uResolutionLoc: WebGLUniformLocation | null;
    uMouseLoc: WebGLUniformLocation | null;
  } | null>(null);

  const [selectedShaderPreset, setSelectedShaderPreset] = useState<'synthwave' | 'mandelbulb' | 'plasma' | 'wormhole' | 'chrome'>('synthwave');
  const [glslFps, setGlslFps] = useState(60);
  const [isGlslCompiling, setIsGlslCompiling] = useState(false);
  const [shaderError, setShaderError] = useState<string | null>(null);

  // ==========================================
  // 4. GENERATIVE & ALGORITHMIC ART ENGINE (D3/CANVAS)
  // ==========================================
  const genCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const genAnimRef = useRef<number | null>(null);
  const [genPreset, setGenPreset] = useState<'flowfield' | 'girih' | 'fractal' | 'reaction'>('flowfield');
  const [genParticles, setGenParticles] = useState(800);
  const [genSpeed, setGenSpeed] = useState(1.2);
  const [genColorPalette, setGenColorPalette] = useState<'cyber' | 'gold' | 'neon' | 'fire'>('cyber');
  const [isGenRunning, setIsGenRunning] = useState(true);

  // -------------------------------------------------------------
  // SHADER PRESETS (GLSL FRAGMENT CODE)
  // -------------------------------------------------------------
  const shaderPresetsSource: Record<string, string> = {
    synthwave: `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 col = vec3(0.04, 0.02, 0.12);
    
    // Sun
    vec2 sunPos = vec2(0.0, 0.15);
    float dSun = length(uv - sunPos);
    if (dSun < 0.28) {
        float stripes = sin(uv.y * 70.0 - u_time * 2.0);
        if (stripes > -0.2 || uv.y > 0.18) {
            col = mix(vec3(1.0, 0.8, 0.1), vec3(1.0, 0.1, 0.5), (uv.y - sunPos.y + 0.28) / 0.56);
        }
    }
    
    // Grid floor
    if (uv.y < 0.0) {
        float fov = 0.45;
        vec3 p = vec3(uv.x, uv.y, fov);
        vec3 dir = normalize(p);
        float t = -1.0 / dir.y;
        vec2 plane = (dir * t).xz;
        plane.y += u_time * 2.5;
        
        vec2 grid = abs(fract(plane - 0.5) - 0.5) / fwidth(plane);
        float line = min(grid.x, grid.y);
        float c = 1.0 - min(line, 1.0);
        
        vec3 gridCol = mix(vec3(0.0, 0.9, 1.0), vec3(0.9, 0.1, 0.8), sin(plane.y * 0.1) * 0.5 + 0.5);
        col += gridCol * c * exp(-t * 0.15);
    }
    
    // Stars
    if (uv.y > 0.0) {
        float stars = fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453);
        if (stars > 0.992) {
            col += vec3(0.8, 0.9, 1.0) * (sin(u_time * 4.0 + stars * 100.0) * 0.5 + 0.5);
        }
    }
    
    fragColor = vec4(col, 1.0);
}`,
    mandelbulb: `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float mandelbulb(vec3 pos) {
    vec3 w = pos;
    float m = dot(w, w);
    float dz = 1.0;
    float power = 8.0 + sin(u_time * 0.5) * 2.0;
    
    for (int i = 0; i < 4; i++) {
        dz = power * pow(m, 3.5) * dz + 1.0;
        float r = length(w);
        float b = power * acos(clamp(w.y / r, -1.0, 1.0));
        float a = power * atan(w.x, w.z);
        w = pos + pow(r, power) * vec3(sin(b) * sin(a), cos(b), sin(b) * cos(a));
        m = dot(w, w);
        if (m > 4.0) break;
    }
    return 0.25 * log(m) * sqrt(m) / dz;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(0.0, 0.0, -2.4);
    vec3 rd = normalize(vec3(uv, 1.2));
    
    float t = 0.0;
    float d = 0.0;
    for (int i = 0; i < 45; i++) {
        vec3 p = ro + rd * t;
        // Rotation
        float c = cos(u_time * 0.2);
        float s = sin(u_time * 0.2);
        p.xz = mat2(c, -s, s, c) * p.xz;
        
        d = mandelbulb(p);
        t += d;
        if (d < 0.002 || t > 5.0) break;
    }
    
    vec3 col = vec3(0.02, 0.04, 0.08);
    if (t < 5.0) {
        float glow = float(t) * 0.3;
        col = mix(vec3(0.1, 0.8, 0.9), vec3(0.9, 0.2, 0.7), sin(t * 4.0 + u_time) * 0.5 + 0.5);
        col *= (1.0 / (1.0 + t * t * 0.15));
    }
    fragColor = vec4(col, 1.0);
}`,
    plasma: `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float t = u_time * 0.8;
    
    float v1 = sin(uv.x * 8.0 + t);
    float v2 = sin(uv.y * 8.0 + t);
    float v3 = sin(uv.x * 6.0 + uv.y * 6.0 + t);
    float cx = uv.x + 0.5 * sin(t / 2.0);
    float cy = uv.y + 0.5 * cos(t / 3.0);
    float v4 = sin(sqrt(100.0 * (cx * cx + cy * cy) + 1.0) + t);
    
    float v = v1 + v2 + v3 + v4;
    vec3 col = vec3(
        sin(v * 3.1415 + 0.0) * 0.5 + 0.5,
        sin(v * 3.1415 + 2.0) * 0.5 + 0.5,
        sin(v * 3.1415 + 4.0) * 0.5 + 0.5
    );
    col = mix(col, vec3(0.0, 0.9, 1.0), 0.35);
    fragColor = vec4(col, 1.0);
}`,
    wormhole: `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float r = length(p);
    float a = atan(p.y, p.x);
    
    vec2 uv = vec2(0.3 / r + u_time * 0.4, a / 3.14159);
    float lines = sin(uv.x * 20.0) * sin(uv.y * 12.0);
    
    vec3 col = mix(vec3(0.1, 0.4, 0.9), vec3(0.8, 0.1, 0.9), sin(u_time + uv.x) * 0.5 + 0.5);
    col += vec3(0.9, 0.8, 0.3) * smoothstep(0.7, 1.0, lines);
    col *= smoothstep(0.0, 0.5, r);
    fragColor = vec4(col, 1.0);
}`,
    chrome: `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float t = u_time * 0.5;
    
    vec3 col = vec3(0.0);
    for (float i = 1.0; i < 4.0; i++) {
        uv.x += 0.2 / i * sin(i * 3.0 * uv.y + t);
        uv.y += 0.2 / i * cos(i * 3.0 * uv.x + t);
    }
    float r = sin(uv.x + uv.y + t) * 0.5 + 0.5;
    float g = sin(uv.x + uv.y + t + 2.0) * 0.5 + 0.5;
    float b = sin(uv.x + uv.y + t + 4.0) * 0.5 + 0.5;
    
    vec3 chrome = vec3(r, g, b);
    chrome = pow(chrome, vec3(2.2));
    fragColor = vec4(chrome * 1.5, 1.0);
}`
  };

  const [customGlslCode, setCustomGlslCode] = useState(shaderPresetsSource.synthwave);

  // =============================================================
  // EFFECT: INITIALIZE THREE.JS 3D ENGINE
  // =============================================================
  useEffect(() => {
    if (activeEngine !== 'three') return;
    if (!threeMountRef.current) return;

    const mount = threeMountRef.current;
    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 500;

    // Detect Software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 12;
    controls.minDistance = 1.5;

    // Procedural Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff8eb, 1.5);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 0.7);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xa855f7, 2.0, 10);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    // Floor Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(8, 20, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -1.21;
    scene.add(gridHelper);

    const currentMeshGroup = new THREE.Group();
    scene.add(currentMeshGroup);

    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      controls.update();

      if (isThreeRotating && currentMeshGroup) {
        currentMeshGroup.rotation.y += delta * 0.6 * threeRotationSpeed;
      }

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(animate);

    threeSceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      currentMeshGroup,
      lights: { keyLight, fillLight, rimLight },
      animFrameId: frameId,
      clock,
      isSoftwareGl,
    };

    const handleResize = () => {
      if (!mount || !threeSceneRef.current) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      threeSceneRef.current.camera.aspect = w / h;
      threeSceneRef.current.camera.updateProjectionMatrix();
      threeSceneRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      mount.replaceChildren();
      threeSceneRef.current = null;
    };
  }, [activeEngine]);

  // Update Three.js Model & Material when state changes
  useEffect(() => {
    if (!threeSceneRef.current) return;
    const { currentMeshGroup, isSoftwareGl } = threeSceneRef.current;

    // Clear previous children
    while (currentMeshGroup.children.length > 0) {
      const obj: any = currentMeshGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
        else obj.material.dispose();
      }
      currentMeshGroup.remove(obj);
    }

    // Material generator
    const getMaterial = (accent = false): THREE.Material => {
      switch (threeMaterial) {
        case 'gold':
          return new THREE.MeshPhysicalMaterial({
            color: accent ? 0xfef08a : 0xd97706,
            metalness: 0.95,
            roughness: 0.18,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1,
            wireframe: isThreeWireframe,
          });
        case 'neon':
          return new THREE.MeshStandardMaterial({
            color: accent ? 0x38bdf8 : 0x06b6d4,
            emissive: accent ? 0x0284c7 : 0x0891b2,
            emissiveIntensity: 0.6,
            roughness: 0.2,
            metalness: 0.8,
            wireframe: isThreeWireframe,
          });
        case 'glass':
          return new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.05,
            transmission: isSoftwareGl ? 0 : 0.92,
            opacity: isSoftwareGl ? 0.4 : 1,
            transparent: true,
            ior: 1.5,
            wireframe: isThreeWireframe,
          });
        case 'carbon':
          return new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.35,
            metalness: 0.7,
            wireframe: isThreeWireframe,
          });
        case 'hologram':
        default:
          return new THREE.MeshStandardMaterial({
            color: accent ? 0xa855f7 : 0x6366f1,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.7,
            roughness: 0.1,
            wireframe: true,
          });
      }
    };

    // Composite Procedural 3D Models
    if (threeModel === 'crystal') {
      // Intricate multi-part Cyber Crystal (Outer facet + Core inner geometry + orbiting rings)
      const outerGeo = new THREE.IcosahedronGeometry(0.9, 1);
      const outerMesh = new THREE.Mesh(outerGeo, getMaterial(false));
      outerMesh.castShadow = true;
      currentMeshGroup.add(outerMesh);

      const innerGeo = new THREE.OctahedronGeometry(0.45);
      const innerMesh = new THREE.Mesh(innerGeo, getMaterial(true));
      currentMeshGroup.add(innerMesh);

      // Orbital Rings
      const ringGeo = new THREE.TorusGeometry(1.35, 0.02, 16, 100);
      const ringMesh1 = new THREE.Mesh(ringGeo, getMaterial(true));
      ringMesh1.rotation.x = Math.PI / 3;
      const ringMesh2 = new THREE.Mesh(ringGeo, getMaterial(true));
      ringMesh2.rotation.y = Math.PI / 4;
      currentMeshGroup.add(ringMesh1);
      currentMeshGroup.add(ringMesh2);
    } else if (threeModel === 'dna') {
      // Double Helix model with connecting base pairs
      const helixGroup = new THREE.Group();
      const points = 40;
      const radius = 0.6;
      const height = 2.4;

      for (let i = 0; i < points; i++) {
        const t = (i / points) * Math.PI * 4;
        const y = (i / points) * height - height / 2;
        const x1 = Math.cos(t) * radius;
        const z1 = Math.sin(t) * radius;
        const x2 = Math.cos(t + Math.PI) * radius;
        const z2 = Math.sin(t + Math.PI) * radius;

        // Strand 1 node
        const node1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), getMaterial(false));
        node1.position.set(x1, y, z1);
        helixGroup.add(node1);

        // Strand 2 node
        const node2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), getMaterial(true));
        node2.position.set(x2, y, z2);
        helixGroup.add(node2);

        // Connecting rungs every 2 nodes
        if (i % 2 === 0) {
          const rungGeo = new THREE.CylinderGeometry(0.02, 0.02, radius * 2, 8);
          const rung = new THREE.Mesh(rungGeo, getMaterial(true));
          rung.position.set(0, y, 0);
          rung.rotation.z = Math.PI / 2;
          rung.rotation.y = -t;
          helixGroup.add(rung);
        }
      }
      currentMeshGroup.add(helixGroup);
    } else if (threeModel === 'accelerator') {
      // Hyper-Torus Particle Accelerator
      const torusGeo = new THREE.TorusGeometry(0.9, 0.28, 24, 100);
      const torusMesh = new THREE.Mesh(torusGeo, getMaterial(false));
      torusMesh.castShadow = true;
      currentMeshGroup.add(torusMesh);

      // Exterior Coils
      for (let i = 0; i < 8; i++) {
        const coilAngle = (i / 8) * Math.PI * 2;
        const coil = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 12, 32), getMaterial(true));
        coil.position.set(Math.cos(coilAngle) * 0.9, Math.sin(coilAngle) * 0.9, 0);
        coil.rotation.z = coilAngle;
        currentMeshGroup.add(coil);
      }
    } else if (threeModel === 'gyroscope') {
      // Mechanical Gyroscope with 3 concentric gimbal rings & glowing center
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.04, 16, 80), getMaterial(false));
      const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.035, 16, 80), getMaterial(true));
      r2.rotation.x = Math.PI / 2;
      const r3 = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.03, 16, 80), getMaterial(false));
      r3.rotation.y = Math.PI / 2;
      const centerCore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35), getMaterial(true));

      currentMeshGroup.add(r1);
      currentMeshGroup.add(r2);
      currentMeshGroup.add(r3);
      currentMeshGroup.add(centerCore);
    } else if (threeModel === 'lattice') {
      // Organic Cellular Lattice Structure
      const knotGeo = new THREE.TorusKnotGeometry(0.75, 0.22, 128, 32, 2, 5);
      const knotMesh = new THREE.Mesh(knotGeo, getMaterial(false));
      knotMesh.castShadow = true;
      currentMeshGroup.add(knotMesh);
    }
  }, [threeModel, threeMaterial, isThreeWireframe]);

  // Update light intensity
  useEffect(() => {
    if (!threeSceneRef.current) return;
    const { keyLight, fillLight, rimLight } = threeSceneRef.current.lights;
    keyLight.intensity = 1.5 * threeLightIntensity;
    fillLight.intensity = 0.7 * threeLightIntensity;
    rimLight.intensity = 2.0 * threeLightIntensity;
  }, [threeLightIntensity]);

  // Export 3D Render
  const handleExportThreeSnapshot = () => {
    if (!threeSceneRef.current) return;
    const { renderer, scene, camera } = threeSceneRef.current;
    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL('image/png');

    const link = document.createElement('a');
    link.download = `AWH_3D_Engine_${threeModel}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    onNotify('تم تصدير اللقطة ثلاثية الأبعاد بدقة فائقة!', 'success');
  };

  const handleSaveThreeToDrive = () => {
    if (!threeSceneRef.current) return;
    if (!isDriveConnected) {
      onNotify('يرجى تسجيل الدخول إلى Google Drive من الشريط العلوي أولاً', 'error');
      return;
    }
    const { renderer, scene, camera } = threeSceneRef.current;
    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL('image/png');
    const fileName = `AWH_3D_Render_${threeModel}_${Date.now()}.png`;

    onRequestDriveConfirmation({
      title: 'حفظ الرندر ثلاثي الأبعاد في Google Drive',
      message: 'هل توافق على رفع هذه اللقطة الاحترافية ثلاثية الأبعاد إلى حساب Google Drive الخاص بك؟',
      itemDetails: `اسم الملف: ${fileName}\nالمجسم: ${threeModel}\nالمادة: ${threeMaterial}`,
      onConfirm: async () => {
        const res = await uploadImageToDrive({
          name: fileName,
          base64DataUrl: dataUrl,
          description: `Generated via Three.js PBR Engine on A.W.H AI Studio (${threeModel} - ${threeMaterial})`,
        });
        onNotify(`تم حفظ المشهد ثلاثي الأبعاد بنجاح في Google Drive باسم "${res.name}"`, 'success');
      },
    });
  };

  // Preset Cameras for Three.js
  const setCameraPreset = (preset: 'front' | 'iso' | 'top') => {
    if (!threeSceneRef.current) return;
    const { camera, controls } = threeSceneRef.current;
    if (preset === 'front') {
      camera.position.set(0, 0, 4);
    } else if (preset === 'iso') {
      camera.position.set(3, 3, 3);
    } else if (preset === 'top') {
      camera.position.set(0, 4.5, 0.1);
    }
    controls.target.set(0, 0, 0);
    controls.update();
  };

  // =============================================================
  // EFFECT: INITIALIZE FABRIC.JS 2D VECTOR STUDIO
  // =============================================================
  useEffect(() => {
    if (activeEngine !== 'fabric') return;
    if (!fabricCanvasRef.current) return;

    const width = canvasAspect === '16:9' ? 880 : canvasAspect === '1:1' ? 640 : 420;
    const height = canvasAspect === '16:9' ? 495 : canvasAspect === '1:1' ? 640 : 680;

    const canvas = new fabric.Canvas(fabricCanvasRef.current, {
      width,
      height,
      backgroundColor: canvasBg,
      preserveObjectStacking: true,
    });

    fabricInstanceRef.current = canvas;

    // Selection listeners
    canvas.on('selection:created', (e) => {
      setSelectedFabricObj(e.selected ? e.selected[0] : null);
    });
    canvas.on('selection:updated', (e) => {
      setSelectedFabricObj(e.selected ? e.selected[0] : null);
    });
    canvas.on('selection:cleared', () => {
      setSelectedFabricObj(null);
    });

    // Add default initial welcome card
    const cardBg = new fabric.Rect({
      left: width / 2 - 240,
      top: height / 2 - 120,
      fill: 'rgba(15, 23, 42, 0.85)',
      stroke: '#06b6d4',
      strokeWidth: 2,
      width: 480,
      height: 240,
      rx: 16,
      ry: 16,
      shadow: new fabric.Shadow({ color: 'rgba(6, 182, 212, 0.35)', blur: 25, offsetX: 0, offsetY: 0 }),
    });

    const titleText = new fabric.IText('محرك التصميم الجرافيكي A.W.H', {
      left: width / 2 - 180,
      top: height / 2 - 70,
      fontFamily: 'Cairo, sans-serif',
      fontSize: 26,
      fontWeight: 'bold',
      fill: '#ffffff',
    });

    const subText = new fabric.IText('Fabric.js Vector Engine • طبقات • نصوص • أشكال', {
      left: width / 2 - 180,
      top: height / 2 - 15,
      fontFamily: 'Cairo, sans-serif',
      fontSize: 14,
      fill: '#94a3b8',
    });

    const badge = new fabric.Circle({
      left: width / 2 + 150,
      top: height / 2 - 60,
      radius: 20,
      fill: '#06b6d4',
    });

    canvas.add(cardBg, titleText, subText, badge);
    canvas.renderAll();

    return () => {
      canvas.dispose();
      fabricInstanceRef.current = null;
    };
  }, [activeEngine, canvasAspect]);

  // Update canvas background
  useEffect(() => {
    if (!fabricInstanceRef.current) return;
    fabricInstanceRef.current.backgroundColor = canvasBg;
    fabricInstanceRef.current.renderAll();
  }, [canvasBg]);

  // Update drawing mode
  useEffect(() => {
    const canvas = fabricInstanceRef.current;
    if (!canvas) return;
    canvas.isDrawingMode = activeTool === 'brush';
    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [activeTool, brushColor, brushSize]);

  // Fabric Add Vector Shapes
  const addFabricShape = (type: 'rect' | 'circle' | 'triangle' | 'star' | 'badge') => {
    const canvas = fabricInstanceRef.current;
    if (!canvas) return;

    const center = canvas.getCenterPoint();
    let obj: any = null;

    if (type === 'rect') {
      obj = new fabric.Rect({
        left: center.x - 70,
        top: center.y - 45,
        fill: fillColor,
        width: 140,
        height: 90,
        rx: 12,
        ry: 12,
        stroke: '#ffffff',
        strokeWidth: 1,
      });
    } else if (type === 'circle') {
      obj = new fabric.Circle({
        left: center.x - 50,
        top: center.y - 50,
        fill: fillColor,
        radius: 50,
        stroke: '#ffffff',
        strokeWidth: 1,
      });
    } else if (type === 'triangle') {
      obj = new fabric.Triangle({
        left: center.x - 50,
        top: center.y - 50,
        fill: fillColor,
        width: 100,
        height: 90,
      });
    } else if (type === 'star') {
      // 5-point star polygon
      const points: { x: number; y: number }[] = [];
      const numPoints = 5;
      const outerRadius = 55;
      const innerRadius = 26;
      for (let i = 0; i < numPoints * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / numPoints - Math.PI / 2;
        points.push({ x: r * Math.cos(angle) + 55, y: r * Math.sin(angle) + 55 });
      }
      obj = new fabric.Polygon(points, {
        left: center.x - 55,
        top: center.y - 55,
        fill: fillColor,
      });
    } else if (type === 'badge') {
      obj = new fabric.Rect({
        left: center.x - 90,
        top: center.y - 25,
        fill: fillColor,
        width: 180,
        height: 50,
        rx: 25,
        ry: 25,
        stroke: '#38bdf8',
        strokeWidth: 2,
        shadow: new fabric.Shadow({ color: 'rgba(56, 189, 248, 0.4)', blur: 15, offsetX: 0, offsetY: 0 }),
      });
    }

    if (obj) {
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
      onNotify('تمت إضافة العنصر المتجهي بنجاح', 'info');
    }
  };

  // Add Typography text
  const addFabricText = (preset: 'title' | 'body' | 'badge') => {
    const canvas = fabricInstanceRef.current;
    if (!canvas) return;
    const center = canvas.getCenterPoint();

    const textContent =
      preset === 'title' ? 'عنوان رئيسي جذاب' : preset === 'body' ? 'اكتب النص التوضيحي أو الفقرة هنا...' : '★ A.W.H PRO 2026';
    const textObj = new fabric.IText(textContent, {
      left: center.x - 100,
      top: center.y - 20,
      fontFamily: 'Cairo, sans-serif',
      fontSize: preset === 'title' ? 32 : preset === 'body' ? 16 : 14,
      fontWeight: preset === 'title' ? 'bold' : 'normal',
      fill: preset === 'badge' ? '#38bdf8' : '#ffffff',
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    onNotify('تمت إضافة طبقة النص القابلة للتعديل', 'info');
  };

  // Fabric Layer Controls
  const handleLayerOrder = (action: 'forward' | 'backward' | 'top' | 'bottom') => {
    const canvas = fabricInstanceRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;

    if (action === 'forward') canvas.bringObjectForward(active);
    else if (action === 'backward') canvas.sendObjectBackwards(active);
    else if (action === 'top') canvas.bringObjectToFront(active);
    else if (action === 'bottom') canvas.sendObjectToBack(active);

    canvas.renderAll();
  };

  const handleDeleteSelected = () => {
    const canvas = fabricInstanceRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;
    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedFabricObj(null);
  };

  const handleDuplicateSelected = () => {
    const canvas = fabricInstanceRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;

    active.clone().then((cloned: any) => {
      cloned.set({
        left: cloned.left + 25,
        top: cloned.top + 25,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  };

  const handleExportFabricImage = () => {
    const canvas = fabricInstanceRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    const link = document.createElement('a');
    link.download = `AWH_Design_${canvasAspect.replace(':', '_')}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    onNotify('تم تصدير التصميم المتجهي كصورة عالية الدقة PNG!', 'success');
  };

  const handleExportFabricSvg = () => {
    const canvas = fabricInstanceRef.current;
    if (!canvas) return;
    const svgData = canvas.toSVG();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `AWH_Design_Vector_${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    onNotify('تم تصدير التصميم كملف متجهي SVG عالي الجودة!', 'success');
  };

  const handleSaveFabricToDrive = () => {
    const canvas = fabricInstanceRef.current;
    if (!canvas) return;
    if (!isDriveConnected) {
      onNotify('يرجى تسجيل الدخول إلى Google Drive من الشريط العلوي أولاً', 'error');
      return;
    }

    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    const fileName = `AWH_Design_${Date.now()}.png`;

    onRequestDriveConfirmation({
      title: 'حفظ التصميم الجرافيكي في Google Drive',
      message: 'هل توافق على حفظ هذا التصميم الجرافيكي المنجز في مساحة Google Drive الخاصة بك؟',
      itemDetails: `اسم الملف: ${fileName}\nالأبعاد: ${canvas.width}x${canvas.height}px`,
      onConfirm: async () => {
        const res = await uploadImageToDrive({
          name: fileName,
          base64DataUrl: dataUrl,
          description: `Created via Fabric.js Vector Studio on A.W.H AI Platform`,
        });
        onNotify(`تم حفظ التصميم بنجاح في Google Drive باسم "${res.name}"`, 'success');
      },
    });
  };

  // =============================================================
  // EFFECT: INITIALIZE GLSL SHADER ENGINE (WEBGL2)
  // =============================================================
  const initGlslEngine = (codeToCompile: string) => {
    if (!glslCanvasRef.current) return;
    const canvas = glslCanvasRef.current;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      setShaderError('متصفحك لا يدعم WebGL2 لتشغيل الشيدرز');
      return;
    }

    // Stop previous loop if any
    if (glslContextRef.current) {
      cancelAnimationFrame(glslContextRef.current.animId);
    }

    const vsSource = `#version 300 es
    in vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }`;

    // Vertex shader
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    // Fragment shader
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, codeToCompile);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(fs);
      setShaderError(`خطأ تجميع GLSL:\n${info}`);
      return;
    }
    setShaderError(null);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setShaderError(`خطأ ربط البرنامج:\n${gl.getProgramInfoLog(program)}`);
      return;
    }

    // Quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const uMouseLoc = gl.getUniformLocation(program, 'u_mouse');

    const startTime = performance.now();
    let lastTime = performance.now();
    let frameCount = 0;
    let animId = 0;

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const elapsed = (time - startTime) * 0.001;

      // FPS calculation
      frameCount++;
      if (time - lastTime >= 1000) {
        setGlslFps(Math.round((frameCount * 1000) / (time - lastTime)));
        frameCount = 0;
        lastTime = time;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);

      if (uTimeLoc) gl.uniform1f(uTimeLoc, elapsed);
      if (uResolutionLoc) gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      if (uMouseLoc) gl.uniform2f(uMouseLoc, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    animId = requestAnimationFrame(render);

    glslContextRef.current = {
      gl,
      program,
      animId,
      startTime,
      uTimeLoc,
      uResolutionLoc,
      uMouseLoc,
    };
  };

  useEffect(() => {
    if (activeEngine !== 'glsl') return;
    initGlslEngine(customGlslCode);

    return () => {
      if (glslContextRef.current) {
        cancelAnimationFrame(glslContextRef.current.animId);
        glslContextRef.current = null;
      }
    };
  }, [activeEngine]);

  const handleSelectShaderPreset = (presetKey: string) => {
    setSelectedShaderPreset(presetKey as any);
    const code = shaderPresetsSource[presetKey] || shaderPresetsSource.synthwave;
    setCustomGlslCode(code);
    initGlslEngine(code);
  };

  const handleRecompileGlsl = () => {
    setIsGlslCompiling(true);
    initGlslEngine(customGlslCode);
    setTimeout(() => {
      setIsGlslCompiling(false);
      onNotify('تم إعادة تجميع كود GLSL للشيدر بنجاح!', 'success');
    }, 300);
  };

  // =============================================================
  // EFFECT: INITIALIZE GENERATIVE D3/CANVAS MATH ART ENGINE
  // =============================================================
  useEffect(() => {
    if (activeEngine !== 'generative') return;
    if (!genCanvasRef.current) return;

    const canvas = genCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    const height = (canvas.height = 480);

    // Particle Flow Field
    const particles: { x: number; y: number; vx: number; vy: number; age: number; maxAge: number }[] = [];
    for (let i = 0; i < genParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        age: 0,
        maxAge: Math.random() * 200 + 100,
      });
    }

    let time = 0;

    // Simplex/Perlin pseudo-noise generator
    const getFlowAngle = (x: number, y: number, t: number) => {
      return (Math.sin(x * 0.005 + t) + Math.cos(y * 0.005 + t)) * Math.PI * 2;
    };

    const paletteColors =
      genColorPalette === 'gold'
        ? ['#f59e0b', '#fbbf24', '#d97706', '#fef3c7']
        : genColorPalette === 'neon'
        ? ['#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4']
        : genColorPalette === 'fire'
        ? ['#ef4444', '#f97316', '#eab308', '#dc2626']
        : ['#06b6d4', '#3b82f6', '#6366f1', '#a855f7'];

    const render = () => {
      if (!isGenRunning) return;
      time += 0.008 * genSpeed;

      if (genPreset === 'flowfield') {
        // Semi-transparent fade for motion trails
        ctx.fillStyle = 'rgba(3, 7, 18, 0.06)';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const angle = getFlowAngle(p.x, p.y, time);
          p.vx = Math.cos(angle) * 1.8 * genSpeed;
          p.vy = Math.sin(angle) * 1.8 * genSpeed;
          const prevX = p.x;
          const prevY = p.y;
          p.x += p.vx;
          p.y += p.vy;
          p.age++;

          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = paletteColors[i % paletteColors.length];
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Reset if out of bounds or dead
          if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.age > p.maxAge) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.age = 0;
          }
        }
      } else if (genPreset === 'girih') {
        // Sacred Islamic Geometric Pattern (Girih Tesselation)
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, width, height);

        const gridSize = 120;
        const starPoints = 8;
        const outerR = 50 + Math.sin(time * 2) * 5;
        const innerR = 25;

        for (let gx = 0; gx < width + gridSize; gx += gridSize) {
          for (let gy = 0; gy < height + gridSize; gy += gridSize) {
            ctx.save();
            ctx.translate(gx, gy);
            ctx.rotate(time * 0.2);

            ctx.beginPath();
            for (let i = 0; i < starPoints * 2; i++) {
              const r = i % 2 === 0 ? outerR : innerR;
              const a = (i * Math.PI) / starPoints;
              const px = Math.cos(a) * r;
              const py = Math.sin(a) * r;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = paletteColors[0];
            ctx.lineWidth = 2;
            ctx.stroke();

            // Concentric circle
            ctx.beginPath();
            ctx.arc(0, 0, innerR, 0, Math.PI * 2);
            ctx.strokeStyle = paletteColors[1];
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
          }
        }
      }

      genAnimRef.current = requestAnimationFrame(render);
    };

    genAnimRef.current = requestAnimationFrame(render);

    return () => {
      if (genAnimRef.current) cancelAnimationFrame(genAnimRef.current);
    };
  }, [activeEngine, genPreset, genParticles, genSpeed, genColorPalette, isGenRunning]);

  return (
    <div className="space-y-6">
      <SocialShareBar onNotify={onNotify} onNavigateHome={onNavigateHome} />

      {/* Top Header & Engine Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
              GRAPHICS & DESIGN ENGINE SUITE
            </span>
            <span className="text-xs text-slate-400 font-mono">WebGL2 • Three.js • Fabric.js • GLSL Raymarching</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <Palette className="w-6 h-6 text-cyan-400" />
            <span>منصة محركات التصميم والجرافيكس الفائقة</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            مجموعة مدمجة من أقوى محركات الرسومات العالمية: الأبعاد الثلاثية PBR، التصميم المتجهي، الشيدرز اللحظية، والفن الخوارزمي التوليدي.
          </p>
        </div>

        {/* Engine switcher tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs self-start lg:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'three', label: 'محرك Three.js 3D (PBR)', icon: Box },
            { id: 'fabric', label: 'محرك Fabric.js (Vector Studio)', icon: Layers },
            { id: 'glsl', label: 'محرك الشيدرز GLSL (Raymarching)', icon: Flame },
            { id: 'generative', label: 'محرك الفن الخوارزمي والتوليدي', icon: Atom },
          ].map((engine) => {
            const Icon = engine.icon;
            const isActive = activeEngine === engine.id;
            return (
              <button
                key={engine.id}
                onClick={() => setActiveEngine(engine.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md shadow-cyan-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{engine.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. THREE.JS 3D PBR ENGINE VIEWPORT & CONTROL DOCK */}
      {/* ============================================================== */}
      {activeEngine === 'three' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Main 3D Viewport Screen */}
          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            {/* Canvas Mount */}
            <div ref={threeMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Top-Left Spec Overlay */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Box className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">المجسم: {threeModel}</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300 font-mono">{threeMaterial.toUpperCase()}</span>
            </div>

            {/* Top-Right Camera / Quick Action Overlay */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setCameraPreset('front')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                title="منظر أمامي مباشر"
              >
                أمامي
              </button>
              <button
                onClick={() => setCameraPreset('iso')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                title="منظر أيزومتري 45 درجة"
              >
                أيزومتري
              </button>
              <button
                onClick={() => setCameraPreset('top')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                title="منظر من الأعلى"
              >
                علوي
              </button>
              <button
                onClick={() => setIsThreeWireframe(!isThreeWireframe)}
                className={`p-1.5 rounded-lg border text-[11px] transition ${
                  isThreeWireframe ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="تبديل الهيكل السلكي (Wireframe)"
              >
                هيكل شبكي
              </button>
            </div>

            {/* Bottom Glassmorphic Unified Control Dock */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-4xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Models selection */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">المجسم:</span>
                {[
                  { id: 'crystal', label: 'البلورة الكمومية' },
                  { id: 'dna', label: 'الحمض النووي DNA' },
                  { id: 'accelerator', label: 'المسرّع الحلقي' },
                  { id: 'gyroscope', label: 'جيروسكوب كروي' },
                  { id: 'lattice', label: 'عقدة خلوية' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setThreeModel(m.id as any)}
                    className={`px-2.5 py-1.5 rounded-xl transition font-medium ${
                      threeModel === m.id
                        ? 'bg-cyan-600 text-white font-bold shadow-md'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Material selection */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">الخامة PBR:</span>
                {[
                  { id: 'gold', label: 'ذهب مصقول', color: '#f59e0b' },
                  { id: 'neon', label: 'نيون متوهج', color: '#06b6d4' },
                  { id: 'glass', label: 'زجاج شفاف', color: '#e2e8f0' },
                  { id: 'carbon', label: 'كربون تيتانيوم', color: '#475569' },
                  { id: 'hologram', label: 'هولوغرام فلكي', color: '#a855f7' },
                ].map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => setThreeMaterial(mat.id as any)}
                    className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      threeMaterial === mat.id
                        ? 'bg-slate-700 text-white font-bold border border-cyan-400'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mat.color }} />
                    <span>{mat.label}</span>
                  </button>
                ))}
              </div>

              {/* Rotation & Lighting Sliders */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsThreeRotating(!isThreeRotating)}
                  className={`p-1.5 rounded-xl border transition ${
                    isThreeRotating ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title={isThreeRotating ? 'إيقاف الدوران التلقائي' : 'تشغيل الدوران'}
                >
                  {isThreeRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={threeLightIntensity}
                    onChange={(e) => setThreeLightIntensity(parseFloat(e.target.value))}
                    className="w-16 accent-cyan-400"
                    title="شدة إضاءة الاستوديو"
                  />
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleExportThreeSnapshot}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
                    title="تصدير لقطة بجودة فائقة"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل PNG</span>
                  </button>

                  <button
                    onClick={handleSaveThreeToDrive}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                    title="حفظ المشهد في Google Drive"
                  >
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>حفظ في Drive</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. FABRIC.JS 2D VECTOR & GRAPHIC DESIGN STUDIO */}
      {/* ============================================================== */}
      {activeEngine === 'fabric' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Studio Toolbar Header */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Shape Insertion */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">إدراج أشكال متجهة:</span>
              <button
                onClick={() => addFabricShape('rect')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title="مستطيل / كرت"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => addFabricShape('circle')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title="دائرة متجهة"
              >
                <CircleIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => addFabricShape('triangle')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title="مثلث"
              >
                <TriangleIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => addFabricShape('star')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700"
                title="نجمة خماسية"
              >
                <StarIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => addFabricShape('badge')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold"
                title="شارة كبسولية"
              >
                شارة دائرية
              </button>
            </div>

            {/* Typography insertion */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">الطباعة والنصوص:</span>
              <button
                onClick={() => addFabricText('title')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700"
              >
                <Type className="w-4 h-4 text-cyan-400" />
                <span>عنوان</span>
              </button>
              <button
                onClick={() => addFabricText('body')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                نص فرعي
              </button>
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">لون الملء:</span>
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                title="اختر لون العنصر"
              />
              <span className="text-slate-400 font-medium mr-2">لون الفرشاة:</span>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                title="اختر لون الفرشاة"
              />
            </div>

            {/* Drawing Mode / Select Mode */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTool('select')}
                className={`p-1.5 rounded-lg transition ${
                  activeTool === 'select' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="أداة التحديد والتحريك"
              >
                <Move className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTool('brush')}
                className={`p-1.5 rounded-lg transition ${
                  activeTool === 'brush' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="أداة الرسم الحر (الفرشاة)"
              >
                <Brush className="w-4 h-4" />
              </button>
            </div>

            {/* Aspect Ratio Presets */}
            <div className="flex items-center gap-1">
              {(['16:9', '1:1', '9:16'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setCanvasAspect(ratio)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono transition ${
                    canvasAspect === ratio
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            {/* Layer & Export controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleLayerOrder('top')}
                disabled={!selectedFabricObj}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                title="إحضار للمقدمة"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleLayerOrder('bottom')}
                disabled={!selectedFabricObj}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                title="إرسال للخلف"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={handleDuplicateSelected}
                disabled={!selectedFabricObj}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                title="مضاعفة العنصر"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={!selectedFabricObj}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 disabled:opacity-40 text-rose-300"
                title="حذف العنصر المحدد"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportFabricImage}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
                title="تصدير صورة PNG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>

              <button
                onClick={handleExportFabricSvg}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold"
                title="تصدير رسم متجهي SVG"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>SVG</span>
              </button>

              <button
                onClick={handleSaveFabricToDrive}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                title="حفظ في Google Drive"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Drive</span>
              </button>
            </div>
          </div>

          {/* 2D Canvas Workspace Area */}
          <div className="flex items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 min-h-[520px] overflow-auto">
            <div className="relative shadow-2xl rounded-xl overflow-hidden border border-slate-700/80">
              <canvas ref={fabricCanvasRef} />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. GLSL RAYMARCHING SHADER REALTIME ENGINE */}
      {/* ============================================================== */}
      {activeEngine === 'glsl' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Presets and Status Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">شيدرز جاهزة فائقة السرعة:</span>
              {[
                { id: 'synthwave', label: 'Synthwave Sun & Grid' },
                { id: 'mandelbulb', label: 'Mandelbulb 3D Fractal' },
                { id: 'plasma', label: 'Liquid Plasma Wave' },
                { id: 'wormhole', label: 'Quantum Wormhole' },
                { id: 'chrome', label: 'Molten Chrome Metal' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectShaderPreset(p.id)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    selectedShaderPreset === p.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>FPS: {glslFps}</span>
              </div>

              <button
                onClick={handleRecompileGlsl}
                disabled={isGlslCompiling}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold transition shadow-md"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>تحديث الشيدر (Compile)</span>
              </button>
            </div>
          </div>

          {/* Error Banner if any */}
          {shaderError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 font-mono whitespace-pre-wrap">
              {shaderError}
            </div>
          )}

          {/* Screen & Code Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Viewport Canvas */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl flex items-center justify-center">
              <canvas ref={glslCanvasRef} width={800} height={450} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-white/10">
                GLSL 300 ES • Raymarched Fragment
              </div>
            </div>

            {/* Live Code Editor */}
            <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>fragment_shader.glsl</span>
                <span>Uniforms: u_time, u_resolution</span>
              </div>
              <textarea
                value={customGlslCode}
                onChange={(e) => setCustomGlslCode(e.target.value)}
                spellCheck={false}
                rows={18}
                className="flex-1 w-full p-4 bg-slate-950 text-cyan-300 font-mono text-xs leading-relaxed outline-none resize-none selection:bg-cyan-500/30"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. D3 & ALGORITHMIC GENERATIVE ART ENGINE */}
      {/* ============================================================== */}
      {activeEngine === 'generative' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">النمط التوليدي:</span>
              <button
                onClick={() => setGenPreset('flowfield')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  genPreset === 'flowfield'
                    ? 'bg-cyan-600 text-white font-bold shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                حقل انسياب الجزيئات (Flow Field)
              </button>
              <button
                onClick={() => setGenPreset('girih')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  genPreset === 'girih'
                    ? 'bg-cyan-600 text-white font-bold shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                الهندسة الإسلامية الفلكية (Girih)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">لوحة الألوان:</span>
              {(['cyber', 'gold', 'neon', 'fire'] as const).map((pal) => (
                <button
                  key={pal}
                  onClick={() => setGenColorPalette(pal)}
                  className={`px-2.5 py-1 rounded-xl uppercase font-mono text-[11px] transition ${
                    genColorPalette === pal
                      ? 'bg-slate-700 text-cyan-300 border border-cyan-400 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {pal}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">السرعة:</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={genSpeed}
                  onChange={(e) => setGenSpeed(parseFloat(e.target.value))}
                  className="w-16 accent-cyan-400"
                />
              </div>

              <button
                onClick={() => setIsGenRunning(!isGenRunning)}
                className={`p-1.5 rounded-xl border transition ${
                  isGenRunning ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title={isGenRunning ? 'إيقاف مؤقت' : 'استئناف'}
              >
                {isGenRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Generative Canvas Viewport */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center p-2">
            <canvas ref={genCanvasRef} className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
