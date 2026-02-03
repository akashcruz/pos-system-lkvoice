import React, { useState, useEffect } from 'react';
import { doc, getDoc, runTransaction, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';
import Scanner from '../components/Scanner';
import { ShoppingCart, CreditCard, Trash2, Plus, Minus, Scan } from 'lucide-react';

const POS = () => {
    const [cart, setCart] = useState([]);
    const [showScanner, setShowScanner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const handleScan = async (decodedText) => {
        setShowScanner(false);
        setError('');

        // Check if item already in cart
        const existingItem = cart.find(item => item.barcode === decodedText);
        if (existingItem) {
            updateQty(decodedText, existingItem.qty + 1);
            return;
        }

        // Fetch from Firestore
        setLoading(true);
        try {
            const docRef = doc(db, "products", decodedText);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const product = docSnap.data();
                if (product.stock > 0) {
                    addToCart({ ...product, barcode: decodedText });
                } else {
                    setError(`Out of stock: ${product.name}`);
                }
            } else {
                setError('Product not found!');
            }
        } catch (err) {
            console.error(err);
            setError("Error fetching product");
        }
        setLoading(false);
    };

    const addToCart = (product) => {
        setCart([...cart, { ...product, qty: 1 }]);
    };

    const updateQty = (barcode, newQty) => {
        if (newQty < 1) return;
        setCart(cart.map(item => item.barcode === barcode ? { ...item, qty: newQty } : item));
    };

    const removeFromCart = (barcode) => {
        setCart(cart.filter(item => item.barcode !== barcode));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await runTransaction(db, async (transaction) => {
                // 1. Check stock for all items
                for (const item of cart) {
                    const sfDocRef = doc(db, "products", item.barcode);
                    const sfDoc = await transaction.get(sfDocRef);
                    if (!sfDoc.exists()) {
                        throw "Product " + item.name + " does not exist!";
                    }
                    const newStock = sfDoc.data().stock - item.qty;
                    if (newStock < 0) {
                        throw "Not enough stock for " + item.name;
                    }
                    // 2. Decrement stock
                    transaction.update(sfDocRef, { stock: newStock });
                }

                // 3. Create sale record
                // Note: We can't use addDoc inside transaction usually for a different collection if we don't need to read it? 
                // Actually standard SDK allows writes to any document. 
                // But usually we just create a ref.
                // For simplicity, we can do writes.
                const newSaleRef = doc(collection(db, "sales"));
                transaction.set(newSaleRef, {
                    items: cart,
                    totalAmount: total,
                    date: serverTimestamp()
                });
            });

            setSuccess(`Sale completed! Total: LKR ${total.toFixed(2)}`);
            setCart([]);
        } catch (e) {
            console.error("Transaction failed: ", e);
            setError("Checkout failed: " + e.toString());
        }
        setLoading(false);
    };

    return (
        <div className="p-4 pt-6 md:pt-20 pb-24 md:pb-4 max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col md:h-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold flex items-center">
                    <ShoppingCart className="mr-2" /> Point of Sale
                </h1>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-3xl font-bold text-primary">LKR {total.toFixed(2)}</p>
                </div>
            </div>

            {/* Messages */}
            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            {success && <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-lg">{success}</div>}

            {/* Scanner Toggle */}
            <div className="mb-4">
                {showScanner ? (
                    <div className="relative bg-black rounded-lg overflow-hidden">
                        <Scanner onScanSuccess={handleScan} />
                        <button
                            onClick={() => setShowScanner(false)}
                            className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-black hover:bg-white"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowScanner(true)}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 flex items-center justify-center space-x-2 transition-transform active:scale-95"
                    >
                        <Scan size={20} />
                        <span>Scan Product</span>
                    </button>
                )}
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-4">
                {cart.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                        <ShoppingCart size={48} className="mb-2 opacity-20" />
                        <p>Cart is empty</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {cart.map((item) => (
                            <div key={item.barcode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                    <p className="text-sm text-gray-500">LKR {item.price.toFixed(2)}</p>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center bg-white rounded-lg border border-gray-200">
                                        <button onClick={() => updateQty(item.barcode, item.qty - 1)} className="p-2 text-gray-600 hover:bg-gray-100"><Minus size={16} /></button>
                                        <span className="px-2 font-medium w-8 text-center">{item.qty}</span>
                                        <button onClick={() => updateQty(item.barcode, item.qty + 1)} className="p-2 text-gray-600 hover:bg-gray-100"><Plus size={16} /></button>
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <p className="font-bold">{(item.price * item.qty).toFixed(2)}</p>
                                    </div>
                                    <button onClick={() => removeFromCart(item.barcode)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Checkout Button */}
            <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-xl shadow-lg flex items-center justify-center space-x-2 
            ${cart.length === 0 || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:transform active:scale-95 transition-all'}`}
            >
                <CreditCard size={24} />
                <span>{loading ? 'Processing...' : `Checkout (LKR ${total.toFixed(2)})`}</span>
            </button>
        </div>
    );
};

export default POS;
