import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react'

function Dashboard() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [checkInPopup, setCheckInPopup] = useState(false)
  const [checkOutPopup, setCheckOutPopup] = useState(false)

  const data = JSON.parse(localStorage.getItem("data"));

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        // Calculate distance from specified location
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          9.9312, // target latitude
          76.2673  // target longitude

        );

        setLocation({
          ...currentLocation,
          distance: distance
        });
        setLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Start camera using getUserMedia
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg');
      setImage(imageData);
      stopCamera();
    }
  };

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Auto-get location when component mounts
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const takeImage = () => {
    startCamera();
  };

  const handleSubmitCheckIn = async () => {
    try {
      const payload = {
        user_id: data.data._id,
        latitude: location.latitude,
        longitude: location.longitude,
        // image: image
      };

      const res = await axios.post(
        "https://3.135.189.191:5002/attendance/checkin",
        payload,
        {
          headers: {
            Authorization: `Bearer ${data.token}`
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          })
        }
      );

      console.log(res.data);

      setCheckInPopup(false);
      setImage(null);

    } catch (err) {
      console.error(err);
    }
  };
  const handleSubmitCheckOut = async () => {
    try {
      const payload = {
        user_id: data.data._id,
        latitude: location.latitude,
        longitude: location.longitude,
        image: image
      };

      const res = await axios.post(
        "https://3.135.189.191:5002/attendance/checkout",
        payload,
        {
          headers: {
            Authorization: `Bearer ${data.token}`
          }
        }
      );

      console.log(res.data);

      setCheckOutPopup(false);
      setImage(null);

    } catch (err) {
      console.error(err);
    }
  };

  const isNearShop = location && location.distance > 100;

  // console.log(data.token)
  // console.log(location.latitude, "location")
  console.log(location)

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-full">
      <div className='text-center space-y-6 p-6'>
        {/* <h1 className='text-3xl lg:text-4xl font-bold text-gray-800'>Dashboard</h1> */}


        {error && (
          <div className='p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
            {error}
          </div>
        )}

        {location && (
          <div className='p-6 bg-white rounded-lg shadow-md max-w-md mx-auto space-y-3'>
            <h2 className='text-xl font-semibold text-gray-800'>Your Location</h2>
            <div className='text-left space-y-2'>
              <p className='text-sm text-gray-600'>
                <span className='font-medium'>Latitude:</span> {location.latitude.toFixed(6)}
              </p>
              <p className='text-sm text-gray-600'>
                <span className='font-medium'>Longitude:</span> {location.longitude.toFixed(6)}
              </p>
              <p className='text-sm text-gray-600'>
                <span className='font-medium'>Accuracy:</span> ±{location.accuracy.toFixed(0)} meters
              </p>
              <div className='pt-2 mt-2 border-t border-gray-200'>
                <p className='text-sm font-medium text-gray-700'>
                  {/* Distance from Shop (11.76°N, 73.00°E): */}
                  Distance from the shop
                </p>
                <p className='text-lg font-bold text-blue-600'>
                  {location.distance ? `${location.distance.toFixed(0)} meters` : 'Calculating...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6">
        {!isNearShop && (
          <p className="bg-red-200 px-3">
            Distance is more than 100m, you cannot check in
          </p>
        )}

        {isNearShop && (
          <>
            <button
              className="bg-red-600 py-3 px-6 text-white rounded"
              onClick={() => setCheckInPopup(true)}
            >
              Check In
            </button>

            <button
              className="bg-yellow-600 py-3 px-6 text-white rounded"
              onClick={() => setCheckOutPopup(true)}
            >
              Check Out
            </button>
          </>
        )}
      </div>
      {checkOutPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">

          <div className="w-96 p-6 bg-white rounded-xl shadow-lg">
            {!cameraActive && !image && (
              <>
                <button
                  onClick={takeImage}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 mb-4"
                >
                  Take image
                </button>

                <button className='bg-red-300 py-2 px-4 rounded' onClick={() => setCheckOutPopup(false)}>Back</button>
              </>
            )}

            {/* Camera View */}
            {cameraActive && (
              <div className="mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-48 object-cover rounded-lg bg-black"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Captured Image Preview */}
            {image && (
              <div className="mb-4">
                <img
                  src={image}
                  alt="captured"
                  className="w-full h-48 object-cover rounded-lg bg-gray-100"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    takeImage();
                  }}
                  className="w-full mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Retake
                </button>
              </div>
            )}

            {/* Hidden Canvas for Photo Capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Buttons */}
            {image && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setCheckOutPopup(false);
                    setImage(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmitCheckOut}
                  className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Submit
                </button>
              </div>
            )}
          </div>

        </div>
      )}
      {checkInPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">

          <div className="w-96 p-6 bg-white rounded-xl shadow-lg">
            {!cameraActive && !image && (
              <>
                <button
                  onClick={takeImage}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 mb-4"
                >
                  Take image
                </button>

                <button className='bg-red-300 py-2 px-4 rounded' onClick={() => setCheckInPopup(false)}>Back</button>
              </>
            )}

            {/* Camera View */}
            {cameraActive && (
              <div className="mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-48 object-cover rounded-lg bg-black"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Captured Image Preview */}
            {image && (
              <div className="mb-4">
                <img
                  src={image}
                  alt="captured"
                  className="w-full h-48 object-cover rounded-lg bg-gray-100"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    takeImage();
                  }}
                  className="w-full mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Retake
                </button>
              </div>
            )}

            {/* Hidden Canvas for Photo Capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Buttons */}
            {image && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setCheckInPopup(false);
                    setImage(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmitCheckIn}
                  className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Submit
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

export default Dashboard