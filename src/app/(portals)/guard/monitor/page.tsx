'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '../../../../utils/supabase/client';
import { useAuth } from '../../../../providers/AuthProvider';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

export default function GuardMonitorPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tenantId } = useAuth();
  const supabase = createClient();
  
  const [guardId, setGuardId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDrowsy, setIsDrowsy] = useState(false);
  const [focusScore, setFocusScore] = useState(100);
  const [stressScore, setStressScore] = useState(0);

  // Stats for telemetry
  const consecutiveClosedEyes = useRef(0);
  const isStreaming = useRef(false);
  const lastSyncTime = useRef(Date.now());
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const fetchGuard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        setGuardId(user.id);
      }
    };
    fetchGuard();
  }, [supabase]);

  useEffect(() => {
    let faceLandmarker: FaceLandmarker;

    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });

        startCamera();
      } catch (err) {
        console.error("Failed to initialize MediaPipe", err);
      }
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 480 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
        setIsInitializing(false);
      } catch (err) {
        console.error("Webcam access denied or unavailable", err);
      }
    };

    const predictWebcam = () => {
      if (!videoRef.current || !faceLandmarker) return;
      isStreaming.current = true;

      const video = videoRef.current;
      const nowInMs = Date.now();
      
      const results = faceLandmarker.detectForVideo(video, nowInMs);
      
      let currentDrowsy = false;
      let currentFocus = 100;

      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        const blendshapes = results.faceBlendshapes[0].categories;
        
        // Find eye blink blendshapes (scores usually from 0 to 1)
        const eyeBlinkLeft = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
        const eyeBlinkRight = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;

        // Drowsiness logic: if both eyes are significantly closed
        if (eyeBlinkLeft > 0.5 && eyeBlinkRight > 0.5) {
          consecutiveClosedEyes.current += 1;
        } else {
          consecutiveClosedEyes.current = 0;
        }

        // If eyes closed for ~15 frames (approx 0.5 sec at 30fps)
        if (consecutiveClosedEyes.current > 15) {
          currentDrowsy = true;
          setStressScore(prev => Math.min(prev + 5, 100));
        }

        // Focus logic: head pose estimation using blendshapes (simplified)
        const headPitch = blendshapes.find(b => b.categoryName === 'headPitch')?.score || 0;
        const headYaw = blendshapes.find(b => b.categoryName === 'headYaw')?.score || 0;
        
        if (Math.abs(headPitch) > 0.3 || Math.abs(headYaw) > 0.3) {
          currentFocus = Math.max(currentFocus - 20, 0);
        }

        setIsDrowsy(currentDrowsy);
        setFocusScore(currentFocus);
      } else {
        // No face detected - guard is away!
        setFocusScore(0);
      }

      // Sync telemetry every 10 seconds for demo (usually 60s in production)
      if (nowInMs - lastSyncTime.current > 10000 && guardId && tenantId) {
        supabase.from('guard_biometrics').insert([{
          tenant_id: tenantId,
          guard_id: guardId,
          focus_score: currentFocus,
          stress_score: stressScore,
          is_drowsy: currentDrowsy,
          is_distracted: currentFocus < 50
        }]).then(({ error }) => {
          if (error) console.error("Telemetry sync failed", error);
        });
        lastSyncTime.current = nowInMs;
      }

      // Draw HUD on canvas
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (currentDrowsy) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 10;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
          }
        }
      }

      if (isStreaming.current) {
        animationRef.current = window.requestAnimationFrame(predictWebcam);
      }
    };

    initializeMediaPipe();

    return () => {
      isStreaming.current = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [guardId, tenantId, supabase, stressScore]);

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20 px-4 pt-6">
      <header className="mb-4">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Live Duty Monitor</h2>
        <p className="text-sm font-label text-on-surface-variant">Keep this page open. Your presence is being monitored securely on-device.</p>
      </header>

      <div className="relative rounded-2xl overflow-hidden bg-surface-container shadow-sm border border-outline-variant aspect-[3/4]">
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 z-20 bg-surface/80 backdrop-blur-sm">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
            <p className="font-label font-medium text-on-surface">Loading AI Models...</p>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover -scale-x-100" 
          autoPlay 
          playsInline
          muted
        />
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full z-10 pointer-events-none" 
          width={640} 
          height={480}
        />
        
        {/* HUD Overlay */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between">
          <div className="bg-surface-container-highest/80 backdrop-blur px-3 py-1.5 rounded-full border border-outline-variant/50">
            <span className="text-xs font-bold font-mono text-on-surface">FOCUS: {focusScore}%</span>
          </div>
          <div className="bg-surface-container-highest/80 backdrop-blur px-3 py-1.5 rounded-full border border-outline-variant/50">
            <span className={`text-xs font-bold font-mono ${isDrowsy ? 'text-error' : 'text-success'}`}>
              {isDrowsy ? 'DROWSY' : 'ALERT'}
            </span>
          </div>
        </div>

        {isDrowsy && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-error text-on-error px-6 py-3 rounded-full font-bold text-xl shadow-2xl animate-pulse">
              WAKE UP!
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm text-center">
          <span className="block text-xs font-label text-on-surface-variant mb-1">Status</span>
          <span className="font-bold text-lg text-primary">Monitoring</span>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm text-center">
          <span className="block text-xs font-label text-on-surface-variant mb-1">Stress Level</span>
          <span className="font-bold text-lg text-on-surface">{stressScore}/100</span>
        </div>
      </div>
    </div>
  );
}
