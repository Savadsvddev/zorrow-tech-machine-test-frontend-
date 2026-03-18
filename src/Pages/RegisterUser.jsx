import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../components/API_BASE_URL';
import { toast } from 'react-toastify';

function RegisterUser() {

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/user/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("User registered successfully");

                setFormData({
                    name: '',
                    password: ''
                });

                navigate("/login-user");
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.error('Registration error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('ERR_SSL_PROTOCOL_ERROR')) {
                toast.error('SSL certificate error. Please try again or contact support.');
            } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                toast.error('Unable to connect to server. Please check your internet connection and try again.');
            } else {
                toast.error('Registration failed: ' + (error.message || 'Unknown error'));
            }
        }

        setLoading(false);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>

                <div className='text-center'>
                    <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
                        Create Account
                    </h2>
                </div>

                <form className='mt-8 space-y-6' onSubmit={handleSubmit}>

                    <div>

                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Name
                        </label>

                        <input
                            type='text'
                            required
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className='w-full px-3 py-2 border border-gray-300 rounded-md'
                            placeholder='Enter name'
                        />
                    </div>

                    <div>

                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Password
                        </label>

                        <input
                            type='password'
                            required
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            className='w-full px-3 py-2 border border-gray-300 rounded-md'
                            placeholder='Enter password'
                        />
                    </div>

                    {error && (
                        <div className='text-red-600 text-sm'>{error}</div>
                    )}

                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full py-2 px-4 bg-blue-600 text-white rounded-md'
                    >
                        {loading ? "Creating..." : "Sign Up"}
                    </button>

                </form>
            </div>
        </div>
    )
}

export default RegisterUser