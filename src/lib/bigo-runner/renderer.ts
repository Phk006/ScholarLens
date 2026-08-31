import * as THREE from "three";
import { RUN_TUNING, velocityAt } from "./types";
import type { GateSpawn, ObstacleSpawn, SpawnItem } from "./engine";

// Pseudo-3D constants
const FOCAL = 65;
const HORIZON_FRAC = 0.38;
const PPU = 40; // pixels per world unit at z=0
const MIN_SCALE = 0.06;
const MAX_Z = 260;
const CULL_BEHIND = -2;

// Colors
const COLORS = {
  trackBase: 0x1a1a2e,
  laneStripe: 0x4a4a6a,
  laneStripeCenter: 0x6a6a8a,
  player: 0x00d4ff,
  playerGlow: 0x0066ff,
  gateBase: 0x333355,
  gateCorrect: 0x00e676,
  gateWrong: 0xff1744,
  gateText: 0xffffff,
  obstacleBarrier: 0xff6b35,
  obstacleLowbar: 0xffb627,
  obstacleTrain: 0xe63946,
  copFar: 0x661111,
  copMid: 0xcc2222,
  copClose: 0xff3333,
  background: 0x0a0a1a,
  bits: 0xffd700,
  powerup: 0xaa44ff,
};

export interface RenderedGate {
  gate: GateSpawn;
  group: THREE.Group;
  panels: THREE.Mesh[];
  textSprites: THREE.Sprite[];
}

export interface RenderedObstacle {
  obstacle: ObstacleSpawn;
  mesh: THREE.Mesh;
}

export class GameRenderer {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;

  // World root
  worldRoot: THREE.Group;

  // Track
  trackMeshes: THREE.Mesh[] = [];

  // Player
  playerMesh!: THREE.Group;
  playerLane = 1; // center
  playerTargetX = 0;
  playerSwitchTween = 0;
  playerSwitchFrom = 0;
  playerSwitchTo = 0;
  isSwitching = false;
  isJumping = false;
  jumpProgress = 0;
  playerY = 0;

  // Lanes visual
  laneHelpers: THREE.Mesh[] = [];

  // Rendered objects
  renderedGates: RenderedGate[] = [];
  renderedObstacles: RenderedObstacle[] = [];

  // Cop
  copMesh!: THREE.Group;
  copPips = 3;

  // Effects
  screenShake = 0;
  shakeIntensity = 0;
  vignetteIntensity = 0;

  // Dimensions
  width: number;
  height: number;

