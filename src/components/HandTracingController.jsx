import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';

const HandTracingController = ({ onMove, onClick, active = true }) => {
    const videoRef = useRef(null);
    const [isEnabled, setIsEnabled] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const lastPinchRef = useRef(false);

    useEffect(() => {
        if (!active) return;

        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
        });

        hands.onResults((results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmark = results.multiHandLandmarks[0][8]; // Index finger tip
                const thumb = results.multiHandLandmarks[0][4]; // Thumb tip

                // Inverse X because video is mirrored
                const x = (1 - landmark.x) * window.innerWidth;
                const y = landmark.y * window.innerHeight;

                setCursorPos({ x, y });
                onMove?.({ x: (1 - landmark.x) * 100, y: landmark.y * 100 });

                // Pinch detection (Distance between thumb and index)
                const distance = Math.sqrt(
                    Math.pow(landmark.x - thumb.x, 2) +
                    Math.pow(landmark.y - thumb.y, 2)
                );

                const isPinching = distance < 0.05;
                if (isPinching && !lastPinchRef.current) {
                    onClick?.({ x, y });
                }
                lastPinchRef.current = isPinching;
            }
        });

        const camera = new cam.Camera(videoRef.current, {
            onFrame: async () => {
                await hands.send({ image: videoRef.current });
            },
            width: 640,
            height: 480,
        });

        camera.start()
            .then(() => setIsEnabled(true))
            .catch((err) => console.error("Camera failed:", err));

        return () => {
            camera.stop();
            hands.close();
        };
    }, [active, onMove, onClick]);

    if (!active) return null;

    return (
        <>
            <video
                ref={videoRef}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    width: '160px',
                    height: '120px',
                    borderRadius: '12px',
                    border: '2px solid var(--primary-blue)',
                    transform: 'scaleX(-1)',
                    zIndex: 1000,
                    boxShadow: 'var(--shadow-lg)'
                }}
            />
            {isEnabled && (
                <div
                    style={{
                        position: 'fixed',
                        left: cursorPos.x,
                        top: cursorPos.y,
                        width: '24px',
                        height: '24px',
                        background: 'rgba(10, 102, 194, 0.4)',
                        border: '2px solid white',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        zIndex: 9999,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 10px rgba(10, 102, 194, 0.5)',
                        transition: 'transform 0.1s ease-out'
                    }}
                />
            )}
            <div style={{
                position: 'fixed',
                bottom: '150px',
                right: '24px',
                background: 'var(--primary-blue)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                zIndex: 1000,
                boxShadow: 'var(--shadow-sm)'
            }}>
                AI VISION HAND TRACKING: {isEnabled ? 'ACTIVE' : 'STARTING...'}
            </div>
        </>
    );
};

export default HandTracingController;
