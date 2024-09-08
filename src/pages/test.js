import { useState, useRef, useEffect } from 'react';

export default function ARMagicWindow() {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const videoRef = useRef(null);

  // AI Assistant that speaks to the user
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const enableCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: { ideal: 'environment' } }, // Use back camera
        })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraEnabled(true); // Set camera as enabled
            speak("Camera is now enabled."); // AI assistant speaks
            console.log("Camera stream received: ", stream); // Log camera stream
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
    <div style={{ textAlign: 'center', margin: '20px', height: '100vh' }}>
      <h1>AR Magic Window</h1>

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
      </div>
    </div>
  );
}