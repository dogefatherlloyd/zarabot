import { useState, useRef, useEffect } from 'react';

export default function TestPage() {
  const [motionData, setMotionData] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const videoRef = useRef(null);

  const requestPermission = () => {
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
      x: event.acceleration.x,
      y: event.acceleration.y,
      z: event.acceleration.z,
    });
  };

  // Function to enable the camera
  const enableCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraEnabled(true);
          }
        })
        .catch((err) => {
          console.error("Error accessing the camera: ", err);
        });
    } else {
      alert('Camera not supported on this device or browser.');
    }
  };

  useEffect(() => {
    if (cameraEnabled && videoRef.current) {
      videoRef.current.play();
    }
  }, [cameraEnabled]);

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <h1>Motion and Camera Access</h1>
      {/* Improved button styling */}
      <button 
        onClick={requestPermission}
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

      {motionData && (
        <div>
          <h2>Motion Data</h2>
          <p>Acceleration along X: {motionData.x}</p>
          <p>Acceleration along Y: {motionData.y}</p>
          <p>Acceleration along Z: {motionData.z}</p>
        </div>
      )}

      {/* Display the video feed */}
      <div style={{ marginTop: '20px' }}>
        {cameraEnabled ? (
          <video
            ref={videoRef}
            width="400"
            height="300"
            style={{ border: '2px solid #0070f3' }}
            autoPlay
          ></video>
        ) : (
          <p>Camera not enabled yet.</p>
        )}
      </div>
    </div>
  );
}