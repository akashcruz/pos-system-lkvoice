import React, { useState } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase';
import Scanner from '../components/Scanner';
import { Scan, Save, PackagePlus } from 'lucide-react';

const Inventory = () => {
    const [product, setProduct] = useState({
        barcode: '',
        name: '',
        price: '',
        stock: ''
    });
    const [showScanner, setShowScanner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleScan = (decodedText) => {
        setProduct(prev => ({ ...prev, barcode: decodedText }));
        setShowScanner(false);
        // Optional: Check if product exists to pre-fill?
        // For now, just fill barcode
    };

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!product.barcode || !product.name || !product.price || !product.stock) {
            setMessage('Please fill all fields');
            setLoading(false);
            return;
        }

        try {
            console.log("Attempting to save product:", product);
            const docRef = doc(db, "products", product.barcode);
            console.log("Document Reference created:", docRef.path);

            await setDoc(docRef, {
                name: product.name,
                price: parseFloat(product.price),
                stock: parseInt(product.stock),
                updatedAt: new Date()
            });
            console.log("Product saved to Firestore successfully");
            setMessage('Product saved successfully!');
            setProduct({ barcode: '', name: '', price: '', stock: '' });
        } catch (error) {
            console.error("Error adding document: ", error);
            setMessage('Error saving product: ' + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="p-4 pt-6 md:pt-20 pb-24 md:pb-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-6">
                    <PackagePlus className="text-primary mr-2" />
                    <h1 className="text-2xl font-bold text-gray-800">Add Inventory</h1>
                </div>

                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {message}
                    </div>
                )}

                <div className="mb-6">
                    {showScanner ? (
                        <div className="relative">
                            <Scanner onScanSuccess={handleScan} />
                            <button
                                onClick={() => setShowScanner(false)}
                                className="mt-2 w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel Scan
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowScanner(true)}
                            className="w-full py-4 bg-blue-50 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-100 transition-colors"
                        >
                            <Scan size={24} />
                            <span className="font-semibold">Scan Barcode</span>
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                        <input
                            type="text"
                            name="barcode"
                            value={product.barcode}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Scan or enter barcode"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Anchor Milk Powder"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR)</label>
                            <input
                                type="number"
                                name="price"
                                value={product.price}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
                            <input
                                type="number"
                                name="stock"
                                value={product.stock}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 mt-6 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center space-x-2 
                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-700 active:transform active:scale-95 transition-all'}`}
                    >
                        <Save size={24} />
                        <span>{loading ? 'Saving...' : 'Save Product'}</span>
                    </button>
                </form>
            </div>
        </div >
    );
};

export default Inventory;
