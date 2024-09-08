import { useState, useRef, useEffect } from 'react';

export default function ARMagicWindow() {
  const [motionData, setMotionData] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [world, setWorld] = useState(null); // For the LiquidFun world
  const [particleSystem, setParticleSystem] = useState(null); // For particle system

  const requestMotionPermission = () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotionEvent);
          } else {
            alert('Permission denied for motion data.');
          }
        })
        .catch(console.error);
    } else {
      alert('DeviceMotionEvent is not supported.');
    }
  };

  const handleMotionEvent = (event) => {
    const newMotionData = {
      x: event.acceleration.x?.toFixed(2),
      y: event.acceleration.y?.toFixed(2),
      z: event.acceleration.z?.toFixed(2),
    };
    setMotionData(newMotionData);

    // Update gravity in LiquidFun based on motion data
    if (world) {
      world.SetGravity(new b2Vec2(parseFloat(newMotionData.x), parseFloat(newMotionData.y)));
    }
  };

  const enterFullScreen = () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current && videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen(); // Safari
    } else if (videoRef.current && videoRef.current.mozRequestFullScreen) {
      videoRef.current.mozRequestFullScreen(); // Firefox
    } else if (videoRef.current && videoRef.current.msRequestFullscreen) {
      videoRef.current.msRequestFullscreen(); // IE/Edge
    }
  };

  const enableCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: 'environment' }, // Use back camera
        })
        .then((stream) => {
          if (videoRef.current) {
            console.log("Stream:", stream); // Log the stream to inspect
            videoRef.current.srcObject = stream; // Assign stream to video element
            setCameraEnabled(true); // Camera is enabled
            enterFullScreen(); // Enter fullscreen when camera is enabled
          }
        })
        .catch((err) => {
          console.error("Error accessing the camera: ", err);
          alert('Error accessing the camera. Please try again.');
        });
    } else {
      alert('Camera not supported on this device or browser.');
    }
  };

  // Initialize LiquidFun when component mounts
  useEffect(() => {
    const initLiquidFun = () => {
      const gravity = new b2Vec2(0, 10); // Default gravity downwards
      const world = new b2World(gravity);
      setWorld(world);

      // Create particle system
      const particleSystemDef = new b2ParticleSystemDef();
      const particleSystem = world.CreateParticleSystem(particleSystemDef);
      setParticleSystem(particleSystem);

      // Add particles
      const particleGroupDef = new b2ParticleGroupDef();
      const circle = new b2CircleShape();
      circle.m_radius = 2; // Particle size
      particleGroupDef.shape = circle;
      particleGroupDef.position.Set(200, 100); // Position
      particleSystem.CreateParticleGroup(particleGroupDef);
    };

    initLiquidFun();
  }, []);

  // Update LiquidFun and draw particles on canvas
  useEffect(() => {
    if (!world || !particleSystem || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    const stepWorld = () => {
      world.Step(1 / 60, 6, 2); // Step the world at 60 FPS

      // Clear the canvas
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Render particles
      const particleCount = particleSystem.GetParticleCount();
      const particlePositions = particleSystem.GetPositionBuffer();
      for (let i = 0; i < particleCount; i++) {
        const x = particlePositions[i * 2];
        const y = particlePositions[i * 2 + 1];
        context.beginPath();
        context.arc(x, y, 2, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(0, 150, 255, 0.8)';
        context.fill();
      }

      requestAnimationFrame(stepWorld); // Keep looping
    };

    stepWorld();
  }, [world, particleSystem]);

  return (
    <div style={{ position: 'relative', textAlign: 'center', margin: '20px', height: '100vh' }}>
      <h1>AR Magic Window with LiquidFun</h1>

      {/* Button to request motion data permission */}
      <button
        onClick={requestMotionPermission}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          margin: '10px'
        }}
      >
        Request Motion Data Access
      </button>

      {/* Button to enable the camera */}
      <button
        onClick={enableCamera}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          margin: '10px'
        }}
      >
        Enable Camera
      </button>

      {/* Video feed from the camera */}
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        {cameraEnabled ? (
          <video
            ref={videoRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'rotate(0deg)',
            }}
            autoPlay
            playsInline
            muted
          ></video>
        ) : (
          <p>Camera not enabled yet.</p>
        )}

        {/* Overlay for motion data */}
        {motionData && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
            }}
          >
            <h2>Motion Data</h2>
            <p>Acceleration X: {motionData.x}</p>
            <p>Acceleration Y: {motionData.y}</p>
            <p>Acceleration Z: {motionData.z}</p>
          </div>
        )}

        {/* Canvas to render LiquidFun particles */}
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}