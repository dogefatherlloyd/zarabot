import { useState, useRef, useEffect } from 'react';

export default function ARMagicWindow() {
  const [motionData, setMotionData] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const videoRef = useRef(null);

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
    setMotionData({
      x: event.acceleration.x?.toFixed(2),
      y: event.acceleration.y?.toFixed(2),
      z: event.acceleration.z?.toFixed(2),
    });
  };

  const enterFullScreen = () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current && videoRef.current.webkitRequestFullscreen) { // For Safari
      videoRef.current.webkitRequestFullscreen();
    } else if (videoRef.current && videoRef.current.mozRequestFullScreen) { // For Firefox
      videoRef.current.mozRequestFullScreen();
    } else if (videoRef.current && videoRef.current.msRequestFullscreen) { // For IE/Edge
      videoRef.current.msRequestFullscreen();
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
            videoRef.current.srcObject = stream;
            setCameraEnabled(true); // Set camera as enabled
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

  useEffect(() => {
    if (cameraEnabled && videoRef.current) {
      videoRef.current.play();
    }

    // Cleanup on component unmount or when camera is disabled
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Stop the camera stream
      }
    };
  }, [cameraEnabled]);

  useEffect(() => {
    const handleOrientationChange = () => {
      if (cameraEnabled && videoRef.current) {
        videoRef.current.style.transform = window.innerWidth > window.innerHeight ? 'rotate(90deg)' : 'rotate(0deg)';
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, [cameraEnabled]);

  return (
    <div style={{ position: 'relative', textAlign: 'center', margin: '20px', height: '100vh' }}>
      <h1>AR Magic Window</h1>

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
              objectFit: 'cover', // Cover the whole area
              transform: 'rotate(0deg)', // Reset rotation
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
      </div>
    </div>
  );
}