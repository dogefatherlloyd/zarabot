import { useState, useRef, useEffect } from 'react';

export default function ARMagicWindow() {
  const [motionData, setMotionData] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const videoRef = useRef(null);

  // AI Assistant that speaks to the user
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const requestMotionPermission = () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotionEvent);
            speak("Motion data access granted.");
          } else {
            speak("Permission denied for motion data.");
          }
        })
        .catch(console.error);
    } else {
      speak("Motion data is not supported on this device.");
    }
  };

  const handleMotionEvent = (event) => {
    const motionX = event.acceleration.x?.toFixed(2);
    const motionY = event.acceleration.y?.toFixed(2);
    const motionZ = event.acceleration.z?.toFixed(2);

    setMotionData({
      x: motionX,
      y: motionY,
      z: motionZ,
    });

    // The AI assistant "speaks" the motion data
    speak(`Motion data. X: ${motionX}, Y: ${motionY}, Z: ${motionZ}`);
  };

  const enableCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: { ideal: 'environment' } }, // More flexible camera access
        })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraEnabled(true); // Set camera as enabled
            speak("Camera enabled.");
          }
        })
        .catch((err) => {
          console.error("Error accessing the camera: ", err);
          speak("Error accessing the camera. Please try again.");
        });
    } else {
      speak("Camera is not supported on this device.");
    }
  };

  useEffect(() => {
    if (cameraEnabled && videoRef.current) {
      videoRef.current.play();
    }
  }, [cameraEnabled]);

  return (
    <div style={{ position: 'relative', textAlign: 'center', margin: '20px', height: '100vh' }}>
      <h1>AR Magic Window with AI Assistant</h1>

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