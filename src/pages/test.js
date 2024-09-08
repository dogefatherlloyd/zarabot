import { useState, useRef, useEffect } from 'react';

export default function TestPage() {
  const [motionData, setMotionData] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const videoRef = useRef(null);

  const requestMotionPermission = () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotionEvent);
            setMotionEnabled(true); // Set motion as enabled
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

  const enableCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: 'environment' }, // Request the back camera
        })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraEnabled(true); // Set camera as enabled
            console.log('Camera stream: ', stream); // Log the stream to the console
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
  }, [cameraEnabled]);

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <h1>Motion and Camera Access</h1>

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

      {motionData && (
        <div>
          <h2>Motion Data</h2>
          <p>Acceleration along X: {motionData.x}</p>
          <p>Acceleration along Y: {motionData.y}</p>
          <p>Acceleration along Z: {motionData.z}</p>
        </div>
      )}

      {/* Only display the video feed once both motion and camera are enabled */}
      <div style={{ marginTop: '20px' }}>
        {cameraEnabled ? (
          <video
            ref={videoRef}
            width="100%"
            height="auto"
            style={{ border: '2px solid #0070f3' }}
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