import {
  Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild,
} from '@angular/core';

const VERTEX = /* glsl */ `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

/**
 * Two layers in one pass:
 *  1. Domain-warped fractal noise ("aurora") tinted with the brand palette.
 *  2. A raymarched, iridescent 3D blob with orbiting satellites that melt into
 *     it (smooth-min SDF). The cursor rotates the object and bends the aurora.
 */
const FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uObject; // xy = screen-space centre (uv units), z = camera distance
out vec4 outColor;

const vec3 BG     = vec3(0.027, 0.024, 0.051);
const vec3 VIOLET = vec3(0.545, 0.361, 0.965);
const vec3 PINK   = vec3(0.957, 0.447, 0.714);
const vec3 CYAN   = vec3(0.133, 0.827, 0.933);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

vec3 aurora(vec2 uv, vec2 m) {
  float t = uTime * 0.05;
  vec2 q = vec2(fbm(uv * 1.3 + t), fbm(uv * 1.3 - t + 3.1));
  vec2 r = vec2(fbm(uv * 1.7 + 2.2 * q + vec2(1.7, 9.2) + t * 1.4 + m * 0.35),
                fbm(uv * 1.7 + 2.2 * q + vec2(8.3, 2.8) - t));
  float f = fbm(uv * 1.5 + 2.4 * r);
  vec3 col = mix(BG, VIOLET * 0.75, smoothstep(0.25, 0.85, f));
  col = mix(col, PINK, smoothstep(0.55, 1.0, r.x) * 0.65);
  col = mix(col, CYAN, smoothstep(0.55, 1.0, q.y) * 0.55);
  return col * (0.35 + 1.1 * f * f);
}

/* ---------------- 3D object ---------------- */
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float map(vec3 p) {
  p.xz *= rot(uTime * 0.22 + (uMouse.x - 0.5) * 2.4);
  p.yz *= rot(uTime * 0.13 - (uMouse.y - 0.5) * 1.6);
  float d = length(p) - 1.0;
  d += 0.11 * sin(3.0 * p.x + uTime) * sin(3.2 * p.y + uTime * 1.3) * sin(2.8 * p.z + uTime * 0.7);
  for (int i = 0; i < 3; i++) {
    float a = uTime * 0.55 + float(i) * 2.094;
    vec3 c = vec3(cos(a) * 1.5, sin(a * 1.3) * 0.55, sin(a) * 1.5);
    d = smin(d, length(p - c) - 0.26, 0.5);
  }
  return d;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy),
                        map(p + e.yxy) - map(p - e.yxy),
                        map(p + e.yyx) - map(p - e.yyx)));
}

// Inigo Quilez cosine palette — gives the oil-slick iridescence.
vec3 palette(float t) {
  return vec3(0.55) + vec3(0.45) * cos(6.2832 * (vec3(1.0) * t + vec3(0.0, 0.33, 0.67)));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0);

  vec3 col = aurora(uv, m);
  col += VIOLET * 0.2 / (length(uv - m) * 3.0 + 0.6);

  // Camera looking at the object, offset on screen by uObject.xy.
  vec3 ro = vec3(0.0, 0.0, uObject.z);
  vec3 rd = normalize(vec3(uv - uObject.xy, -1.6));

  // Cheap bounding-sphere test: only march pixels that can hit the object.
  float b = dot(ro, rd);
  float disc = b * b - dot(ro, ro) + 2.1 * 2.1;
  if (disc > 0.0) {
    float t = max(0.0, -b - sqrt(disc));
    float tMax = -b + sqrt(disc);
    float minD = 1e3;
    bool hit = false;
    for (int i = 0; i < 80; i++) {
      vec3 p = ro + rd * t;
      float d = map(p);
      minD = min(minD, d);
      if (d < 0.001) { hit = true; break; }
      t += d * 0.85;
      if (t > tMax) break;
    }

    if (hit) {
      vec3 p = ro + rd * t;
      vec3 n = calcNormal(p);
      vec3 l = normalize(vec3(0.6, 0.8, 0.7));
      float diff = max(dot(n, l), 0.0);
      float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
      float spec = pow(max(dot(reflect(rd, n), l), 0.0), 48.0);

      vec3 irid = palette(dot(n, -rd) * 0.9 + n.y * 0.25 + uTime * 0.04);
      vec3 refl = aurora(reflect(rd, n).xy * 1.2, m);

      vec3 obj = BG * 0.6 + irid * (0.18 + 0.55 * diff);
      obj = mix(obj, refl * 1.6 + PINK * 0.25, 0.35 + 0.4 * fres);
      obj += fres * mix(CYAN, PINK, 0.5 + 0.5 * n.y) * 0.9;
      obj += spec * 0.9;
      col = obj;
    } else {
      // Soft halo around the silhouette.
      col += mix(VIOLET, PINK, 0.4) * exp(-minD * 5.0) * 0.35;
    }
  }

  // Vignette + fade into the page background at the bottom.
  col *= smoothstep(1.45, 0.2, length(uv * vec2(0.75, 1.0)));
  col = mix(BG, col, smoothstep(0.0, 0.3, gl_FragCoord.y / uRes.y));

  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.03;
  outColor = vec4(col, 1.0);
}`;

