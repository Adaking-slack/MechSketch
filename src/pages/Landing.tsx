import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Waypoints, Box, Settings, Target, Network, Bot } from 'lucide-react';
import './Landing.css';

const LayeredIsometricIcon = ({ icon: Icon, color }: { icon: any, color: string }) => {
  return (
    <div style={{
      width: '64px',
      height: '64px',
      position: 'relative',
      transformStyle: 'preserve-3d',
      transform: 'rotateX(55deg) rotateZ(-45deg)',
      marginBottom: '32px',
      marginLeft: '16px',
      marginTop: '16px'
    }}>
      {/* Bottom Layer / Shadow */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: color,
        opacity: 0.2,
        transform: 'translateZ(-15px) translate(10px, 10px)',
        borderRadius: '16px',
        filter: 'blur(8px)'
      }} />

      {/* Middle Layer */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: color,
        opacity: 0.4,
        transform: 'translateZ(-5px)',
        borderRadius: '16px',
        border: `2px solid ${color}`
      }} />

      {/* Top Layer */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: color,
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translateZ(15px)',
        boxShadow: 'inset 0px 4px 12px rgba(255,255,255,0.6)',
        border: '1px solid rgba(255,255,255,0.8)'
      }}>
        {/* Anti-transform icon */}
        <div style={{
          transform: 'rotateZ(45deg) rotateX(-55deg)',
          color: '#ffffff',
          filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))'
        }}>
          <Icon size={32} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

