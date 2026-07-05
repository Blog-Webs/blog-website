import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ShaderCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;
    
    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    
    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    
    float noise1 = sin(uv.x * 3.0 + u_time * 0.5) * 0.5 + 0.5;
    float noise2 = cos(uv.y * 2.0 - u_time * 0.4) * 0.5 + 0.5;
    
    vec3 color1 = vec3(0.23, 0.51, 0.96); 
    vec3 color2 = vec3(0.55, 0.36, 0.96); 
    vec3 color3 = vec3(0.02, 0.71, 0.83); 
    vec3 bg = vec3(0.035, 0.035, 0.043); 
    
    float mask1 = smoothstep(0.2, 0.8, noise1 * noise2);
    float mask2 = smoothstep(0.3, 0.9, sin(u_time * 0.3 + length(uv - 0.5) * 4.0) * 0.5 + 0.5);
    
    vec3 finalColor = mix(bg, color1, mask1 * 0.15);
    finalColor = mix(finalColor, color2, mask2 * 0.1);
    
    vec2 grid = fract(uv * 20.0);
    float line = step(0.98, grid.x) + step(0.98, grid.y);
    finalColor += line * 0.02;
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;
    
    function cs(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouse = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', handleMouse);

    let frameId;
    function render(t) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frameId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouse);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50 block" />;
};

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[751px] flex items-center justify-center overflow-hidden py-2xl">
        <ShaderCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-background)]/40 to-[var(--color-background)] pointer-events-none"></div>
        <div className="relative z-10 max-w-[var(--spacing-max-width)] mx-auto px-[var(--spacing-gutter)] text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
            <span className="text-label-sm text-[var(--color-primary)] uppercase tracking-widest font-semibold">Join 50,000+ Engineers</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl max-w-4xl mx-auto mb-6 text-[var(--color-on-surface)] font-bold tracking-tight leading-tight">
            Learn Software Engineering Like Top Tech Companies
          </h2>
          <p className="text-lg md:text-xl text-[var(--color-on-surface-variant)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Master large-scale systems, high-performance algorithms, and modern infrastructure through industry-vetted curriculums and real-world project simulations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/learn/dsa" className="w-full sm:w-auto px-8 py-4 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--color-primary)]/20 text-center">
              Start Learning
            </Link>
            <Link to="/blog" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] font-bold rounded-lg hover:bg-[var(--color-surface-container-high)] transition-all text-center">
              Explore Blogs
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats Bento */}
      <section className="py-[var(--spacing-xl)] max-w-[var(--spacing-max-width)] mx-auto px-[var(--spacing-gutter)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-[20px] p-6 flex flex-col items-center text-center group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-3xl">article</span>
            </div>
            <span className="font-display text-2xl font-bold text-[var(--color-on-surface)] mb-1">500+</span>
            <span className="text-[var(--color-on-surface-variant)] font-medium">Articles</span>
          </div>
          <div className="glass-card rounded-[20px] p-6 flex flex-col items-center text-center group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-tertiary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[var(--color-tertiary)] text-3xl">school</span>
            </div>
            <span className="font-display text-2xl font-bold text-[var(--color-on-surface)] mb-1">45</span>
            <span className="text-[var(--color-on-surface-variant)] font-medium">Pro Courses</span>
          </div>
          <div className="glass-card rounded-[20px] p-6 flex flex-col items-center text-center group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-secondary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[var(--color-secondary)] text-3xl">hub</span>
            </div>
            <span className="font-display text-2xl font-bold text-[var(--color-on-surface)] mb-1">120+</span>
            <span className="text-[var(--color-on-surface-variant)] font-medium">Tech Topics</span>
          </div>
          <div className="glass-card rounded-[20px] p-6 flex flex-col items-center text-center group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-error)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[var(--color-error)] text-3xl">groups</span>
            </div>
            <span className="font-display text-2xl font-bold text-[var(--color-on-surface)] mb-1">50k+</span>
            <span className="text-[var(--color-on-surface-variant)] font-medium">Engineers</span>
          </div>
        </div>
      </section>

      {/* Trusted Technologies */}
      <section className="py-[var(--spacing-xl)] border-y border-[var(--color-outline-variant)]/10 bg-[var(--color-surface-container-lowest)]/50 mb-20">
        <div className="max-w-[var(--spacing-max-width)] mx-auto px-[var(--spacing-gutter)] overflow-hidden">
          <p className="text-center text-xs text-[var(--color-on-surface-variant)] uppercase tracking-[0.2em] mb-10 font-bold">Master Industry Standard Tech</p>
          <div className="flex justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all">
            <span className="font-display text-xl font-bold">React</span>
            <span className="font-display text-xl font-bold">Node.js</span>
            <span className="font-display text-xl font-bold">Python</span>
            <span className="font-display text-xl font-bold">AWS</span>
            <span className="font-display text-xl font-bold">Docker</span>
          </div>
        </div>
      </section>
      
      {/* Newsletter Subscription */}
      <section className="mb-32 max-w-[var(--spacing-max-width)] mx-auto px-[var(--spacing-gutter)]">
        <div className="glass-card rounded-[32px] p-8 md:p-16 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-primary)]/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--color-secondary)]/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <span className="material-symbols-outlined text-[var(--color-primary)] text-5xl mb-6 animate-float">mail</span>
            
            <h2 className="font-display text-4xl md:text-5xl mb-4 max-w-2xl leading-tight font-bold text-[var(--color-on-surface)]">
              Join 50,000+ developers receiving our weekly intel.
            </h2>
            <p className="text-[var(--color-on-surface-variant)] text-lg mb-10 max-w-xl">
                Get the latest engineering insights, AI research, and architecture patterns delivered straight to your inbox. No spam, ever.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <input 
                  className="flex-grow bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-lg px-6 py-3 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all" 
                  placeholder="dev@example.com" 
                  type="email"
                />
                <button className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-8 py-3 rounded-lg font-bold hover:scale-105 active:scale-95 transition-all">
                  Subscribe
                </button>
            </form>
            <p className="text-xs text-[var(--color-on-surface-variant)]/60 mt-6 italic">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