  // Disposed flag
  disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.background);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 500);
    this.camera.position.set(0, 3, -5);
    this.camera.lookAt(0, 1, 10);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false;

    // World root
    this.worldRoot = new THREE.Group();
    this.scene.add(this.worldRoot);

    // Lighting
    const ambient = new THREE.AmbientLight(0x404060, 1.5);
    this.scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(0, 10, -5);
    this.scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x4488ff, 1, 50);
    pointLight.position.set(0, 5, 0);
    this.scene.add(pointLight);

    // Build track
    this.buildTrack();

    // Build player
    this.buildPlayer();

    // Build cop
    this.buildCop();
  }

  private buildTrack() {
    // Ground plane extending far
    const groundGeo = new THREE.PlaneGeometry(20, 300);
    const groundMat = new THREE.MeshLambertMaterial({
      color: COLORS.trackBase,
      side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.01, 100);
    this.worldRoot.add(ground);
    this.trackMeshes.push(ground);

    // Lane stripes
    const stripeGeo = new THREE.PlaneGeometry(0.08, 280);
    const stripeMat = new THREE.MeshLambertMaterial({
      color: COLORS.laneStripe,
      transparent: true,
      opacity: 0.6,
    });

    // Left lane line (between lane 0 and 1)
    const leftStripe = new THREE.Mesh(stripeGeo, stripeMat);
    leftStripe.rotation.x = -Math.PI / 2;
    leftStripe.position.set(-1, 0.01, 100);
    this.worldRoot.add(leftStripe);

    // Right lane line (between lane 1 and 2)
    const rightStripe = new THREE.Mesh(stripeGeo, stripeMat);
    rightStripe.rotation.x = -Math.PI / 2;
    rightStripe.position.set(1, 0.01, 100);
    this.worldRoot.add(rightStripe);

    // Center line (dashed feel via brighter color)
    const centerMat = new THREE.MeshLambertMaterial({
      color: COLORS.laneStripeCenter,
      transparent: true,
      opacity: 0.4,
    });

    // Side rails
    const railGeo = new THREE.BoxGeometry(0.12, 0.6, 280);
    const railMat = new THREE.MeshLambertMaterial({ color: 0x555577 });
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-3.2, 0.3, 100);
    this.worldRoot.add(leftRail);
    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(3.2, 0.3, 100);
    this.worldRoot.add(rightRail);

    // Distant grid lines for depth feel
    for (let z = 10; z < 200; z += 8) {
      const lineGeo = new THREE.PlaneGeometry(6.4, 0.02);
      const lineMat = new THREE.MeshLambertMaterial({
        color: 0x333355,
        transparent: true,
        opacity: 0.3,
      });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.02, z);
      this.worldRoot.add(line);
    }
  }

  private buildPlayer() {
    this.playerMesh = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.8, 1.4, 0.6);
    const bodyMat = new THREE.MeshLambertMaterial({ color: COLORS.player });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    this.playerMesh.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.3, 8, 6);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.6;
    this.playerMesh.add(head);

    // Glow ring
    const glowGeo = new THREE.RingGeometry(0.5, 0.7, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: COLORS.playerGlow,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.02;
    this.playerMesh.add(glow);

    this.playerMesh.position.set(0, 0, 0);
    this.worldRoot.add(this.playerMesh);
  }

  private buildCop() {
    const copGroup = new THREE.Group();

    // Body (larger, menacing)
    const bodyGeo = new THREE.BoxGeometry(1.0, 1.8, 0.7);
    const bodyMat = new THREE.MeshLambertMaterial({ color: COLORS.copFar });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    copGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.35, 8, 6);
    const headMat = new THREE.MeshLambertMaterial({ color: 0x884422 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.0;
    copGroup.add(head);

    // Hat
    const hatGeo = new THREE.CylinderGeometry(0.25, 0.4, 0.2, 8);
    const hatMat = new THREE.MeshLambertMaterial({ color: 0x222244 });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 2.35;
    copGroup.add(hat);

    this.copMesh = copGroup as unknown as THREE.Group;
    this.copMesh.position.set(0, 0, -20);
    this.worldRoot.add(this.copMesh);
  }

  // Get screen position from world coords
  screenPos(x: number, z: number): { x: number; y: number; scale: number } {
    const scale = Math.max(FOCAL / (FOCAL + z), MIN_SCALE);
    const screenX = this.width / 2 + x * scale * PPU;
    const screenY =
      this.height * HORIZON_FRAC + (this.height - this.height * HORIZON_FRAC) * scale;
    return { x: screenX, y: screenY, scale };
  }

  // Spawn a gate visually
  spawnGate(gate: GateSpawn) {
    const group = new THREE.Group();
    const panels: THREE.Mesh[] = [];
    const textSprites: THREE.Sprite[] = [];

    for (let i = 0; i < 3; i++) {
      const x = RUN_TUNING.laneCenters[i];

      // Panel
      const panelGeo = new THREE.BoxGeometry(1.6, 2.0, 0.15);
      const panelMat = new THREE.MeshLambertMaterial({
        color: COLORS.gateBase,
        transparent: true,
        opacity: 0.85,
      });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(x, 1.0, gate.z);
      this.worldRoot.add(panel);
      panels.push(panel);

      // Text label using sprite
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "rgba(30,30,50,0.9)";
      ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const text = gate.shuffledOptions[i].text;
      ctx.fillText(text, 128, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(x, 1.0, gate.z);
      sprite.scale.set(1.8, 0.9, 1);
      this.worldRoot.add(sprite);
      textSprites.push(sprite);
    }

    // Boss indicator
    if (gate.boss) {
      const bossCanvas = document.createElement("canvas");
      bossCanvas.width = 256;
      bossCanvas.height = 64;
      const ctx = bossCanvas.getContext("2d")!;
      ctx.fillStyle = "#ff6600";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText("⚡ BOSS GATE ⚡", 128, 32);

      const bossTex = new THREE.CanvasTexture(bossCanvas);
      const bossMat = new THREE.SpriteMaterial({ map: bossTex, transparent: true });
      const bossSprite = new THREE.Sprite(bossMat);
      bossSprite.position.set(0, 3.0, gate.z);
      bossSprite.scale.set(3.0, 0.8, 1);
      this.worldRoot.add(bossSprite);
    }

    this.renderedGates.push({ gate, group, panels, textSprites });
  }

  // Spawn an obstacle visually
  spawnObstacle(obs: ObstacleSpawn) {
    const x = RUN_TUNING.laneCenters[obs.lane];
    let geo: THREE.BufferGeometry;
    let mat: THREE.MeshLambertMaterial;
    let height = 1.0;

    switch (obs.variant) {
      case "barrier":
        geo = new THREE.BoxGeometry(1.4, 1.8, 0.6);
        mat = new THREE.MeshLambertMaterial({ color: COLORS.obstacleBarrier });
        height = 1.8;
        break;
      case "lowbar":
        geo = new THREE.BoxGeometry(2.0, 0.6, 0.4);
        mat = new THREE.MeshLambertMaterial({ color: COLORS.obstacleLowbar });
        height = 0.6;
        break;
      case "train":
        geo = new THREE.BoxGeometry(1.4, 2.4, 3.0);
        mat = new THREE.MeshLambertMaterial({ color: COLORS.obstacleTrain });
        height = 2.4;
        break;
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height / 2, obs.z);
    this.worldRoot.add(mesh);
    this.renderedObstacles.push({ obstacle: obs, mesh });
  }

  // Update gate panel colors on answer
  resolveGate(gateId: string, correctLane: number, chosenLane: number) {
    const rendered = this.renderedGates.find((g) => g.gate.id === gateId);
    if (!rendered) return;

    for (let i = 0; i < 3; i++) {
      const panel = rendered.panels[i];
      const mat = panel.material as THREE.MeshLambertMaterial;
      if (i === correctLane) {
        mat.color.setHex(COLORS.gateCorrect);
        mat.opacity = 1.0;
      } else if (i === chosenLane && chosenLane !== correctLane) {
        mat.color.setHex(COLORS.gateWrong);
        mat.opacity = 1.0;
      } else {
        mat.opacity = 0.3;
      }
    }
  }

  // Update player position
  updatePlayer(laneIndex: number, tweenProgress: number, playerZ: number) {
    const targetX = RUN_TUNING.laneCenters[laneIndex];

    if (this.isSwitching) {
      const t = Math.min(tweenProgress, 1.0);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      this.playerMesh.position.x =
        this.playerSwitchFrom + (this.playerSwitchTo - this.playerSwitchFrom) * eased;
    } else {
      this.playerMesh.position.x = targetX;
    }

    this.playerMesh.position.z = playerZ;

    // Jump arc
    if (this.isJumping) {
      this.jumpProgress += 0.03;
      this.playerY = Math.sin(this.jumpProgress * Math.PI) * 2.0;
      if (this.jumpProgress >= 1.0) {
        this.isJumping = false;
        this.playerY = 0;
      }
    }
    this.playerMesh.position.y = this.playerY;

    // Lean into turns
    if (this.isSwitching) {
      const leanDir = this.playerSwitchTo > this.playerSwitchFrom ? 0.15 : -0.15;
      this.playerMesh.rotation.z = leanDir * (1 - tweenProgress);
    } else {
      this.playerMesh.rotation.z *= 0.9; // ease back
    }
  }

  // Update cop position based on pips
  updateCop(playerZ: number, pips: number) {
    this.copPips = pips;

    // Cop position relative to player
    let copZ: number;
    const copMat = (this.copMesh.children[0] as THREE.Mesh).material as THREE.MeshLambertMaterial;

    switch (pips) {
      case 3:
        copZ = playerZ - 25;
        copMat.color.setHex(COLORS.copFar);
        this.copMesh.scale.setScalar(0.5);
        break;
      case 2:
        copZ = playerZ - 15;
        copMat.color.setHex(COLORS.copMid);
        this.copMesh.scale.setScalar(0.7);
        break;
      case 1:
        copZ = playerZ - 8;
        copMat.color.setHex(COLORS.copClose);
        this.copMesh.scale.setScalar(0.9);
        break;
      default:
        copZ = playerZ - 3;
        copMat.color.setHex(COLORS.copClose);
        this.copMesh.scale.setScalar(1.1);
    }

    // Smooth cop approach
    this.copMesh.position.z +=
      (copZ - this.copMesh.position.z) * 0.05;

    // Bobbing animation
    this.copMesh.position.y =
      Math.sin(Date.now() * 0.005) * 0.1 + 0.1;
  }

  // Render one frame
  render(playerZ: number) {
    if (this.disposed) return;

    // Position camera to follow player
    const targetCamZ = playerZ - 4;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.1;
    this.camera.position.x = this.playerMesh.position.x * 0.2;

    // Screen shake
    if (this.screenShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.screenShake -= 0.05;
    }

    this.camera.lookAt(
      this.playerMesh.position.x * 0.3,
      1.5,
      playerZ + 15,
    );

    // Remove far-behind objects
    this.cleanupObjects(playerZ);

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  private cleanupObjects(playerZ: number) {
    // Remove gates that are far behind
    for (let i = this.renderedGates.length - 1; i >= 0; i--) {
      const rg = this.renderedGates[i];
      if (rg.gate.z < playerZ - 20) {
        for (const panel of rg.panels) {
          this.worldRoot.remove(panel);
          panel.geometry.dispose();
          (panel.material as THREE.Material).dispose();
        }
        for (const sprite of rg.textSprites) {
          this.worldRoot.remove(sprite);
          (sprite.material as THREE.SpriteMaterial).map?.dispose();
          sprite.material.dispose();
        }
        this.renderedGates.splice(i, 1);
      }
    }

    // Remove obstacles that are far behind
    for (let i = this.renderedObstacles.length - 1; i >= 0; i--) {
      const ro = this.renderedObstacles[i];
      if (ro.obstacle.z < playerZ - 20) {
        this.worldRoot.remove(ro.mesh);
        ro.mesh.geometry.dispose();
        (ro.mesh.material as THREE.Material).dispose();
        this.renderedObstacles.splice(i, 1);
      }
    }
  }

  triggerShake(intensity: number) {
    this.screenShake = 1.0;
    this.shakeIntensity = intensity;
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose() {
    this.disposed = true;
    this.renderer.dispose();
  }
}
