import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../components/API_BASE_URL';

function LoginUser() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {

      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {

        // save token
        localStorage.setItem("data", JSON.stringify(data));

        alert("Login successful");

        navigate("/");

      } else {
        setError(data.message);
      }

    } catch (err) {
      console.error('Login error:', err);
      
      if (err.name === 'TypeError' && err.message.includes('ERR_SSL_PROTOCOL_ERROR')) {
        setError('SSL certificate error. Please try again or contact support.');
      } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please check your internet connection and try again.');
      } else {
        setError('Login failed: ' + (err.message || 'Unknown error'));
      }
    }

    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            User Login
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <form className='mt-8 space-y-6' >
          <div className='rounded-md shadow-sm'>
            {/* Username Field */}
            <div>
              <label htmlFor='username' className='block text-sm font-medium text-gray-700 mb-2'>
                Username
              </label>
              <input
                id='username'
                name='username'
                type='text'
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Enter your username'
              />
            </div>

            Password Field
            <div className='mt-4'>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Enter your password'
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='rounded-md bg-red-50 p-4'>
              <div className='text-sm text-red-800'>{error}</div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type='submit'
              disabled={loading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200'
              onClick={handleSubmit}
            >
              {loading ? (
                <span className='flex items-center'>
                  <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>



        </form>


      </div>
    </div>
  )
}

export default LoginUser