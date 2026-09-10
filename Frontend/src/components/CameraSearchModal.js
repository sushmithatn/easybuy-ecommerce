import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaCamera,
  FaUpload,
  FaTimes,
  FaSyncAlt,
  FaSpinner,
  FaSearch,
  FaImage,
  FaExclamationTriangle,
  FaMagic
} from "react-icons/fa";
import axios from "axios";
import { API_URL } from "../config";
import "./CameraSearchModal.css";

// Helper to dynamically load TensorFlow.js and MobileNet CDN scripts on demand
const loadMobileNetModel = async () => {
  if (window.mobilenetModel) {
    return window.mobilenetModel;
  }

  // Load TensorFlow.js core if missing
  if (!window.tf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load TensorFlow.js"));
      document.head.appendChild(script);
    });
  }

  // Load MobileNet model library if missing
  if (!window.mobilenet) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load MobileNet library"));
      document.head.appendChild(script);
    });
  }

  if (window.mobilenet) {
    window.mobilenetModel = await window.mobilenet.load({ version: 2, alpha: 1.0 });
    return window.mobilenetModel;
  }

  throw new Error("MobileNet not available");
};

// Canvas fallback visual analysis (extracts dominant color & aspect shape features)
const analyzeCanvasFeatures = (canvas) => {
  try {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    const step = 4 * 10;

    for (let i = 0; i < data.length; i += step) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    const total = data.length / step;
    r = Math.round(r / total);
    g = Math.round(g / total);
    b = Math.round(b / total);

    let colorName = "neutral";
    if (r > 160 && g > 160 && b > 160) colorName = "white light";
    else if (r < 60 && g < 60 && b < 60) colorName = "dark black";
    else if (r > g && r > b) colorName = "red warm";
    else if (b > r && b > g) colorName = "blue cool";
    else if (g > r && g > b) colorName = "green fresh";

    const aspect = canvas.width / canvas.height;
    let shape = "standard";
    if (aspect > 1.2) shape = "wide horizontal";
    else if (aspect < 0.8) shape = "tall vertical";

    return `${colorName} ${shape}`;
  } catch (e) {
    return "visual features";
  }
};

