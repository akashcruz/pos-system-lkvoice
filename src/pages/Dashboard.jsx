import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from '../firebase';
import { TrendingUp, Calendar, DollarSign, Package } from 'lucide-react';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [todaySales, setTodaySales] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [recentSales, setRecentSales] = useState([]);

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                const now = new Date();
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                const salesRef = collection(db, "sales");
                const q = query(
                    salesRef,
                    where("date", ">=", startOfDay),
                    orderBy("date", "desc")
                );

                const querySnapshot = await getDocs(q);

                let totalAmount = 0;
                const salesData = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    totalAmount += data.totalAmount;
                    salesData.push({ id: doc.id, ...data });
                });

                setTodaySales(totalAmount);
                setTotalOrders(querySnapshot.size);
                setRecentSales(salesData);

            } catch (error) {
                console.error("Error fetching dashboard data: ", error);
                // Note: orderBy requires an index if combined with where. 
                // If index error occurs, check browser console for link to create index.
            }
            setLoading(false);
        };

        fetchSales();
    }, []);

    return (
        <div className="p-4 pt-6 md:pt-20 pb-24 md:pb-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <TrendingUp className="mr-2 text-primary" /> Sales Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Sales Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="opacity-80 font-medium">Today's Sales</span>
                        <DollarSign className="opacity-80" />
                    </div>
                    <div className="text-4xl font-bold">
                        {loading ? '...' : `LKR ${todaySales.toFixed(2)}`}
                    </div>
                </div>

                {/* Orders Count Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 font-medium">Orders Today</span>
                        <Package className="text-blue-500" />
                    </div>
                    <div className="text-4xl font-bold text-gray-800">
                        {loading ? '...' : totalOrders}
                    </div>
                </div>

                {/* Date Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 font-medium">Date</span>
                        <Calendar className="text-purple-500" />
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4 text-gray-700">Recent Transactions</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading data...</div>
                ) : recentSales.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No sales recorded today.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Items</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {sale.date?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            {sale.items.length} items
                                            <div className="text-xs text-gray-400 truncate max-w-[200px]">
                                                {sale.items.map(i => i.name).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-right text-gray-800">
                                            LKR {sale.totalAmount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
