import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Waypoints, Box, Settings, Target, Network, Bot } from 'lucide-react';

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

export default function Landing() {
  const navigate = useNavigate();

  const sectionAnimation = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.7, ease: "easeOut" as const }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', fontFamily: 'Helvetica Neue, -apple-system, sans-serif', overflowX: 'hidden' }}>

      {/* HERO SECTION */}
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh', maxWidth: '100vw', flexWrap: 'wrap' }}>

        {/* LEFT SECTION (Dark Blue) */}
        <div style={{
          flex: '1 1 500px',
          backgroundColor: '#003764',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          minWidth: '300px'
        }}>
          {/* Logo */}
          <div style={{
            fontSize: '16px',
            lineHeight: '25px',
            letterSpacing: '-0.01em',
            color: '#ECF5FE',
            fontWeight: 500,
            marginBottom: '120x'
          }}>
            Mechsketch
          </div>

          {/* Hero Text */}
          <div style={{ marginTop: '120px', marginBottom: 'auto', maxWidth: '100%' }}>
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              lineHeight: '1.2',
              letterSpacing: '-0.01em',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0px 0 24px 0'
            }}>
              Design Robot Workflows, Visually
            </h1>
            <p style={{
              fontSize: '18px',
              lineHeight: '25px',
              letterSpacing: '-0.01em',
              fontWeight: 400,
              color: '#ECF5FE',
              margin: '0 0 32px 0',
              maxWidth: '80%'
            }}>
              Create precise actions, place objects and targets, and simulate how your robot behaves — all in one workspace.
            </p>
            <button
              onClick={() => navigate('/auth?view=signup')}
              style={{
                height: '46px',
                padding: '2px 80px',
                backgroundColor: '#ECF5FE',
                color: '#001529',
                fontSize: '15px',
                lineHeight: '22px',
                letterSpacing: '-0.01em',
                fontWeight: 500,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Get started
            </button>
          </div>
        </div>

        {/* RIGHT SECTION (White) */}
        <div style={{
          flex: '1 1 500px',
          backgroundColor: '#FFFFFF',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box',
          minWidth: '300px'
        }}>

          {/* Top Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            flexWrap: 'wrap',
            gap: '16px'
          }}>

            {/* Navigation Links */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href="#" style={{ textDecoration: 'none', color: '#00376E', fontSize: '14px', lineHeight: '23px', fontWeight: 500 }}>Home</a>
              <a href="#features" style={{ textDecoration: 'none', color: '#374049', fontSize: '14px', lineHeight: '23px' }}>Features</a>
              <a href="#how-it-works" style={{ textDecoration: 'none', color: '#374049', fontSize: '14px', lineHeight: '23px' }}>How it works</a>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate('/auth?view=login')}
                style={{
                  backgroundColor: '#ECF5FE',
                  color: '#374049',
                  fontSize: '15px',
                  lineHeight: '23px',
                  fontWeight: 500,
                  padding: '7px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/auth?view=signup')}
                style={{
                  height: '35px',
                  padding: '6px 12px',
                  backgroundColor: '#003764',
                  color: '#ECF5FE',
                  fontSize: '14px',
                  lineHeight: '23px',
                  fontWeight: 500,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Get started
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '32px'
          }}>
            <img
              src="/landing-page/robot.png"
              alt="Robot illustration"
              style={{
                maxWidth: '100%',
                maxHeight: '84vh',
                objectFit: 'contain'
              }}
            />
          </div>

        </div>
      </div>

      {/* PROBLEM SECTION */}
      <motion.div {...sectionAnimation} style={{
        width: '100%',
        marginTop: '100px',
        backgroundColor: '#F7F9F9',
        padding: '82px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '32px',
          lineHeight: '45px',
          letterSpacing: '-0.01em',
          fontWeight: 500,
          color: '#000000',
          margin: '0 0 16px 0',
          maxWidth: '720px'
        }}>
          Robotic Workflow Design Is Too Complex
        </h2>
        <p style={{
          fontSize: '18px',
          lineHeight: '25px',
          letterSpacing: '-0.01em',
          fontWeight: 400,
          color: '#374049',
          margin: 0,
          maxWidth: '720px'
        }}>
          Setting up robotic tasks often requires heavy coding, fragmented tools, and endless trial-and-error. From defining objects to mapping target zones, the process is slow, technical, and difficult to visualize.
        </p>
      </motion.div>

      {/* SOLUTION SECTION (Section 3) */}
      <motion.div {...sectionAnimation} style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        padding: '82px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>

        {/* Heading */}
        <h2 style={{
          fontSize: '32px',
          lineHeight: '45px',
          letterSpacing: '-0.01em',
          fontWeight: 500,
          color: '#000000',
          margin: '0 0 16px 0',
          maxWidth: '800px'
        }}>
          A Visual Way to Build, Test, and Understand Robot Behavior
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '18px',
          lineHeight: '25px',
          letterSpacing: '-0.01em',
          fontWeight: 400,
          color: '#374049',
          margin: '0 0 40px 0',
          maxWidth: '800px'
        }}>
          Our platform simplifies robotic workflow design into intuitive visual components. You can place objects, define targets, and simulate robot actions — all in one place.
        </p>

        {/* Image */}
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <img
            src="/landing-page/section-3.png"
            alt="Robot workflow canvas interface"
            style={{
              width: '100%',
              height: 'auto',
              boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              border: '1px solid #EAEAEA'
            }}
          />
        </div>

      </motion.div>

      {/* FEATURE GRID SECTION (Section 4) */}
      <motion.div {...sectionAnimation} style={{
        width: '100%',
        backgroundColor: '#F7F9F9',
        padding: '82px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Heading */}
        <h2 id="features" style={{
          fontSize: '32px',
          lineHeight: '45px',
          letterSpacing: '0',
          fontWeight: 500,
          color: '#000000',
          margin: '0 0 16px 0',
          maxWidth: '800px'
        }}>
          Design Smarter Robot Behavior From Start to Finish
        </h2>

        {/* Subheading */}
        <p style={{
          fontSize: '18px',
          lineHeight: '25px',
          letterSpacing: '-0.01em',
          fontWeight: 400,
          color: '#374049',
          margin: '0 0 48px 0',
          maxWidth: '800px'
        }}>
          From visual task creation to real-time simulation, every feature is built to help you define precise robot behavior without complexity.
        </p>

        {/* Grid Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          width: '100%',
          maxWidth: '1200px',
          textAlign: 'left'
        }}>
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                cursor: 'pointer'
              }}>
              <LayeredIsometricIcon icon={feature.Icon} color={feature.color} />
              <h3 style={{
                fontSize: '22px',
                lineHeight: '31px',
                letterSpacing: '-0.01em',
                fontWeight: 400,
                color: '#000000',
                margin: '0 0 12px 0'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '23px',
                letterSpacing: '-0.01em',
                fontWeight: 400,
                color: '#374049',
                margin: 0
              }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Button */}
        <button
          onClick={() => navigate('/auth?view=signup')}
          style={{
            backgroundColor: '#00376E',
            color: '#ECF5FE',
            fontSize: '15px',
            fontWeight: 500,
            lineHeight: '23px',
            padding: '10px 80px',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            marginTop: '48px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Get Started
        </button>
      </motion.div>

      {/* STEPS SECTION (Section 5) */}
      <motion.div {...sectionAnimation} style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        padding: '82px 24px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          maxWidth: '1200px',
          width: '100%',
          gap: '64px',
          alignItems: 'flex-start'
        }}>
          {/* Left Side */}
          <div style={{ flex: '1 1 400px', paddingTop: '24px' }}>
            <h2 id="how-it-works" style={{
              fontSize: '32px',
              lineHeight: '45px',
              letterSpacing: '-0.01em',
              fontWeight: 500,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              From Setup to Simulation in 5 Simple Steps
            </h2>
            <p style={{
              fontSize: '18px',
              lineHeight: '25px',
              letterSpacing: '-0.01em',
              fontWeight: 400,
              color: '#374049',
              margin: 0
            }}>
              Build your robot workflow visually, define actions, and instantly see how it performs in a real-time 3D environment.
            </p>
          </div>

          {/* Right Side (Steps) */}
          <div style={{
            flex: '1 1 500px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFFFFF'
          }}>
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
                <div style={{
                  fontSize: '32px',
                  lineHeight: '45px',
                  letterSpacing: '-0.01em',
                  fontWeight: 400,
                  color: '#000000',
                  minWidth: '24px'
                }}>
                  {step.num}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '6px' }}>
                  <h3 style={{
                    fontSize: '22px',
                    lineHeight: '31px',
                    letterSpacing: '-0.01em',
                    fontWeight: 400,
                    color: '#000000',
                    margin: '0 0 8px 0'
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    lineHeight: '23px',
                    letterSpacing: '0',
                    color: '#374049',
                    margin: 0
                  }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* USE CASES SECTION (Section 6) */}
      <motion.div {...sectionAnimation} style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        padding: '82px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Heading */}
        <h2 style={{
          fontSize: '32px',
          lineHeight: '45px',
          letterSpacing: '-0.01em',
          fontWeight: 500,
          color: '#000000',
          margin: '0 0 16px 0',
          maxWidth: '800px'
        }}>
          Built for Real-World Robotics Applications
        </h2>

        {/* Subheading */}
        <p style={{
          fontSize: '18px',
          lineHeight: '25px',
          letterSpacing: '-0.01em',
          fontWeight: 400,
          color: '#374049',
          margin: '0 0 64px 0',
          maxWidth: '800px'
        }}>
          Leverage powerful AI systems designed for complex, real-world use cases across industrial and service robotics.
        </p>

        {/* Image Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '40px 24px',
          width: '100%',
          maxWidth: '1200px',
          textAlign: 'left',
          justifyContent: 'center'
        }}>
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
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
                maxWidth: '384px',
                margin: '0 auto',
                cursor: 'pointer'
              }}>
              <motion.img
                src={`/landing-page/${card.img}`}
                alt={card.caption}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  backgroundColor: '#EAEAEA'
                }}
              />
              <p style={{
                fontSize: '18px',
                lineHeight: '25px',
                letterSpacing: '-0.01em',
                fontWeight: 500,
                color: '#374049',
                margin: 0
              }}>
                {card.caption}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FINAL CTA SECTION (Section 7) */}
      <motion.div {...sectionAnimation} style={{
        width: '100%',
        backgroundColor: '#F8F9FA',
        padding: '82px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h2 style={{
          fontSize: '32px',
          lineHeight: '45px',
          letterSpacing: '-0.01em',
          fontWeight: 500,
          color: '#000000',
          margin: '0 0 16px 0'
        }}>
          Start Building Smarter Robot Workflows
        </h2>

        <p style={{
          fontSize: '18px',
          lineHeight: '25px',
          letterSpacing: '-0.01em',
          fontWeight: 400,
          color: '#374049',
          margin: '0 0 32px 0',
          position: 'relative',
          zIndex: 1
        }}>
          Design faster. Validate earlier. Deploy with confidence.
        </p>

        <button
          onClick={() => navigate('/auth?view=signup')}
          style={{
            backgroundColor: '#003764',
            color: '#ECF5FE',
            fontSize: '15px',
            fontWeight: 500,
            lineHeight: '23px',
            padding: '10px 80px',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            position: 'relative',
            zIndex: 1
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Get started
        </button>
      </motion.div>

      {/* FOOTER SECTION */}
      <footer style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Top Footer Part */}
        <div style={{
          backgroundColor: '#001529',
          padding: '64px 64px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '40px'
        }}>
          {/* Left Column */}
          <div style={{ flex: '0 0 auto', maxWidth: '400px' }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 500,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
              marginBottom: '16px'
            }}>
              MechSketch
            </div>
            <p style={{
              fontSize: '14px',
              lineHeight: '22px',
              color: '#ECF5FE',
              opacity: 0.8,
              margin: 0,
              maxWidth: '300px'
            }}>
              Design, simulate, and validate robot workflows visually.
            </p>
          </div>

          {/* Right Column */}
          <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Links */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <a href="#" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Product</a>
              <a href="#" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Feature</a>
              <a href="#" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>How it works</a>
              <a href="#" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Usecase</a>
            </div>

            {/* Newsletter */}
            <div>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#FFFFFF',
                margin: '0 0 8px 0'
              }}>
                Stay ahead of the curve in robotics.
              </p>
              <p style={{
                fontSize: '14px',
                color: '#ECF5FE',
                opacity: 0.8,
                margin: '0 0 16px 0'
              }}>
                Get the latest on prebuilt workflows and automation updates
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                style={{ display: 'flex', gap: '12px', maxWidth: '400px' }}
              >
                <input
                  type="email"
                  placeholder="Email address"
                  style={{
                    flex: 1,
                    height: '40px',
                    padding: '0 16px',
                    borderRadius: '6px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    color: '#000000'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    height: '40px',
                    width: '48px',
                    backgroundColor: '#A9D3FF',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#003764',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    transition: 'opacity 0.2s'
                  }}
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
        <div style={{
          backgroundColor: '#003764',
          padding: '24px 64px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#ECF5FE',
            opacity: 0.8
          }}>
            © 2026 MechSketch. All rights reserved.
          </p>
        </div>

      </footer>

    </div>
  );
}