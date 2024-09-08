<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Motion and Orientation</title>
</head>
<body>
    <h1>Motion and Orientation Access</h1>
    <button id="request-permission">Request Access to Motion Data</button>
    <div id="output"></div>

    <script>
        const output = document.getElementById('output');
        const requestPermissionButton = document.getElementById('request-permission');

        requestPermissionButton.addEventListener('click', () => {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            window.addEventListener('devicemotion', handleMotionEvent);
                        } else {
                            output.textContent = 'Permission denied for motion data.';
                        }
                    })
                    .catch(console.error);
            } else {
                output.textContent = 'DeviceMotionEvent is not supported.';
            }
        });

        function handleMotionEvent(event) {
            output.textContent = `
                Acceleration along X: ${event.acceleration.x}\n
                Acceleration along Y: ${event.acceleration.y}\n
                Acceleration along Z: ${event.acceleration.z}
            `;
        }
    </script>
</body>
</html>