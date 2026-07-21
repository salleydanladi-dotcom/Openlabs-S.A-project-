import React, { useState, useRef, useEffect } from 'react';
import { Camera, AlertCircle, CheckCircle, Keyboard, RefreshCw, Smartphone, VideoOff, Info } from 'lucide-react';
import { motion } from 'motion/react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScanSuccess: (code: string) => void;
  onScanFailure: (error: string) => void;
  isLoading: boolean;
}

export default function QRScanner({ onScanSuccess, onScanFailure, isLoading }: QRScannerProps) {
  const [scanMethod, setScanMethod] = useState<'camera' | 'simulation' | 'text'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [isScanningSim, setIsScanningSim] = useState(false);
  
  // Real Camera States
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraInitiated, setCameraInitiated] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Simulated scan
  const handleSimulateScanCode = (code: string) => {
    setIsScanningSim(true);
    setTimeout(() => {
      setIsScanningSim(false);
      onScanSuccess(code);
    }, 1500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
  };

  // Start Real Camera
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(false);
    
    // Stop any existing streams first
    stopCamera();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      
      setStream(mediaStream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        // Safely play video
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Auto-play blocked or failed, waiting for user interaction:', playErr);
        }
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMsg = 'Could not access the camera. Please check device permissions.';
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied') || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera access was denied. Browsers block camera hardware inside nested sandbox iframe previews for safety.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera device found on this machine.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Camera is already in use by another application or tab.';
      }
      setCameraError(errorMsg);
      // Do NOT automatically fallback to simulation mode so the user can read the error instructions and retry or use the New Tab option!
    }
  };

  // Stop Real Camera
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (err) {
          console.error('Error stopping track:', err);
        }
      });
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Toggle/Change scanner mode
  useEffect(() => {
    if (scanMethod === 'camera' && cameraInitiated) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [scanMethod, cameraInitiated]);

  // Reset cameraInitiated state when switching to other tabs
  useEffect(() => {
    if (scanMethod !== 'camera') {
      setCameraInitiated(false);
    }
  }, [scanMethod]);

  // Handle Real-Time Frame Processing for QR Scanning
  useEffect(() => {
    if (!isCameraActive || !stream || !videoRef.current || scanMethod !== 'camera') return;

    let isActive = true;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scanFrame = () => {
      if (!isActive || !videoRef.current || !ctx || scanMethod !== 'camera') return;

      const video = videoRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Draw video frame onto offscreen canvas for decoding
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const codeResult = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (codeResult && codeResult.data && codeResult.data.trim()) {
          // Success! Stop scanner and dispatch
          isActive = false;
          stopCamera();
          onScanSuccess(codeResult.data.trim());
          return;
        }
      }

      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    };

    // Stagger scan start slightly for smoother initialization
    const delayId = setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }, 400);

    return () => {
      isActive = false;
      clearTimeout(delayId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraActive, stream, scanMethod]);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 overflow-hidden">
      <div className="flex flex-col items-center text-center">
        <button
          type="button"
          onClick={() => {
            setScanMethod('camera');
            setCameraInitiated(true);
          }}
          className="p-3 bg-orange-50 hover:bg-orange-100 rounded-full mb-3 text-orange-600 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-sm border border-orange-100/50"
          title="Start Live Camera Scanner"
        >
          <Camera size={28} />
        </button>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Mark Attendance via QR</h3>
        <p className="text-sm text-gray-500 mb-6">
          Scan the QR code displayed on the class projector or lecturer's screen
        </p>

        {/* Scan Method Toggle (Three modes now: Real Camera, Simulator, Text) */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-gray-100 rounded-xl mb-6 w-full max-w-sm">
          <button
            onClick={() => setScanMethod('camera')}
            className={`flex items-center justify-center gap-1.5 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
              scanMethod === 'camera'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Camera size={13} />
            Live Camera
          </button>
          
          <button
            onClick={() => setScanMethod('simulation')}
            className={`flex items-center justify-center gap-1.5 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
              scanMethod === 'simulation'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Smartphone size={13} />
            Simulator
          </button>
          
          <button
            onClick={() => setScanMethod('text')}
            className={`flex items-center justify-center gap-1.5 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
              scanMethod === 'text'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Keyboard size={13} />
            Enter Code
          </button>
        </div>

        {/* 1. LIVE DEVICE CAMERA SCANNING VIEW */}
        {scanMethod === 'camera' && (
          <div className="w-full flex flex-col items-center">
            {!cameraInitiated ? (
              <button
                type="button"
                onClick={() => setCameraInitiated(true)}
                className="relative w-64 h-64 bg-slate-900 hover:bg-slate-800 rounded-2xl border-4 border-slate-950 flex flex-col items-center justify-center overflow-hidden shadow-2xl group transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {/* Viewfinder corner lines */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-gray-600 rounded-tl group-hover:border-[#FF7A00] transition-colors"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-gray-600 rounded-tr group-hover:border-[#FF7A00] transition-colors"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-gray-600 rounded-bl group-hover:border-[#FF7A00] transition-colors"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-gray-600 rounded-br group-hover:border-[#FF7A00] transition-colors"></div>

                <div className="p-4 bg-orange-500/10 border border-[#FF7A00]/25 rounded-full mb-3 text-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-white transition-all duration-300 animate-bounce">
                  <Camera size={36} />
                </div>
                
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Tap to Start Scanner</h4>
                <p className="text-[10px] text-gray-400 max-w-[180px] font-medium leading-normal text-center">
                  Launches device camera feed to decode attendance QR code
                </p>

                {/* Pulse Glow Ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-[#FF7A00]/0 group-hover:border-[#FF7A00]/35 transition-all duration-500 scale-95 group-hover:scale-100"></div>
              </button>
            ) : cameraError ? (
              <div className="w-full max-w-sm bg-red-50 border border-red-100 rounded-3xl p-5 mb-4 flex flex-col items-center gap-3 text-center">
                <div className="p-3 bg-red-100/80 text-red-600 rounded-full animate-pulse">
                  <VideoOff size={24} />
                </div>
                <h4 className="text-xs font-black text-red-950 uppercase tracking-wide">Camera Preview Blocked</h4>
                <p className="text-[11px] text-red-700/95 font-medium leading-relaxed">
                  {cameraError}
                </p>
                
                <div className="w-full border-t border-red-200/50 my-1"></div>
                
                <div className="text-left w-full space-y-2 text-xs text-red-900 font-semibold bg-white/40 p-3 rounded-xl border border-red-100/55">
                  <p className="text-[9px] uppercase font-black tracking-wider text-red-800">Troubleshooting Guide:</p>
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[9px] shrink-0 font-bold">1</span>
                    <p className="text-[11px] leading-tight">Click <strong className="text-red-950">Open App in New Tab</strong> below to bypass iframe constraints.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[9px] shrink-0 font-bold">2</span>
                    <p className="text-[11px] leading-tight">Select <strong className="text-red-950">Allow</strong> when your browser prompts you for camera access.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[9px] shrink-0 font-bold">3</span>
                    <p className="text-[11px] leading-tight">Or use the <strong className="text-red-950">Simulator</strong> or <strong className="text-red-950">Enter Code</strong> options above.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full mt-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="py-2 px-3 text-xs font-extrabold text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-xl transition-all cursor-pointer"
                  >
                    Retry Camera
                  </button>
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 text-xs font-extrabold text-white bg-[#FF7A00] hover:bg-orange-600 rounded-xl transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Open App in New Tab
                  </a>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setCameraInitiated(false)}
                className="relative w-64 h-64 bg-slate-950 rounded-2xl border-4 border-slate-900 flex flex-col items-center justify-center overflow-hidden shadow-2xl group cursor-pointer transition-all duration-300 hover:border-red-500/80"
                title="Tap anywhere to stop camera scanner"
              >
                {/* Real Live Video Feed */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover scale-x-100 pointer-events-none"
                  muted
                  playsInline
                  autoPlay
                />

                {/* Corner Viewfinder Indicators */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl z-10 group-hover:border-red-500 transition-colors"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr z-10 group-hover:border-red-500 transition-colors"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl z-10 group-hover:border-red-500 transition-colors"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br z-10 group-hover:border-red-500 transition-colors"></div>

                {/* Laser Line Sweeper */}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-orange-500 shadow-[0_0_15px_#f97316] z-10 group-hover:bg-red-500 group-hover:shadow-[0_0_15px_#ef4444] transition-all"
                  initial={{ top: '10%' }}
                  animate={{ top: '90%' }}
                  transition={{
                    repeat: Infinity,
                    repeatType: 'reverse',
                    duration: 1.5,
                    ease: 'easeInOut'
                  }}
                />

                {/* Semi-transparent Backdrop with central scan cutout */}
                <div className="absolute inset-0 bg-black/20 pointer-events-none group-hover:bg-black/50 transition-colors duration-300 z-10" />

                {/* Interactive Stop Overlay on Hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/30 backdrop-blur-[1px]">
                  <div className="p-2.5 bg-red-600 text-white rounded-full shadow-lg shadow-red-600/30 animate-pulse">
                    <VideoOff size={20} />
                  </div>
                  <span className="text-[11px] text-white font-black tracking-wider uppercase bg-black/60 px-3 py-1 rounded-full border border-white/10">
                    Tap to Stop
                  </span>
                </div>

                {/* Loading state indicator */}
                {isLoading && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2.5 z-25" onClick={(e) => e.stopPropagation()}>
                    <RefreshCw className="animate-spin text-orange-500" size={32} />
                    <span className="text-xs text-white font-bold tracking-tight">Validating QR Ticket...</span>
                  </div>
                )}

                {/* Floating Status Badge */}
                <span className="absolute bottom-4 text-[9px] text-white/90 font-mono font-bold tracking-widest uppercase bg-black/60 px-3 py-1 rounded-full backdrop-blur-md z-10 group-hover:hidden">
                  {isLoading ? 'Processing...' : 'Live Scanner Active'}
                </span>

                <span className="absolute bottom-4 text-[9px] text-red-200 font-mono font-bold tracking-widest uppercase bg-red-950/80 px-3 py-1 rounded-full backdrop-blur-md border border-red-500/30 z-10 hidden group-hover:inline-block">
                  Click to stop camera
                </span>
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 max-w-xs text-left bg-gray-50 border border-gray-100/80 p-3 rounded-xl">
              <Info size={14} className="text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-500 leading-normal font-medium">
                Hold your device camera up to the QR code on the lecture screen. It will scan and mark you present automatically.
              </p>
            </div>
          </div>
        )}

        {/* 2. SCAN SIMULATION VIEW */}
        {scanMethod === 'simulation' && (
          <div className="w-full flex flex-col items-center">
            {/* Holographic Scanner Container */}
            <div className="relative w-64 h-64 bg-gray-900 rounded-2xl border-4 border-gray-800 flex flex-col items-center justify-center overflow-hidden shadow-inner group">
              
              {/* Corner Viewfinder Indicators */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br"></div>

              {/* Laser Line Sweeper */}
              {isScanningSim && (
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-orange-500 shadow-[0_0_15px_#f97316] z-10"
                  initial={{ top: '10%' }}
                  animate={{ top: '90%' }}
                  transition={{
                    repeat: Infinity,
                    repeatType: 'reverse',
                    duration: 1.5,
                    ease: 'easeInOut'
                  }}
                />
              )}

              {/* QR Pattern Placeholder */}
              <div className={`transition-all duration-500 ${isScanningSim ? 'opacity-30 scale-95' : 'opacity-70'} flex flex-col items-center justify-center`}>
                <div className="grid grid-cols-3 gap-2 w-24 h-24 p-2 bg-white rounded-lg shadow-md mb-2">
                  <div className="border-4 border-black w-7 h-7 rounded-sm"></div>
                  <div className="bg-black/10"></div>
                  <div className="border-4 border-black w-7 h-7 rounded-sm"></div>
                  <div className="bg-black/10"></div>
                  <div className="bg-black w-4 h-4 rounded-full self-center justify-self-center"></div>
                  <div className="bg-black/20"></div>
                  <div className="border-4 border-black w-7 h-7 rounded-sm"></div>
                  <div className="bg-black/20"></div>
                  <div className="bg-black w-3 h-3 rounded-sm"></div>
                </div>
                <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                  {isScanningSim ? 'Aligning Code...' : 'Ready to Scan'}
                </span>
              </div>

              {/* Scanning Overlay State */}
              {isScanningSim && (
                <div className="absolute inset-0 bg-orange-600/10 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="animate-spin text-orange-500" size={32} />
                    <span className="text-xs text-white font-medium bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                      Reading token payload...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Simulation Options */}
            <p className="text-xs text-gray-400 mt-4 max-w-xs leading-relaxed">
              Inside our isolated preview frame, select an active lecture token to run a virtual scan simulation:
            </p>

            <div className="grid grid-cols-1 gap-2 mt-3 w-full max-w-xs">
              <button
                type="button"
                disabled={isLoading || isScanningSim}
                onClick={() => handleSimulateScanCode('OLQR-OL-SD304-A1B2C3D4')}
                className="py-2.5 px-3 border border-gray-200 hover:border-orange-500 hover:bg-orange-50/50 rounded-xl text-left text-xs text-gray-700 font-medium transition-all flex items-center justify-between group disabled:opacity-50 cursor-pointer"
              >
                <span>🚀 Advanced React (OL-SD304)</span>
                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-mono group-hover:bg-orange-500 group-hover:text-white transition-all">
                  Scan
                </span>
              </button>
              <button
                type="button"
                disabled={isLoading || isScanningSim}
                onClick={() => handleSimulateScanCode('OLQR-OL-NE201-E5F6G7H8')}
                className="py-2.5 px-3 border border-gray-200 hover:border-orange-500 hover:bg-orange-50/50 rounded-xl text-left text-xs text-gray-700 font-medium transition-all flex items-center justify-between group disabled:opacity-50 cursor-pointer"
              >
                <span>🔒 Network Security (OL-NE201)</span>
                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-mono group-hover:bg-orange-500 group-hover:text-white transition-all">
                  Scan
                </span>
              </button>
              <button
                type="button"
                disabled={isLoading || isScanningSim}
                onClick={() => handleSimulateScanCode('OLQR-OL-DS102-X9Y8Z7W6')}
                className="py-2.5 px-3 border border-gray-200 hover:border-orange-500 hover:bg-orange-50/50 rounded-xl text-left text-xs text-gray-700 font-medium transition-all flex items-center justify-between group disabled:opacity-50 cursor-pointer"
              >
                <span>📊 Python Data (OL-DS102)</span>
                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-mono group-hover:bg-orange-500 group-hover:text-white transition-all">
                  Scan
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 3. MANUAL TEXT CODE ENTRY VIEW */}
        {scanMethod === 'text' && (
          <form onSubmit={handleManualSubmit} className="w-full max-w-xs">
            <div className="mb-4">
              <label htmlFor="qr-code-input" className="block text-xs font-semibold text-gray-600 mb-1.5 text-left">
                Enter QR Session Code Manually
              </label>
              <input
                id="qr-code-input"
                type="text"
                placeholder="e.g. OLQR-OL-SD304-A1B2C3D4"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all uppercase placeholder:normal-case placeholder:font-sans"
              />
            </div>
            <button
              type="submit"
              id="submit-manual-qr"
              disabled={isLoading || !manualCode.trim()}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl text-sm shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : (
                <CheckCircle size={16} />
              )}
              Validate Code
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