export default function CameraSearchModal({ isOpen, onClose, onSearchResults }) {
  const [activeTab, setActiveTab] = useState("camera"); // "camera" | "upload"
  const [stream, setStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState("environment");
  const [cameraError, setCameraError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detectedClassHint, setDetectedClassHint] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imgPreviewRef = useRef(null);

  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Pre-load MobileNet CDN in background when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMobileNetModel().catch((err) => console.warn("Background AI load:", err.message));
    }
  }, [isOpen]);

  const startCameraStream = useCallback(async () => {
    setCameraError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API is not supported in your browser.");
        return;
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Please allow camera access or upload an image file.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera device found on this device.");
      } else {
        setCameraError("Unable to access camera: " + (err.message || "Unknown error"));
      }
    }
  }, [cameraFacing, stream]);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === "camera" && !capturedImage) {
        startCameraStream();
      } else {
        stopCameraStream();
      }
    } else {
      stopCameraStream();
      resetState();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, activeTab, cameraFacing]);

  const resetState = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalyzing(false);
    setAiStatus("");
    setDetectedClassHint("");
    setCameraError("");
  };

  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        setSelectedFile(file);
        setPreviewUrl(dataUrl);
        stopCameraStream();
      }
    }, "image/jpeg", 0.92);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (JPEG, PNG, WebP).");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCapturedImage(url);
    }
  };

  const handleDropzoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Perform AI Image Search
  const handlePerformVisualSearch = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setAiStatus("Analyzing image with AI...");

    let visualLabels = "";

    try {
      let imgElement = imgPreviewRef.current;
      if (!imgElement && previewUrl) {
        imgElement = new Image();
        imgElement.src = previewUrl;
        await new Promise((res) => { imgElement.onload = res; });
      }

      // Step 1: AI Visual Image Recognition
      if (imgElement) {
        setAiStatus("AI Analyzing shapes, colors & product features...");
        try {
          const model = await loadMobileNetModel();
          const predictions = await model.classify(imgElement, 5);
          if (predictions && predictions.length > 0) {
            visualLabels = predictions.map((p) => p.className).join(", ");
            const topPrediction = predictions[0].className.split(",")[0];
            setDetectedClassHint(topPrediction);
          }
        } catch (mlErr) {
          console.warn("MobileNet classification warning:", mlErr);
        }
      }

      // Canvas fallback features if needed
      if (canvasRef.current && (!visualLabels || visualLabels.length < 3)) {
        const canvasFeatures = analyzeCanvasFeatures(canvasRef.current);
        visualLabels = visualLabels ? `${visualLabels}, ${canvasFeatures}` : canvasFeatures;
      }

      setAiStatus("Matching similar products in store...");

      // Step 2: Query backend
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (visualLabels) {
        formData.append("visualLabels", visualLabels);
      }

      const res = await axios.post(`${API_URL}/api/products/search-by-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const { detectedTerm, products } = res.data;
      stopCameraStream();
      onSearchResults({ detectedTerm, products });
      onClose();
    } catch (err) {
      console.error("Visual search error:", err);
      const fallbackTerm = selectedFile.name ? selectedFile.name.split(".")[0] : "Products";
      onSearchResults({ detectedTerm: fallbackTerm, products: [] });
      onClose();
    } finally {
      setAnalyzing(false);
      setAiStatus("");
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectedClassHint("");
    if (activeTab === "camera") {
      startCameraStream();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="camera-modal-overlay" onClick={onClose}>
      <div className="camera-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="camera-modal-header">
          <div className="camera-modal-title">
            <FaMagic className="camera-modal-icon" />
            <span>AI Visual Camera & Image Search</span>
          </div>
          <button className="camera-modal-close" onClick={onClose} title="Close Modal">
            <FaTimes />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="camera-modal-tabs">
          <button
            className={`camera-tab-btn ${activeTab === "camera" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("camera");
              handleRetake();
            }}
          >
            <FaCamera /> Live Camera
          </button>
          <button
            className={`camera-tab-btn ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("upload");
              handleRetake();
            }}
          >
            <FaUpload /> Upload Image
          </button>
        </div>

        {/* Body Area */}
        <div className="camera-modal-body">
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />

          {previewUrl ? (
            /* Image Preview & AI Scanner Section */
            <div className="camera-preview-container">
              <div className="image-frame-wrapper">
                <img
                  ref={imgPreviewRef}
                  src={previewUrl}
                  alt="Captured product preview"
                  className="camera-captured-img"
                  crossOrigin="anonymous"
                />
                {analyzing && (
                  <div className="scanner-line-overlay">
                    <div className="scanning-bar" />
                    <div className="scanning-status">
                      <FaSpinner className="spinner-icon" />
                      <span>{aiStatus || "AI Visualizing Product Features..."}</span>
                    </div>
                  </div>
                )}
              </div>

              {detectedClassHint && (
                <div className="detected-ai-badge">
                  <FaMagic /> Detected Visual Feature: <b>{detectedClassHint}</b>
                </div>
              )}

              <div className="camera-actions-row">
                <button
                  className="camera-btn btn-secondary"
                  onClick={handleRetake}
                  disabled={analyzing}
                >
                  <FaSyncAlt /> Retake / Select Another
                </button>
                <button
                  className="camera-btn btn-primary"
                  onClick={handlePerformVisualSearch}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <FaSpinner className="spinner-icon" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <FaSearch /> Search Similar Products
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : activeTab === "camera" ? (
            /* Live Camera Stream View */
            <div className="camera-stream-container">
              {cameraError ? (
                <div className="camera-error-box">
                  <FaExclamationTriangle className="error-icon" />
                  <p>{cameraError}</p>
                  <button
                    className="camera-btn btn-primary"
                    onClick={() => setActiveTab("upload")}
                  >
                    <FaUpload /> Switch to Upload Image
                  </button>
                </div>
              ) : (
                <div className="video-viewport">
                  <video ref={videoRef} autoPlay playsInline muted className="live-video-feed" />
                  <div className="camera-target-frame">
                    <div className="corner top-left" />
                    <div className="corner top-right" />
                    <div className="corner bottom-left" />
                    <div className="corner bottom-right" />
                  </div>

                  <div className="video-controls-overlay">
                    <button
                      className="camera-circle-btn flip-btn"
                      onClick={toggleCameraFacing}
                      title="Flip Camera"
                    >
                      <FaSyncAlt />
                    </button>

                    <button
                      className="camera-shutter-btn"
                      onClick={handleCapturePhoto}
                      title="Snap Product Photo"
                    >
                      <div className="shutter-inner" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Upload Dropzone View */
            <div className="upload-dropzone" onClick={handleDropzoneClick}>
              <div className="dropzone-icon-wrapper">
                <FaImage className="dropzone-icon" />
              </div>
              <h3>Choose or drag an image here</h3>
              <p>Supports JPG, PNG, WEBP from your device gallery</p>
              <button className="camera-btn btn-primary dropzone-select-btn">
                <FaUpload /> Choose Photo File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
