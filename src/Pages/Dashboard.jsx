import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../components/API_BASE_URL";
import axiosInstance from "../components/utils/AxiosInstance";

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

  // Add debugging for user data
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

  /* -------------------- SUBMIT -------------------- */


  // const handleCheckIn = async () => {

  //   try {

  //     // Check if user data exists
  //     if (!user || !user.data || !user.data._id) {
  //       alert('User data not found. Please login again.');
  //       return;
  //     }

  //     // Check if location data exists
  //     if (!location || !location.latitude || !location.longitude) {
  //       alert('Location data not available. Please enable location services.');
  //       return;
  //     }

  //     // Log the data being sent
  //     console.log('Check-in data:', {
  //       user_id: user.data._id,
  //       latitude: location.latitude,
  //       longitude: location.longitude,
  //       image: image ? 'Image data present' : 'No image'
  //     });

  //     console.log('Authorization token:', user.token ? 'Token present' : 'No token');



  //     const response = await axios.post(
  //       `${API_BASE_URL}/attendance/checkin`,
  //       {
  //         user_id: user.data._id,
  //         latitude: location.latitude,
  //         longitude: location.longitude,
  //         image
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${user.token}`
  //         }
  //       }
  //     );

  //     console.log('Check-in response:', response);

  //     alert("Check-In Successful");

  //     setImage(null);
  //     setCheckInPopup(false);

  //   } catch (err) {

  //     console.error('Check-in error details:', {
  //       message: err.message,
  //       response: err.response?.data,
  //       status: err.response?.status,
  //       statusText: err.response?.statusText
  //     });

  //     // Handle specific upload errors
  //     if (err.response?.data?.message?.includes('ENOENT') && err.response?.data?.message?.includes('uploads')) {
  //       alert('Server upload directory issue. Please contact administrator to create uploads folder.');
  //     } else if (err.response?.data?.message?.includes('ENOENT')) {
  //       alert('File system error on server. Please contact administrator.');
  //     } else {
  //       alert(`Check-in failed: ${err.response?.data?.message || err.message}`);
  //     }

  //   }

  // };
  const handleCheckIn = async () => {

    try {

      // Check if user data exists
      if (!user || !user.data || !user.data._id) {
        alert('User data not found. Please login again.');
        return;
      }

      // Check if location data exists
      if (!location || !location.latitude || !location.longitude) {
        alert('Location data not available. Please enable location services.');
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

      alert("Check-In Successful");

      setImage(null);
      setCheckInPopup(false);

    } catch (err) {

      console.error('Check-in error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });

      // Handle specific upload errors
      if (err.response?.data?.message?.includes('ENOENT') && err.response?.data?.message?.includes('uploads')) {
        alert('Server upload directory issue. Please contact administrator to create uploads folder.');
      } else if (err.response?.data?.message?.includes('ENOENT')) {
        alert('File system error on server. Please contact administrator.');
      } else {
        alert(`Check-in failed: ${err.response?.data?.message || err.message}`);
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

      alert("Check-Out Successful");

      setImage(null);
      setCheckOutPopup(false);

    } catch (err) {

      console.error('Check-out error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });

      alert(`Check-out failed: ${err.response?.data?.message || err.message}`);

    }

  };

  const isNearShop = location && location.distance <= 100;

  /* -------------------- UI -------------------- */


  return (

    <div className="flex flex-col items-center justify-center min-h-screen gap-6">

      {location && (

        <div className="p-6 bg-white shadow rounded">
          <h2 className="font-bold">Your Location</h2>

          <p>Latitude : {location.latitude}</p>
          <p>Longitude : {location.longitude}</p>


        </div>


      )}
      {location && (

        <div className="p-6 bg-white shadow rounded">
          <h2 className="font-bold">Distance from Shop</h2>


          <p className="text-red-500 text-sm font-bold"> {location.distance.toFixed(0)} m</p>

        </div>


      )}

      {!isNearShop && (
        <p className="bg-red-200 px-4 py-2 rounded">
          You must be within 100 meters
        </p>
      )}

      {isNearShop && (

        <div className="flex gap-4">

          <button
            onClick={() => setCheckInPopup(true)}
            className="bg-green-600 text-white px-6 py-2 rounded cursor-pointer"
          >
            Check In
          </button>

          <button
            onClick={() => setCheckOutPopup(true)}
            className="bg-yellow-600 text-white px-6 py-2 rounded cursor-pointer"
          >
            Check Out
          </button>

        </div>

      )}

      {(checkInPopup || checkOutPopup) && (

        <div className="fixed inset-0 flex items-center justify-center bg-black/50">

          <div className="bg-white p-6 rounded w-96">

            {!cameraActive && !image && (
              <>
                <button
                  onClick={startCamera}
                  className="w-full bg-green-600 text-white py-2 rounded cursor-pointer"
                >
                  Take Image
                </button>
                <button className="bg-gray-600 text-white px-6 py-2 mt-5 rounded cursor-pointer" onClick={() => { setCheckInPopup(false), setCheckOutPopup(false) }}> Back</button>
              </>

            )}

            {cameraActive && (

              <div>

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-48 bg-black rounded"
                />

                <div className="flex gap-2 mt-2">

                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-blue-600 text-white py-2 rounded"
                  >
                    Capture
                  </button>

                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-red-600 text-white py-2 rounded"
                  >
                    Cancel
                  </button>

                </div>

              </div>

            )}

            {image && (

              <div>

                <img
                  src={URL.createObjectURL(image)}
                  alt="captured"
                  className="w-full h-48 object-cover rounded"
                />

                <div className="flex gap-2 mt-3">

                  <button
                    onClick={() => setImage(null)}
                    className="flex-1 bg-gray-400 text-white py-2 rounded"
                  >
                    Retake
                  </button>

                  <button
                    onClick={
                      checkInPopup ? handleCheckIn : handleCheckOut
                    }
                    className="flex-1 bg-green-600 text-white py-2 rounded"
                  >
                    Submit
                  </button>

                </div>

              </div>

            )}

            <canvas ref={canvasRef} className="hidden"></canvas>

          </div>

        </div>

      )}

    </div>

  );

}

export default Dashboard;