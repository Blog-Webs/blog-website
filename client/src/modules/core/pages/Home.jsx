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
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[751px] flex items-center justify-center overflow-hidden py-2xl">
        <ShaderCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none"></div>
        <div className="relative z-10 max-w-max-width mx-auto px-gutter text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-label-sm text-primary uppercase tracking-widest font-semibold">Join 10,000+ Engineers</span>
          </div>
          <h2 className="font-display text-headline-lg md:text-display max-w-[56rem] mx-auto mb-6 text-on-surface">
            Learn Software Engineering Like Top Tech Companies
          </h2>
          <p className="font-body-lg text-on-surface-variant max-w-[42rem] mx-auto mb-10">
            Master large-scale systems, high-performance algorithms, and modern infrastructure through industry-vetted curriculums and real-world project simulations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-bold rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
              Start Learning
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-container-high transition-all">
              Explore Blogs
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats Bento */}
      <section className="py-xl max-w-max-width mx-auto px-gutter">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-20px p-6 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl">article</span>
            </div>
            <span className="font-display text-headline-md text-on-surface mb-1">500+</span>
            <span className="text-on-surface-variant font-medium">Articles</span>
          </div>
          <div className="glass-card rounded-20px p-6 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-tertiary text-3xl">school</span>
            </div>
            <span className="font-display text-headline-md text-on-surface mb-1">45</span>
            <span className="text-on-surface-variant font-medium">Pro Courses</span>
          </div>
          <div className="glass-card rounded-20px p-6 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-3xl">hub</span>
            </div>
            <span className="font-display text-headline-md text-on-surface mb-1">120+</span>
            <span className="text-on-surface-variant font-medium">Tech Topics</span>
          </div>
          <div className="glass-card rounded-20px p-6 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-error text-3xl">groups</span>
            </div>
            <span className="font-display text-headline-md text-on-surface mb-1">50k+</span>
            <span className="text-on-surface-variant font-medium">Engineers</span>
          </div>
        </div>
      </section>

      {/* Trusted Technologies */}
      <section className="py-xl border-y border-outline-variant/10 bg-surface-container-lowest/50">
        <div className="max-w-max-width mx-auto px-gutter overflow-hidden">
          <p className="text-center text-label-sm text-on-surface-variant uppercase tracking-[0.2em] mb-10">Master Industry Standard Tech</p>
          <div className="flex items-center gap-12 md:gap-24 overflow-x-auto hide-scrollbar whitespace-nowrap py-4">
            <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-4xl">terminal</span>
              <span className="font-headline-md">Java</span>
            </div>
            <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-4xl">settings</span>
              <span className="font-headline-md">Spring Boot</span>
            </div>
            <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-4xl">dataset</span>
              <span className="font-headline-md">React</span>
            </div>
            <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-4xl">javascript</span>
              <span className="font-headline-md">Node.js</span>
            </div>
            <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-4xl">database</span>
              <span className="font-headline-md">PostgreSQL</span>
            </div>
            <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-4xl">cloud</span>
              <span className="font-headline-md">AWS</span>
            </div>
            <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-4xl">code</span>
              <span className="font-headline-md">Python</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-2xl max-w-max-width mx-auto px-gutter">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h3 className="font-display text-headline-lg text-on-surface mb-2">Featured Articles</h3>
            <p className="text-on-surface-variant">Deep dives into complex architectural patterns and engineering practices.</p>
          </div>
          <Link to="/blog" className="hidden sm:flex items-center gap-2 text-primary hover:underline font-medium">
            View All Articles <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Article 1 */}
          <div className="glass-card rounded-20px overflow-hidden group hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
            <div className="h-48 w-full overflow-hidden relative">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800" alt="Cover"/>
              <div className="absolute top-4 left-4 bg-primary text-on-primary text-[10px] px-2 py-1 rounded font-bold uppercase">Advanced</div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-3 text-label-sm text-on-surface-variant">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 12 min read</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> 2.4k views</span>
              </div>
              <h4 className="font-headline-md text-on-surface mb-3 group-hover:text-primary transition-colors">Microservices: Scaling Beyond the Monolith</h4>
              <p className="text-on-surface-variant text-sm line-clamp-2 mb-6">Explore how Netflix and Amazon orchestrate thousands of services without compromising on performance.</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest"></div>
                  <span className="text-sm font-medium">Alex Chen</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">bookmark</span>
              </div>
            </div>
          </div>
          {/* Article 2 */}
          <div className="glass-card rounded-20px overflow-hidden group hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
            <div className="h-48 w-full overflow-hidden relative">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=800" alt="Cover"/>
              <div className="absolute top-4 left-4 bg-tertiary text-on-tertiary text-[10px] px-2 py-1 rounded font-bold uppercase">Intermediate</div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-3 text-label-sm text-on-surface-variant">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 8 min read</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> 1.8k views</span>
              </div>
              <h4 className="font-headline-md text-on-surface mb-3 group-hover:text-primary transition-colors">Mastering Spring Security 6.x</h4>
              <p className="text-on-surface-variant text-sm line-clamp-2 mb-6">Implement enterprise-grade OAuth2 and JWT authentication in your reactive applications.</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest"></div>
                  <span className="text-sm font-medium">Sarah Miller</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">bookmark</span>
              </div>
            </div>
          </div>
          {/* Article 3 */}
          <div className="glass-card rounded-20px overflow-hidden group hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
            <div className="h-48 w-full overflow-hidden relative">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800" alt="Cover"/>
              <div className="absolute top-4 left-4 bg-error text-on-error text-[10px] px-2 py-1 rounded font-bold uppercase">Expert</div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-3 text-label-sm text-on-surface-variant">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 15 min read</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> 3.2k views</span>
              </div>
              <h4 className="font-headline-md text-on-surface mb-3 group-hover:text-primary transition-colors">Distributed Systems: CAP Theorem 2.0</h4>
              <p className="text-on-surface-variant text-sm line-clamp-2 mb-6">How modern cloud-native databases manage consistency and availability.</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest"></div>
                  <span className="text-sm font-medium">David Wu</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">bookmark</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-2xl bg-surface-container-low/40">
        <div className="max-w-max-width mx-auto px-gutter">
          <div className="text-center mb-16">
            <h3 className="font-display text-headline-lg text-on-surface mb-4">Popular Learning Paths</h3>
            <p className="text-on-surface-variant max-w-[36rem] mx-auto">Structured curriculum designed to take you from foundation to senior expertise.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glowing-border glass-card rounded-20px p-8 flex flex-col h-full group transition-all">
              <div className="mb-6 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                <span className="material-symbols-outlined text-4xl">terminal</span>
              </div>
              <h5 className="font-headline-md text-on-surface mb-3">Java &amp; Spring</h5>
              <p className="text-on-surface-variant text-sm mb-8 flex-grow">Comprehensive backend engineering focusing on JVM internals, Spring Boot, and Microservices.</p>
              <Link to="/learn" className="flex items-center gap-2 text-primary font-bold">
                Explore Path <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
            <div className="glowing-border glass-card rounded-20px p-8 flex flex-col h-full group transition-all">
              <div className="mb-6 w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary transition-all duration-300">
                <span className="material-symbols-outlined text-4xl">smart_toy</span>
              </div>
              <h5 className="font-headline-md text-on-surface mb-3">AI Engineering</h5>
              <p className="text-on-surface-variant text-sm mb-8 flex-grow">Integrate LLMs, vector databases, and agentic workflows into modern enterprise applications.</p>
              <Link to="/learn" className="flex items-center gap-2 text-tertiary font-bold">
                Explore Path <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
            <div className="glowing-border glass-card rounded-20px p-8 flex flex-col h-full group transition-all">
              <div className="mb-6 w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-all duration-300">
                <span className="material-symbols-outlined text-4xl">account_tree</span>
              </div>
              <h5 className="font-headline-md text-on-surface mb-3">System Design</h5>
              <p className="text-on-surface-variant text-sm mb-8 flex-grow">Learn to architect high-availability systems that handle millions of requests per second.</p>
              <Link to="/learn" className="flex items-center gap-2 text-secondary font-bold">
                Explore Path <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
            <div className="glowing-border glass-card rounded-20px p-8 flex flex-col h-full group transition-all">
              <div className="mb-6 w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center text-error group-hover:bg-error group-hover:text-on-error transition-all duration-300">
                <span className="material-symbols-outlined text-4xl">data_object</span>
              </div>
              <h5 className="font-headline-md text-on-surface mb-3">Advanced DSA</h5>
              <p className="text-on-surface-variant text-sm mb-8 flex-grow">Master algorithms and data structures through the lens of competitive programming and tech interviews.</p>
              <Link to="/learn" className="flex items-center gap-2 text-error font-bold">
                Explore Path <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Newsletter */}
      <section className="py-2xl relative overflow-hidden">
        <div className="max-w-max-width mx-auto px-gutter">
          <div className="glass-card rounded-20px p-12 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
            <h3 className="font-display text-headline-lg text-on-surface mb-4">Level Up Your Engineering Career</h3>
            <p className="text-on-surface-variant mb-8 max-w-[42rem] mx-auto">Weekly curated content on distributed systems, modern tech stacks, and career growth delivered straight to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mx-auto">
              <input 
                className="flex-grow bg-background border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-on-surface" 
                placeholder="Enter your work email" 
                type="email"
              />
              <button className="bg-primary text-on-primary font-bold px-8 py-3 rounded-lg hover:brightness-110 transition-all cursor-pointer">
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