@Component({
  selector: 'app-shader-bg',
  template: `<canvas #canvas aria-hidden="true" [class.ready]="ready()"></canvas>`,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      overflow: hidden;
      background:
        radial-gradient(60% 50% at 25% 30%, rgb(139 92 246 / 0.35), transparent 70%),
        radial-gradient(50% 45% at 80% 60%, rgb(244 114 182 / 0.22), transparent 70%),
        radial-gradient(40% 40% at 60% 20%, rgb(34 211 238 / 0.18), transparent 70%),
        var(--bg);
    }
    canvas {
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 1.6s ease;
    }
    canvas.ready { opacity: 1; }
  `,
})
export class ShaderBg {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);
  protected readonly ready = signal(false);

  constructor() {
    afterNextRender(() => this.init());
  }

  private init(): void {
    const canvas = this.canvas().nativeElement;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return; // CSS gradient on :host is the fallback.

    const program = this.link(gl);
    if (!program) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uMouse = gl.getUniformLocation(program, 'uMouse');
    const uObject = gl.getUniformLocation(program, 'uObject');

    // Rendering below native resolution keeps the raymarcher cheap; the
    // aurora is soft anyway and the object stays crisp enough at 0.75x.
    const scale = Math.min(devicePixelRatio, 1.5) * 0.75;
    // Where the 3D object sits: top-right beside the name on wide screens,
    // tucked behind the heading (and further away) on narrow ones.
    const object = { x: 0.5, y: 0.17, z: 8 };
    const resize = () => {
      const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
      if (aspect > 1.2) Object.assign(object, { x: Math.min(aspect * 0.5 - 0.3, 0.62), y: 0.17, z: 8 });
      else Object.assign(object, { x: 0.12, y: 0.27, z: 11 });
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const target = { x: 0.35, y: 0.6 };
    const mouse = { ...target };
    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = 1 - (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now() - 20_000;
    let frame = 0;
    let visible = true;

    const draw = (now: number) => {
      mouse.x += (target.x - mouse.x) * 0.04;
      mouse.y += (target.y - mouse.y) * 0.04;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform3f(uObject, object.x, object.y, object.z);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      draw(now);
      frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const resume = () => {
      if (!reduced && !frame && visible && !document.hidden) frame = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      resume();
    });
    io.observe(canvas);
    document.addEventListener('visibilitychange', resume);

    if (reduced) draw(performance.now());
    else frame = requestAnimationFrame(loop);
    requestAnimationFrame(() => this.ready.set(true));

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(frame);
      io.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', resume);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    });
  }

  private link(gl: WebGL2RenderingContext): WebGLProgram | null {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vs || !fs) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
  }
}
