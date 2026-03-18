import React, { useState, useRef, useEffect } from "react";
import axiosInstance from "../components/utils/AxiosInstance";
import { toast } from "react-toastify";

function Dashboard() {

  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [image, setImage] = useState(null);

  const [checkInPopup, setCheckInPopup] = useState(false);
  const [checkOutPopup, setCheckOutPopup] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("data") || "{}");

  console.log("Full user data from localStorage:", user);
  console.log("User ID:", user?.data?._id);
  console.log("Token:", user?.token ? "Present" : "Missing");

  /* -------------------- LOCATION -------------------- */

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const distance = calculateDistance(
        lat,
        lon,
        // 9.9312, // target latitude
        // 76.2673 // target longitude
        10.9233,
        75.9407
      );

      setLocation({
        latitude: lat,
        longitude: lon,
        accuracy: pos.coords.accuracy,
        distance: distance
      });

    }, () => {
      setError("Unable to get location");
    });

  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {

    const R = 6371000;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  /* -------------------- CAMERA -------------------- */

  const startCamera = async () => {

    try {

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });

      setStream(mediaStream);
      setCameraActive(true);

    } catch (err) {

      setError("Camera permission denied");
      console.error(err);

    }
  };

  useEffect(() => {

    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }

  }, [cameraActive, stream]);

  const stopCamera = () => {

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    setCameraActive(false);
    setStream(null);

  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], `attendance-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      setImage(file);
    }, "image/jpeg");

    stopCamera();
  };

  useEffect(() => {

    return () => stopCamera();

  }, []);


  const handleCheckIn = async () => {

    try {

      if (!user || !user.data || !user.data._id) {
        toast.warn('User data not found. Please login again.');
        return;
      }

      if (!location || !location.latitude || !location.longitude) {
        toast.warn('Location data not available. Please enable location services.');
        return;
      }

      const formData = new FormData();

      formData.append("user_id", user.data._id);
      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);
      formData.append("image", image);




      const response = await axiosInstance.post(
        `/attendance/checkin`,
        formData,

      );

      console.log('Check-in response:', response);

      toast.success("Check-In Successful");

      setImage(null);
      setCheckInPopup(false);

    } catch (err) {
      if (err.response?.data?.message?.includes('ENOENT') && err.response?.data?.message?.includes('uploads')) {
        toast.error('Server upload directory issue. Please contact administrator to create uploads folder.');
      } else if (err.response?.data?.message?.includes('ENOENT')) {
        toast.error('File system error on server. Please contact administrator.');
      } else {
        toast.error(`Check-in failed: ${err.response?.data?.message || err.message}`);
      }

    }

  };

  const handleCheckOut = async () => {

    try {
      const formData = new FormData();

      formData.append("user_id", user.data._id);
      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);
      formData.append("image", image);


      const response = await axiosInstance.post(
        `/attendance/checkout`,
        formData,
      );

      console.log('Check-out response:', response.data);

      toast.success("Check-Out Successful");

      setImage(null);
      setCheckOutPopup(false);

    } catch (err) {



      toast.error(`Check-out failed: ${err.response?.data?.message || err.message}`);

    }

  };

  const isNearShop = location && location.distance <= 100;

  /* --------------------------------------- */


  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">

      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-6 space-y-6">

        <h1 className="text-2xl font-bold text-center text-gray-800">
          Attendance Dashboard
        </h1>

        {/* Location Card */}
        {location && (
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              📍 Your Location
            </h2>
            <p className="text-sm text-gray-600">Lat: {location.latitude}</p>
            <p className="text-sm text-gray-600">Lng: {location.longitude}</p>
          </div>
        )}

        {/* Distance Card */}
        {location && (
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              📏 Distance
            </h2>
            <p className="text-2xl font-bold text-red-500">
              {location.distance.toFixed(0)} m
            </p>

            <p className={`mt-2 text-sm font-semibold ${isNearShop ? "text-green-600" : "text-red-500"
              }`}>
              {isNearShop ? "✅ Within Range" : "❌ Outside Range"}
            </p>
          </div>
        )}

        {/* Warning */}
        {!isNearShop && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg text-center">
            You must be within 100 meters to mark attendance
          </div>
        )}

        {/* Buttons */}
        {isNearShop && (
          <div className="flex gap-4">
            <button
              onClick={() => setCheckInPopup(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-lg font-semibold"
            >
              Check In
            </button>

            <button
              onClick={() => setCheckOutPopup(true)}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 transition text-white py-2 rounded-lg font-semibold"
            >
              Check Out
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {(checkInPopup || checkOutPopup) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-sm p-5 rounded-2xl shadow-lg space-y-4">

            <h2 className="text-lg font-semibold text-center">
              {checkInPopup ? "Check In" : "Check Out"}
            </h2>

            {/* Start Camera */}
            {!cameraActive && !image && (
              <>
                <button
                  onClick={startCamera}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                  📸 Open Camera
                </button>

                <button
                  onClick={() => {
                    setCheckInPopup(false);
                    setCheckOutPopup(false);
                  }}
                  className="w-full bg-gray-400 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
              </>
            )}

            {/* Camera View */}
            {cameraActive && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-48 bg-black rounded-lg"
                />

                <div className="flex gap-2">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                  >
                    Capture
                  </button>

                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Preview */}
            {image && (
              <>
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-48 object-cover rounded-lg"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setImage(null)}
                    className="flex-1 bg-gray-400 text-white py-2 rounded-lg"
                  >
                    Retake
                  </button>

                  <button
                    onClick={
                      checkInPopup ? handleCheckIn : handleCheckOut
                    }
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}

            <canvas ref={canvasRef} className="hidden"></canvas>

          </div>
        </div>
      )}
    </div>

  );

}

export default Dashboard;