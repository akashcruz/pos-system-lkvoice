import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

const Scanner = ({ onScanSuccess, onScanFailure }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState('');
    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    const scannerId = "reader-custom";

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (html5QrCodeRef.current && isScanning) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
        };
    }, [isScanning]);

    const startCamera = async () => {
        setError('');
        setIsScanning(true);

        try {
            const html5QrCode = new Html5Qrcode(scannerId);
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText, decodedResult) => {
                    successCallback(decodedText, decodedResult);
                },
                (errorMessage) => {
                    // ignore frame errors
                }
            );
        } catch (err) {
            setError("Failed to start camera: " + err);
            setIsScanning(false);
        }
    };

    const stopCamera = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current = null;
            } catch (err) {
                console.error(err);
            }
        }
        setIsScanning(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');

        try {
            const html5QrCode = new Html5Qrcode(scannerId);
            // Note: scanFile returns a promise
            const decodedText = await html5QrCode.scanFile(file, true);
            onScanSuccess(decodedText, { result: { text: decodedText } });
        } catch (err) {
            setError("Failed to scan image. Ensure barcode is clear.");
            if (onScanFailure) onScanFailure(err);
        }
    };

    const successCallback = (decodedText, decodedResult) => {
        stopCamera();
        if (onScanSuccess) {
            onScanSuccess(decodedText, decodedResult);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div id={scannerId} className={`w-full overflow-hidden rounded-lg bg-black ${isScanning ? 'min-h-[300px]' : 'hidden'}`}></div>

            {error && (
                <div className="mb-3 p-2 text-sm text-red-600 bg-red-50 rounded border border-red-200">
                    {error}
                </div>
            )}

            {!isScanning && (
                <div className="flex flex-col space-y-3 mt-2">
                    <p className="text-center text-sm text-gray-500 mb-2">Select scanning method:</p>

                    <button
                        onClick={startCamera}
                        className="flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
                    >
                        <Camera size={20} />
                        <span>Scan with Camera</span>
                    </button>

                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl shadow-sm hover:bg-gray-50 transition"
                        >
                            <ImageIcon size={20} />
                            <span>Upload Barcode Image</span>
                        </button>
                    </div>
                </div>
            )}

            {isScanning && (
                <button
                    onClick={stopCamera}
                    className="mt-3 w-full flex items-center justify-center space-x-2 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                    <X size={20} />
                    <span>Stop Scanning</span>
                </button>
            )}
        </div>
    );
};

export default Scanner;