const SimulationLines = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}>
      <svg width="100%" height="100%" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="fadeCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="20%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Base Solid Lines */}
        <g opacity="0.1">
          {[...Array(24)].map((_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            return (
              <line
                key={`base-${i}`}
                x1="500"
                y1="200"
                x2={500 + Math.cos(angle) * 800}
                y2={200 + Math.sin(angle) * 800}
                stroke="#003764"
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Animated Dashed Lines (moving inwards) */}
        {[...Array(24)].map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          return (
            <motion.line
              key={`dash-${i}`}
              x1={500 + Math.cos(angle) * 800}
              y1={200 + Math.sin(angle) * 800}
              x2="500"
              y2="200"
              stroke="#003764"
              strokeWidth="2"
              strokeDasharray="8 60"
              initial={{ strokeDashoffset: 68, opacity: 0 }}
              animate={{ strokeDashoffset: 0, opacity: 0.3 }}
              transition={{
                opacity: { duration: 1.5, ease: "easeOut" },
                strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" }
              }}
            />
          );
        })}
        <rect width="100%" height="100%" fill="url(#fadeCenter)" />
      </svg>
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();

  const sectionAnimation = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { amount: 0.1 },
    transition: { duration: 0.7, ease: "easeOut" as const }
  };

  return (
    <div className="landing-container">

      {/* HERO SECTION */}
      <motion.div {...sectionAnimation} className="hero-section">

        {/* LEFT SECTION (Dark Blue) */}
        <div className="hero-left">
          {/* Logo */}
          <div className="hero-logo">
            <img src="/logo.svg" alt="MechSketch Logo" style={{ height: '20px', objectFit: 'contain' }} />
          </div>

          {/* Hero Text */}
          <div style={{ marginTop: '40px', marginBottom: 'auto', maxWidth: '100%' }}>
            <h1 className="hero-title">
              Design Robot Workflows, Visually
            </h1>
            <p className="hero-description">
              Create precise actions, place objects and targets, and simulate how your robot behaves — all in one workspace.
            </p>
            <button
              onClick={() => navigate('/auth?view=signup')}
              className="hero-btn"
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Get started
            </button>
          </div>
        </div>

        {/* RIGHT SECTION (White) */}
        <div className="hero-right">

          {/* Top Navigation */}
          <div className="landing-nav">

            {/* Navigation Links */}
            <div className="nav-links">
              <a href="#" className="nav-link active">Home</a>
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How it works</a>
            </div>

            {/* Buttons */}
            <div className="nav-btns">
              <button
                onClick={() => navigate('/auth?view=login')}
                className="login-btn"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/auth?view=signup')}
                className="start-btn-small"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Get started
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="hero-image-container">
            <img
              src="/landing-page/robot.png"
              alt="Robot illustration"
              className="hero-image"
            />
          </div>

        </div>
      </motion.div>

      {/* PROBLEM SECTION */}
      <motion.div {...sectionAnimation} className="section-container" style={{ marginTop: '100px', backgroundColor: '#F7F9F9' }}>
        <h2 className="section-title">
          Robotic Workflow <br /> Design Is Too Complex
        </h2>

        <div className="problem-content">
          <img
            src="/landing-page/section-2.png"
            alt="Team designing workflow"
            className="problem-image"
          />
          <p className="problem-text">
            Setting up robotic tasks often requires heavy coding, fragmented tools, and endless trial-and-error. From defining objects to mapping target zones, the process is slow, technical, and difficult to visualize.
          </p>
        </div>
      </motion.div>

      {/* SOLUTION SECTION (Section 3) */}
      <motion.div {...sectionAnimation} className="section-container" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="solution-content">
          {/* Image Left */}
          <div style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center' }}>
            <img
              src="/landing-page/section-3.png"
              alt="Robot workflow canvas interface"
              className="solution-image"
            />
          </div>

          {/* Text Right */}
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '16px' }}>
              A Visual Way to Build, Test, and <br /> Understand Robot Behavior
            </h2>
            <p className="problem-text" style={{ marginBottom: '32px' }}>
              Our platform simplifies robotic workflow design into an intuitive visual experience. You can place objects, define targets, and simulate real robot actions—all in one place.
            </p>
            <button
              onClick={() => navigate('/auth?view=signup')}
              className="start-btn-small"
              style={{ width: 'auto', padding: '12px 32px', height: 'auto' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Get started
            </button>
          </div>
        </div>
      </motion.div>

      {/* FEATURE GRID SECTION (Section 4) */}
      <motion.div {...sectionAnimation} className="section-container" style={{ backgroundColor: '#F7F9F9' }}>
        {/* Heading */}
        <h2 id="features" className="section-title" style={{ maxWidth: '800px', marginBottom: '16px' }}>
          Design Smarter Robot Behavior From Start to Finish
        </h2>

        {/* Subheading */}
        <p className="problem-text" style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '48px' }}>
          From visual task creation to real-time simulation, every feature is built to help you define precise robot behavior without complexity.
        </p>

        {/* Grid Container */}
        <div className="feature-grid">
          {[
            {
              Icon: Waypoints,
              color: '#3B82F6', // Blue
              title: 'Visual Workflow Builder',
              desc: 'Design robot logic using a drag-and-drop interface. Define actions, decisions, and paths with ease.'
            },
            {
              Icon: Box,
              color: '#8B5CF6', // Purple
              title: 'Interactive 3D Environment',
              desc: 'Simulate and test robot behavior in a realistic 3D environment before deploying in real-world scenarios.'
            },
            {
              Icon: Settings,
              color: '#10B981', // Emerald
              title: 'Smart Simulation Engine',
              desc: 'Run accurate simulations with real-time feedback to optimize robot movement and behavior.'
            },
            {
              Icon: Target,
              color: '#F43F5E', // Rose
              title: 'Object & Target System',
              desc: 'Easily define objects and targets for robots to detect, track, and interact with.'
            },
            {
              Icon: Network,
              color: '#F59E0B', // Amber
              title: 'Action-Based Logic System',
              desc: 'Create structured logic flows using triggers, conditions, and actions for dynamic behavior control.'
            },
            {
              Icon: Bot,
              color: '#06B6D4', // Cyan
              title: 'Autonomous Smart Engine',
              desc: 'Enable robots to adapt and make intelligent decisions using AI-powered automation systems.'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
            >
              <LayeredIsometricIcon icon={feature.Icon} color={feature.color} />
              <h3 className="section-title" style={{ fontSize: '22px', textAlign: 'left', marginBottom: '12px' }}>
                {feature.title}
              </h3>
              <p className="problem-text" style={{ fontSize: '15px' }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Button */}
        <button
          onClick={() => navigate('/auth?view=signup')}
          className="hero-btn"
          style={{ backgroundColor: '#00376E', marginTop: '48px' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Get Started
        </button>
      </motion.div>

      {/* STEPS SECTION (Section 5) */}
      <motion.div {...sectionAnimation} className="section-container" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="steps-container">
          {/* Left Side */}
          <div style={{ flex: '1 1 400px', paddingTop: '24px' }}>
            <h2 id="how-it-works" className="section-title" style={{ textAlign: 'left', marginBottom: '16px' }}>
              From Setup to Simulation in 5 Simple Steps
            </h2>
            <p className="problem-text" style={{ fontSize: '18px' }}>
              Build your robot workflow visually, define actions, and instantly see how it performs in a real-time 3D environment.
            </p>
          </div>

          {/* Right Side (Steps) */}
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
            {[
              { num: '1', title: 'Set Up Your Scene', desc: 'Add your robot, place objects, and define target areas.' },
              { num: '2', title: 'Define Actions', desc: 'Create workflows using action cards to control behavior.' },
              { num: '3', title: 'Run Simulation', desc: 'Watch your robot execute tasks in real time.' },
              { num: '4', title: 'Optimize', desc: 'Refine movements and fix errors before real-world deployment.' },
              { num: '5', title: 'Export', desc: 'Finalize and export your workflow for real-world use.' }
            ].map((step, index, arr) => (
              <div key={index} style={{
                display: 'flex',
                gap: '24px',
                padding: '24px 32px',
                borderBottom: index === arr.length - 1 ? 'none' : '1px solid #EAEAEA'
              }}>
                <div style={{ fontSize: '32px', lineHeight: '45px', fontWeight: 400, color: '#000000', minWidth: '24px' }}>
                  {step.num}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '6px' }}>
                  <h3 className="section-title" style={{ fontSize: '22px', textAlign: 'left', marginBottom: '8px' }}>
                    {step.title}
                  </h3>
                  <p className="problem-text" style={{ fontSize: '15px' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* USE CASES SECTION (Section 6) */}
      <motion.div {...sectionAnimation} className="section-container" style={{ backgroundColor: '#F7F9F9' }}>
        {/* Heading */}
        <h2 className="section-title" style={{ maxWidth: '800px', marginBottom: '16px' }}>
          Built for Real-World Robotics Applications
        </h2>

        {/* Subheading */}
        <p className="problem-text" style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '64px' }}>
          Leverage powerful AI systems designed for complex, real-world use cases across industrial and service robotics.
        </p>

        {/* Image Grid */}
        <div className="use-case-grid">
          {[
            { img: 'img1.png', caption: 'Industrial Assembly Line' },
            { img: 'img2.png', caption: 'Multi-Robot Warehouse Setup' },
            { img: 'img3.png', caption: 'Mobile Robotics Navigation' },
            { img: 'img4.png', caption: 'Simulated Robot Training' },
            { img: 'img5.png', caption: 'Agricultural Automation' },
            { img: 'img6.png', caption: 'Human-Robot Collaboration' }
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', maxWidth: '384px', margin: '0 auto', cursor: 'pointer' }}
            >
              <motion.img
                src={`/landing-page/${card.img}`}
                alt={card.caption}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px', backgroundColor: '#EAEAEA' }}
              />
              <p className="problem-text" style={{ fontWeight: 500 }}>
                {card.caption}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FINAL CTA SECTION (Section 7) */}
      <motion.div {...sectionAnimation} className="section-container" style={{ padding: '240px 24px', backgroundColor: '#ffffff', position: 'relative', overflow: 'hidden' }}>
        <SimulationLines />
        <h2 className="section-title" style={{ position: 'relative', zIndex: 1, marginBottom: '16px' }}>
          Start Building Smarter Robot Workflows
        </h2>

        <p className="problem-text" style={{ textAlign: 'center', position: 'relative', zIndex: 1, fontWeight: 500, marginBottom: '32px' }}>
          Design faster. Validate earlier. Deploy with confidence.
        </p>

        <button
          onClick={() => navigate('/auth?view=signup')}
          className="hero-btn"
          style={{ backgroundColor: '#003764', color: '#ECF5FE', position: 'relative', zIndex: 1 }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Get started
        </button>
      </motion.div>

      {/* FOOTER SECTION */}
      <footer style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Top Footer Part */}
        <div className="footer-top">
          {/* Left Column */}
          <div style={{ flex: '0 0 auto', maxWidth: '400px' }}>
            <div style={{ fontSize: '20px', fontWeight: 500, color: '#FFFFFF', letterSpacing: '-0.01em', marginBottom: '16px' }}>
              MechSketch
            </div>
            <p style={{ fontSize: '14px', lineHeight: '22px', color: '#ECF5FE', opacity: 0.8, margin: 0, maxWidth: '300px' }}>
              Design, simulate, and validate robot workflows visually.
            </p>
          </div>

          {/* Right Column */}
          <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Links */}
            <div className="nav-links" style={{ gap: '32px' }}>
              <a href="#" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '15px' }}>Product</a>
              <a href="#" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '15px' }}>Feature</a>
              <a href="#" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '15px' }}>How it works</a>
              <a href="#" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '15px' }}>Usecase</a>
            </div>

            {/* Newsletter */}
            <div>
              <p style={{ fontSize: '14px', fontWeight: 400, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                Stay ahead of the curve in robotics.
              </p>
              <p style={{ fontSize: '14px', color: '#ECF5FE', opacity: 0.8, margin: '0 0 16px 0' }}>
                Get the latest on prebuilt workflows and automation updates
              </p>
              <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: '12px', maxWidth: '400px' }}>
                <input
                  type="email"
                  placeholder="Email address"
                  style={{ flex: 1, height: '40px', padding: '0 16px', borderRadius: '6px', border: 'none', outline: 'none', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#000000' }}
                />
                <button
                  type="submit"
                  style={{ height: '40px', width: '48px', backgroundColor: '#A9D3FF', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003764', fontSize: '18px', fontWeight: 'bold', transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  →
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Footer Part */}
        <div style={{ backgroundColor: '#001529', padding: '24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#ECF5FE', opacity: 0.8 }}>
            © 2026 MechSketch. All rights reserved.
          </p>
        </div>

      </footer>

    </div>
  );
}