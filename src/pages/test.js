import { useState } from 'react';

export default function TestPage() {
  const [motionData, setMotionData] = useState(null);

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

  return (
    <div>
      <h1>Motion and Orientation Access</h1>
      <button onClick={requestPermission}>Request Access to Motion Data</button>
      {motionData && (
        <div>
          <p>Acceleration along X: {motionData.x}</p>
          <p>Acceleration along Y: {motionData.y}</p>
          <p>Acceleration along Z: {motionData.z}</p>
        </div>
      )}
    </div>
  );
}