import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../components/API_BASE_URL";
import axiosInstance from "../components/utils/AxiosInstance";

const AttendacneHistory = () => {

    const id = JSON.parse(localStorage.getItem("data") || "{}");

    const [history, setHistory] = useState([])

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await axiosInstance.get(
                `/attendance/user/${id.data._id}`
            );

            setHistory(response.data.data);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
    };

    const groupByDate = (records) => {
        const grouped = {};

        console.log("All records received:", records);

        records.forEach(record => {
            const date = new Date(record.timestamp).toLocaleDateString();
            const isCheckin = record.Type === 'checkin'; // Use Type field instead of guessing by time

            console.log(`Record: ${record._id}, Date: ${date}, Type: ${record.Type}, Is Checkin: ${isCheckin}`);

            if (!grouped[date]) {
                grouped[date] = {
                    date: date,
                    checkin: null,
                    checkout: null,
                    checkinImage: null,
                    checkoutImage: null
                };
                console.log(`Created new group for date: ${date}`);
            }

            // Assign check-in or check-out based on Type field
            if (isCheckin) {
                if (!grouped[date].checkin) {
                    grouped[date].checkin = new Date(record.timestamp);
                    grouped[date].checkinImage = record.image ? `${API_BASE_URL}${record.image}` : null;
                    console.log(`Assigned check-in for ${date}:`, grouped[date].checkin);
                } else {
                    console.log(`Check-in already exists for ${date}, skipping`);
                }
            } else {
                if (!grouped[date].checkout) {
                    grouped[date].checkout = new Date(record.timestamp);
                    grouped[date].checkoutImage = record.image ? `${API_BASE_URL}${record.image}` : null;
                    console.log(`Assigned check-out for ${date}:`, grouped[date].checkout);
                } else {
                    console.log(`Check-out already exists for ${date}, skipping`);
                }
            }
        });

        console.log("Final grouped data:", grouped);
        return Object.values(grouped).reverse();
    };

    const groupedData = groupByDate(history);

    console.log("Grouped Data Result:", groupedData);

    const formatTime = (date) => {
        if (!date) return '—';
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    console.log("Final data to display:", groupedData);
    console.log("Number of grouped records:", groupedData.length);

    console.log(id.data._id, "id")
    console.log("history", history)
    return (
        <div className="p-6">
            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Date
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Check-In Time
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Check-Out Time
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Check-In Image
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Check-Out Image
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {groupedData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {item.date}
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {formatTime(item.checkin)}
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {formatTime(item.checkout)}
                                </td>

                                <td className="px-4 py-3">
                                    {item.checkinImage ? (
                                        <img
                                            src={item.checkinImage}
                                            alt="checkin"
                                            className="w-12 h-12 rounded object-cover cursor-pointer hover:ring-2 hover:ring-green-400 transition-all"
                                            
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </td>

                                <td className="px-4 py-3">
                                    {item.checkoutImage ? (
                                        <img
                                            src={item.checkoutImage}
                                            alt="checkout"
                                            className="w-12 h-12 rounded object-cover cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all"
                                            // onClick={() => window.open(item.checkoutImage, '_blank')}
                                            // title="Click to view check-out photo"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export default AttendacneHistory