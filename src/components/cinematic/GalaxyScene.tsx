import { useEffect, useRef } from "react";
import * as THREE from "three";

interface GalaxySceneProps {
  /** 0 = deep space, 1 = arrived at Earth, 2 = sunrise warmth */
  phase: number;
}

/**
 * Volumetric layered galaxy: thousands of stars across 3 depth layers,
 * nebula clouds via additive sprites, drifting dust, distant planet,
 * cinematic camera drift. Phase morphs scene from cosmic -> earth -> sunrise.
 */
export function GalaxyScene({ phase }: GalaxySceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030f, 0.0008);

    const camera = new THREE.PerspectiveCamera(
      62,
      window.innerWidth / window.innerHeight,
      0.1,
      4000,
    );
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ---------- Star sprite (soft glow) ----------
    const makeStarTexture = (color: string) => {
      const size = 128;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, color);
      g.addColorStop(0.2, color.replace("1)", "0.8)"));
      g.addColorStop(0.5, color.replace("1)", "0.15)"));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    const starTexWhite = makeStarTexture("rgba(255,255,255,1)");
    const starTexBlue = makeStarTexture("rgba(170,200,255,1)");
    const starTexGold = makeStarTexture("rgba(255,220,160,1)");

    // ---------- Layer 1: tiny background stars ----------
    const makeStarLayer = (count: number, radius: number, size: number, tex: THREE.Texture, opacity: number) => {
      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = radius * (0.5 + Math.random() * 0.5);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
      }
      geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        size,
        map: tex,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      return new THREE.Points(geom, mat);
    };

    const stars1 = makeStarLayer(2500, 1500, 2.2, starTexWhite, 0.9);
    const stars2 = makeStarLayer(1200, 900, 4, starTexBlue, 0.85);
    const stars3 = makeStarLayer(400, 500, 8, starTexGold, 0.95);
    scene.add(stars1, stars2, stars3);

    // ---------- Nebula clouds (sprites) ----------
    const makeNebulaTex = (hue: string) => {
      const size = 512;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, hue.replace("A", "0.55"));
      g.addColorStop(0.4, hue.replace("A", "0.18"));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    };

    const nebulaColors = [
      "rgba(120,80,255,A)",
      "rgba(255,90,180,A)",
      "rgba(80,160,255,A)",
      "rgba(200,120,255,A)",
      "rgba(255,180,120,A)",
    ];
    const nebulae: THREE.Sprite[] = [];
    for (let i = 0; i < 22; i++) {
      const tex = makeNebulaTex(nebulaColors[i % nebulaColors.length]);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.35 + Math.random() * 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const s = new THREE.Sprite(mat);
      const r = 300 + Math.random() * 700;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      s.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.6,
        r * Math.cos(phi) - 200,
      );
      const scale = 280 + Math.random() * 380;
      s.scale.set(scale, scale, 1);
      scene.add(s);
      nebulae.push(s);
    }

    // ---------- Cosmic dust ----------
    const dustGeom = new THREE.BufferGeometry();
    const dustCount = 600;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 600;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 400;
      dustPos[i * 3 + 2] = -Math.random() * 800;
    }
    dustGeom.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(
      dustGeom,
      new THREE.PointsMaterial({
        size: 1.2,
        map: starTexWhite,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    scene.add(dust);

    // ---------- Distant planet (Earth-ish) ----------
    const planetGroup = new THREE.Group();
    const planetGeom = new THREE.SphereGeometry(40, 64, 64);

    const earthCanvas = document.createElement("canvas");
    earthCanvas.width = 512;
    earthCanvas.height = 256;
    const ec = earthCanvas.getContext("2d")!;
    const grad = ec.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#1a3a6e");
    grad.addColorStop(0.5, "#2563a8");
    grad.addColorStop(1, "#0f2547");
    ec.fillStyle = grad;
    ec.fillRect(0, 0, 512, 256);
    // continents
    ec.fillStyle = "#3a6b3a";
    for (let i = 0; i < 40; i++) {
      ec.beginPath();
      ec.ellipse(
        Math.random() * 512,
        Math.random() * 256,
        15 + Math.random() * 50,
        8 + Math.random() * 30,
        Math.random() * Math.PI,
        0,
        Math.PI * 2,
      );
      ec.fill();
    }
    // city lights tiny dots
    ec.fillStyle = "rgba(255,220,140,0.9)";
    for (let i = 0; i < 80; i++) {
      ec.fillRect(Math.random() * 512, Math.random() * 256, 1.5, 1.5);
    }
    const earthTex = new THREE.CanvasTexture(earthCanvas);
    earthTex.colorSpace = THREE.SRGBColorSpace;

    const planetMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      emissive: new THREE.Color(0x112244),
      emissiveIntensity: 0.3,
      roughness: 0.9,
      metalness: 0.1,
    });
    const planet = new THREE.Mesh(planetGeom, planetMat);
    planetGroup.add(planet);

    // atmosphere glow
    const atmoGeom = new THREE.SphereGeometry(43, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { c: { value: 0.6 }, p: { value: 3.5 } },
      vertexShader: `
        varying vec3 vN; varying vec3 vP;
        void main(){ vN = normalize(normalMatrix * normal); vP = normalize(-(modelViewMatrix * vec4(position,1.)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
      `,
      fragmentShader: `
        uniform float c; uniform float p; varying vec3 vN; varying vec3 vP;
        void main(){
          float intensity = pow(c - dot(vN, vP), p);
          vec3 col = mix(vec3(0.3,0.55,1.0), vec3(0.7,0.8,1.0), intensity);
          gl_FragColor = vec4(col, intensity);
        }
      `,
    });
    const atmo = new THREE.Mesh(atmoGeom, atmoMat);
    planetGroup.add(atmo);

    planetGroup.position.set(0, -10, -350);
    planetGroup.scale.setScalar(0);
    scene.add(planetGroup);

    const sunLight = new THREE.DirectionalLight(0xfff0d0, 1.6);
    sunLight.position.set(200, 80, 100);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x1a1a3a, 0.4));

    // sunrise warm light (off until phase 2)
    const warmLight = new THREE.DirectionalLight(0xffb070, 0);
    warmLight.position.set(-100, -50, 200);
    scene.add(warmLight);

    // ---------- Shooting stars ----------
    const shootingStars: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
    const spawnShooting = () => {
      const geom = new THREE.SphereGeometry(0.4, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const m = new THREE.Mesh(geom, mat);
      m.position.set((Math.random() - 0.5) * 400, 100 + Math.random() * 60, -200 - Math.random() * 200);
      shootingStars.push({
        mesh: m,
        vel: new THREE.Vector3(-2 - Math.random() * 1.5, -1.5 - Math.random(), 1.5),
        life: 1,
      });
      scene.add(m);
    };

    // ---------- Animate ----------
    const startTime = performance.now();
    let smoothedPhase = 0;
    let frame = 0;
    let raf = 0;

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    let mouseX = 0,
      mouseY = 0;
    const onMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    const animate = () => {
      raf = requestAnimationFrame(animate);
      frame++;
      const t = (performance.now() - startTime) / 1000;

      // ease toward target phase for buttery transitions between scenes
      const targetPhase = phaseRef.current;
      smoothedPhase += (targetPhase - smoothedPhase) * 0.025;
      const p = smoothedPhase; // 0 → ~2

      // Continuous cinematic camera path driven by phase + slow time drift.
      // 0.0  universe opening   — slow forward drift, far from anything
      // 0.3  galaxy journey     — accelerating through stars
      // 0.7  approaching Earth  — pulls back slightly to frame the planet
      // 1.0  India landing      — banks down and zooms toward planet surface
      // 1.3+ her world / photos — camera settles, gentle sway
      // 2.0  sunrise            — soft rise, warm light
      const journeyZ = -t * 4 - p * 220;
      const landingPull = p > 0.9 ? Math.min((p - 0.9) * 1.2, 0.4) : 0;
      const cameraTargetX = mouseX * 6 + Math.sin(t * 0.15) * 4;
      const cameraTargetY = -mouseY * 4 + Math.cos(t * 0.1) * 2 - landingPull * 8;

      camera.position.x += (cameraTargetX - camera.position.x) * 0.03;
      camera.position.y += (cameraTargetY - camera.position.y) * 0.03;
      camera.position.z = journeyZ;

      // Bank slightly during the Earth approach — feels like a flight path
      const bank = THREE.MathUtils.clamp((p - 0.6) * 0.4, 0, 0.18);
      camera.rotation.z = -bank * 0.5;

      // Look-at point shifts down toward Earth as we land
      const lookY = -landingPull * 12;
      camera.lookAt(camera.position.x * 0.3, lookY, camera.position.z - 100);

      // star rotation
      stars1.rotation.y = t * 0.005;
      stars2.rotation.y = -t * 0.008;
      stars3.rotation.y = t * 0.012;

      // nebula slow drift — fade out as we approach Earth
      nebulae.forEach((n, i) => {
        n.material.opacity = (0.3 + Math.sin(t * 0.3 + i) * 0.1) * Math.max(0, 1 - p * 0.55);
      });

      // dust drift — speed scales with phase to imply forward motion
      const dustSpeed = 0.6 + p * 1.4;
      const dpos = dust.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < dustCount; i++) {
        const idx = i * 3 + 2;
        dpos.array[idx] = (dpos.array[idx] as number) + dustSpeed;
        if ((dpos.array[idx] as number) > 200) {
          dpos.array[idx] = -800;
        }
      }
      dpos.needsUpdate = true;

      // Earth grows in smoothly from phase 0.45, large at landing (1.0)
      const earthGrow = THREE.MathUtils.clamp((p - 0.45) * 1.6, 0, 1);
      const targetScale = earthGrow * (1 + Math.max(0, p - 1) * 1.2);
      planetGroup.scale.setScalar(
        planetGroup.scale.x + (targetScale - planetGroup.scale.x) * 0.05,
      );
      planet.rotation.y += 0.0015;
      // Earth tracks just ahead of the camera so it feels like we're flying toward it
      const earthOffsetZ = -180 - Math.max(0, 1 - p) * 200 + Math.max(0, p - 1) * 80;
      planetGroup.position.z = camera.position.z + earthOffsetZ;
      planetGroup.position.y = -10 - landingPull * 6;

      // sunrise warmth in phase 2
      const warmTarget = Math.max(0, (p - 1.5) * 2);
      warmLight.intensity += (warmTarget * 1.5 - warmLight.intensity) * 0.04;
      sunLight.intensity += (1.6 - warmTarget * 1.2 - sunLight.intensity) * 0.04;
      scene.fog!.color.setRGB(
        0.02 + warmTarget * 0.6,
        0.015 + warmTarget * 0.35,
        0.06 - warmTarget * 0.04,
      );

      // shooting stars
      if (frame % 220 === 0 && Math.random() > 0.4) spawnShooting();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.mesh.position.add(s.vel);
        s.life -= 0.012;
        (s.mesh.material as THREE.MeshBasicMaterial).opacity = s.life;
        (s.mesh.material as THREE.MeshBasicMaterial).transparent = true;
        if (s.life <= 0) {
          scene.remove(s.mesh);
          shootingStars.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(ellipse at center, oklch(0.06 0.05 280) 0%, oklch(0.02 0.02 270) 70%, oklch(0 0 0) 100%)",
      }}
    />
  );
}
