import { Component, ElementRef, OnInit, OnDestroy, ViewChild, NgZone, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-particle-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #rendererContainer class="renderer-container"></div>
  `,
  styles: [`
    .renderer-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
      overflow: hidden;
    }
  `]
})
export class ParticleBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2(-1000, -1000); // Start off-screen

  private frameId: number | null = null;

  // Particle data
  private originalPositions!: Float32Array;
  private positions!: Float32Array;
  private velocities!: Float32Array;
  private count = 3000;

  constructor(private ngZone: NgZone) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
    window.addEventListener('resize', this.onWindowResize);
    document.addEventListener('mousemove', this.onDocumentMouseMove);
  }

  ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('mousemove', this.onDocumentMouseMove);

    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }
  }

  // ... (initThree was deleted, restoring it)
  private initThree(): void {
    const container = this.rendererContainer.nativeElement;

    // Scene
    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.001); // Optional fog

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    this.camera.position.z = 800;

    // Geometry
    const geometry = new THREE.BufferGeometry();

    this.positions = new Float32Array(this.count * 3);
    this.originalPositions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3); // Not strictly used for physics loop below but good for extensions

    const colorPalette = [
      new THREE.Color('#ffffff'), // White
      new THREE.Color('#64ffda'), // Teal/Cyan (Cyberpunk)
      new THREE.Color('#bd34fe'), // Neon Purple
      new THREE.Color('#2979ff')  // Bright Blue
    ];

    for (let i = 0; i < this.count; i++) {
      // Spread particles across a wide volume
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 1500;

      this.positions[i * 3] = x;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = z;

      this.originalPositions[i * 3] = x;
      this.originalPositions[i * 3 + 1] = y;
      this.originalPositions[i * 3 + 2] = z;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material
    const sprite = this.getSprite();
    const material = new THREE.PointsMaterial({
      size: 4,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);
  }

  private getSprite(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
      // Soft Glow
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  private onWindowResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onDocumentMouseMove = (event: MouseEvent): void => {
    // Normalize mouse coordinates for Raycaster
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  private animate(): void {
    this.ngZone.runOutsideAngular(() => {
      this.render();
      this.frameId = requestAnimationFrame(() => this.animate());
    });
  }

  private render(): void {
    // Raycaster to find point in space where mouse is projecting
    this.raycaster.setFromCamera(this.mouse, this.camera);
    // Create a plane at z=0 (or specific depth) to intersect with
    // For simplicity, we assume interaction happens around a certain depth or based on screen projections

    // Simpler Physics Logic:
    // We project the mouse 'ray' into the world. 
    // But for a cloud volume, let's just use the fact that we can interact with particles 'near' the mouse ray.

    const ray = this.raycaster.ray;

    const positions = (this.particles.geometry.attributes['position'] as THREE.BufferAttribute).array as Float32Array;

    for (let i = 0; i < this.count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      const px = positions[ix];
      const py = positions[iy];
      const pz = positions[iz];

      const ox = this.originalPositions[ix];
      const oy = this.originalPositions[iy];
      const oz = this.originalPositions[iz];

      // Calculate distance from particle to the ray line
      // pt - (pt . dir) * dir - origin
      // A simplified approach: Use distance to mouse position projected at particle's Z
      // Project mouse to this particle's Z plane

      const distanceToZ = pz - this.camera.position.z;
      // Screen to World for this Z:
      // But unproject is easier if we have vector.

      // Let's use a simpler heuristic: Calculate distance to line.
      // Ray origin: O, Ray direction: D (normalized)
      // Vector P (particle)
      // Vector OP = P - O
      // Projection of OP onto D: proj = OP . D
      // Closest point on line: C = O + proj * D
      // Distance vec: distVec = P - C
      // dist = length(distVec)

      // We do this math manually for performance
      const dx = px - ray.origin.x;
      const dy = py - ray.origin.y;
      const dz = pz - ray.origin.z;

      // dot product of (P-O) and D
      const dot = dx * ray.direction.x + dy * ray.direction.y + dz * ray.direction.z;

      const cx = ray.origin.x + dot * ray.direction.x;
      const cy = ray.origin.y + dot * ray.direction.y;
      const cz = ray.origin.z + dot * ray.direction.z;

      const distSq = (px - cx) ** 2 + (py - cy) ** 2 + (pz - cz) ** 2;

      const repulsionRadius = 10000; // Squared radius (sqrt(10000) = 100)

      if (distSq < repulsionRadius) {
        // Repel
        const force = (repulsionRadius - distSq) / repulsionRadius; // 0 to 1

        const angleX = px - cx;
        const angleY = py - cy;
        const angleZ = pz - cz;

        positions[ix] += angleX * force * 0.1;
        positions[iy] += angleY * force * 0.1;
        positions[iz] += angleZ * force * 0.1;
      } else {
        // Return to original
        positions[ix] += (ox - px) * 0.05;
        positions[iy] += (oy - py) * 0.05;
        positions[iz] += (oz - pz) * 0.05;
      }
    }

    (this.particles.geometry.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;

    // Slow rotation
    this.particles.rotation.y += 0.0005;

    this.renderer.render(this.scene, this.camera);
  }
}