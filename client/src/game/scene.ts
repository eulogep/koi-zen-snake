import { Camera } from "@babylonjs/core/Cameras/camera";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Cell, Flower, KoiSnapshot } from "./koiGame";

export interface GameSceneHandle {
  scene: Scene;
  sync(snapshot: KoiSnapshot): void;
  dispose(): void;
}

const material = (scene: Scene, name: string, diffuse: string, emissive = "#000000", alpha = 1) => {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.FromHexString(diffuse);
  mat.emissiveColor = Color3.FromHexString(emissive);
  mat.alpha = alpha;
  mat.specularColor = new Color3(0.02, 0.05, 0.05);
  return mat;
};

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameSceneHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.025, 0.09, 0.11, 1);

  const camera = new FreeCamera("zen-camera", new Vector3(0, 22, 0), scene);
  camera.setTarget(Vector3.Zero());
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  const fitCamera = () => {
    const aspect = Math.max(0.65, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    const height = 20.6;
    camera.orthoTop = height / 2;
    camera.orthoBottom = -height / 2;
    camera.orthoLeft = -(height * aspect) / 2;
    camera.orthoRight = (height * aspect) / 2;
  };
  fitCamera();

  const light = new HemisphericLight("moon-light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.82;
  light.diffuse = Color3.FromHexString("#b9d4c9");
  light.groundColor = Color3.FromHexString("#123138");

  const water = MeshBuilder.CreateGround("water", { width: 28, height: 21 }, scene);
  water.material = material(scene, "water-material", "#124650", "#082a32");

  const ink = material(scene, "grid-lines", "#2a6870", "#1b4f57", 0.38);
  for (let x = -12; x <= 12; x += 1) {
    const line = MeshBuilder.CreateLines(`grid-x-${x}`, { points: [new Vector3(x, 0.035, -9), new Vector3(x, 0.035, 9)] }, scene);
    line.color = Color3.FromHexString("#2a6870");
    line.alpha = 0.16;
  }
  for (let z = -9; z <= 9; z += 1) {
    const line = MeshBuilder.CreateLines(`grid-z-${z}`, { points: [new Vector3(-12, 0.035, z), new Vector3(12, 0.035, z)] }, scene);
    line.color = Color3.FromHexString("#2a6870");
    line.alpha = 0.16;
  }
  void ink;

  const stone = material(scene, "stone", "#49686a", "#172e31");
  const moss = material(scene, "moss", "#6c836e", "#253b32");
  const rockPositions = [
    [-13.1, -9.3, 1.25], [-10.4, -9.55, 0.9], [-7.5, -9.3, 0.7], [-3.4, -9.5, 1.1], [0.2, -9.4, 0.75], [4.2, -9.55, 1.05], [8.4, -9.3, 0.72], [12.4, -9.5, 1.2],
    [-13.2, 9.3, 0.8], [-10.1, 9.55, 1.1], [-6.2, 9.35, 0.72], [-2.8, 9.5, 1.25], [1.2, 9.4, 0.72], [5.1, 9.5, 1.05], [9.3, 9.3, 0.75], [12.7, 9.45, 1.1],
    [-13.35, -6.3, 0.75], [-13.45, -2.4, 1.05], [-13.35, 1.8, 0.7], [-13.4, 5.4, 1.0], [13.35, -6.1, 0.7], [13.4, -1.9, 1.0], [13.35, 2.5, 0.75], [13.4, 6.1, 1.05],
  ];
  rockPositions.forEach(([x, z, scale], index) => {
    const rock = MeshBuilder.CreateSphere(`rock-${index}`, { diameter: scale, segments: 8 }, scene);
    rock.position = new Vector3(x, 0.18, z);
    rock.scaling.y = 0.45;
    rock.material = index % 4 === 0 ? moss : stone;
  });

  const koiMaterial = material(scene, "koi-orange", "#e66f47", "#552719");
  const koiCream = material(scene, "koi-cream", "#f5dfbd", "#4a3829");
  const eyeMaterial = material(scene, "koi-eye", "#160d0a", "#050303");
  const lotusPink = material(scene, "lotus-pink", "#d89aa0", "#5e2d38");
  const lotusGold = material(scene, "lotus-gold", "#e3be67", "#6b4b1f");
  const rippleMaterial = material(scene, "ripple", "#9dcfc5", "#2e7f80", 0.55);
  rippleMaterial.backFaceCulling = false;

  const segmentMeshes: Mesh[] = [];
  let eyeMesh: Mesh | null = null;
  const foodMeshes: Mesh[] = [];
  const rippleMeshes: { mesh: Mesh; life: number }[] = [];
  let lastSnakeLength = 0;
  let previousFoodKey = "";

  const cellToWorld = (cell: Cell) => new Vector3(cell.x - 11.5, 0.27, cell.y - 8.5);
  const clearMeshArray = (items: Mesh[]) => items.splice(0).forEach((mesh) => mesh.dispose());

  const createFood = (flower: Flower) => {
    clearMeshArray(foodMeshes);
    const center = cellToWorld(flower);
    const palette = flower.type === "gold" ? lotusGold : flower.type === "pink" ? lotusPink : koiCream;
    const petals = flower.type === "gold" ? 8 : flower.type === "pink" ? 6 : 5;
    const diameter = flower.type === "gold" ? 0.56 : flower.type === "pink" ? 0.5 : 0.44;
    for (let i = 0; i < petals; i += 1) {
      const angle = (Math.PI * 2 * i) / petals;
      const petal = MeshBuilder.CreateCylinder(`petal-${i}`, { diameter: 0.5, height: 0.08, tessellation: 12 }, scene);
      petal.scaling.x = diameter / 0.5;
      petal.scaling.z = diameter / 0.5;
      petal.position = center.add(new Vector3(Math.cos(angle) * 0.28, 0.02, Math.sin(angle) * 0.28));
      petal.material = palette;
      foodMeshes.push(petal);
    }
    const centerMesh = MeshBuilder.CreateCylinder("lotus-center", { diameter: 0.34, height: 0.14, tessellation: 12 }, scene);
    centerMesh.position = center.add(new Vector3(0, 0.1, 0));
    centerMesh.material = flower.type === "white" ? lotusGold : palette;
    foodMeshes.push(centerMesh);
  };

  const createRipple = (cell: Cell, large = false) => {
    const ring = MeshBuilder.CreateTorus(`ripple-${rippleMeshes.length}`, { diameter: large ? 1.2 : 0.78, thickness: 0.025, tessellation: 32 }, scene);
    ring.position = cellToWorld(cell).add(new Vector3(0, 0.06, 0));
    ring.material = rippleMaterial;
    rippleMeshes.push({ mesh: ring, life: large ? 1.1 : 0.75 });
    while (rippleMeshes.length > 14) rippleMeshes.shift()?.mesh.dispose();
  };

  const sync = (snapshot: KoiSnapshot) => {
    const foodKey = `${snapshot.food.x}:${snapshot.food.y}:${snapshot.food.type}`;
    if (foodKey !== previousFoodKey) {
      createFood(snapshot.food);
      previousFoodKey = foodKey;
    }
    if (snapshot.lastEaten) createRipple(snapshot.snake[0], true);
    if (snapshot.snake.length !== lastSnakeLength) {
      clearMeshArray(segmentMeshes);
      eyeMesh?.dispose();
      eyeMesh = null;
      snapshot.snake.forEach((cell, index) => {
        const segment = MeshBuilder.CreateCylinder(`koi-segment-${index}`, { diameter: index === 0 ? 0.82 : 0.66, height: 0.2, tessellation: 16 }, scene);
        segment.material = index % 4 === 1 ? koiCream : koiMaterial;
        segmentMeshes.push(segment);
        if (index === 0) {
          const eye = MeshBuilder.CreateSphere(`koi-eye-${index}`, { diameter: 0.14, segments: 8 }, scene);
          eye.material = eyeMaterial;
          eye.position = cellToWorld(cell).add(new Vector3(0.23, 0.25, -0.22));
          eyeMesh = eye;
        }
      });
      lastSnakeLength = snapshot.snake.length;
    }
    snapshot.snake.forEach((cell, index) => {
      const mesh = segmentMeshes[index];
      if (mesh) mesh.position = cellToWorld(cell);
    });
    if (eyeMesh && snapshot.snake[0]) eyeMesh.position = cellToWorld(snapshot.snake[0]).add(new Vector3(0.23, 0.25, -0.22));
  };

  scene.onBeforeRenderObservable.add(() => {
    fitCamera();
    const delta = engine.getDeltaTime() / 1000;
    rippleMeshes.forEach((ripple) => {
      ripple.life -= delta;
      ripple.mesh.scaling.x += delta * 0.48;
      ripple.mesh.scaling.z += delta * 0.48;
      ripple.mesh.visibility = Math.max(0, ripple.life);
    });
    for (let i = rippleMeshes.length - 1; i >= 0; i -= 1) {
      if (rippleMeshes[i].life <= 0) rippleMeshes.splice(i, 1)[0].mesh.dispose();
    }
  });

  return {
    scene,
    sync,
    dispose: () => {
      clearMeshArray(segmentMeshes);
      eyeMesh?.dispose();
      clearMeshArray(foodMeshes);
      rippleMeshes.splice(0).forEach((ripple) => ripple.mesh.dispose());
      scene.dispose();
    },
  };
}
