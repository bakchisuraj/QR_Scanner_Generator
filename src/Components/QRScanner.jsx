import React, { useEffect, useState, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Camera, X } from 'lucide-react'

const QRScanner = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef(null)

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true
      },
      false
    )

    scannerRef.current = scanner

    // Start scanning
    setIsScanning(true)
    
    scanner.render(
      (decodedText) => {
        onScan(decodedText)
        scanner.clear().catch(() => {})
        setIsScanning(false)
      },
      (error) => {
        // Optional: handle scan errors
        console.log('QR Scan Error:', error)
      }
    )

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [onScan])

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {})
      setIsScanning(false)
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="relative">
      {/* Scanner Header */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Camera className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Scan QR Code</h3>
        </div>
        <button
          onClick={stopScanner}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close scanner"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Scanner Container */}
      <div className="relative overflow-hidden rounded-xl border-4 border-gray-800 bg-black">
        <div id="qr-reader" className="min-h-[300px]" />
        
        {/* Loading/Status Overlay */}
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-center">
              <Camera className="h-12 w-12 text-white mx-auto mb-3 animate-pulse" />
              <p className="text-white font-medium">Loading scanner...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800 font-medium mb-2">📸 How to scan:</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li className="flex items-start gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></span>
            Position QR code within the frame
          </li>
          <li className="flex items-start gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></span>
            Ensure good lighting conditions
          </li>
          <li className="flex items-start gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></span>
            Hold steady for better detection
          </li>
        </ul>
      </div>

      {/* Custom CSS for HTML5 QR Scanner */}
      <style jsx>{`
        #qr-reader {
          width: 100% !important;
        }
        
        #qr-reader__dashboard_section {
          padding: 12px !important;
          background: #f9fafb !important;
          border-top: 1px solid #e5e7eb !important;
        }
        
        #qr-reader__dashboard_section_csr {
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
        }
        
        #html5-qrcode-button-camera-permission,
        #html5-qrcode-button-camera-start,
        #html5-qrcode-button-camera-stop,
        #html5-qrcode-button-file-selection {
          background-color: #3b82f6 !important;
          color: white !important;
          border: none !important;
          padding: 10px 16px !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: background-color 0.2s !important;
        }
        
        #html5-qrcode-button-camera-permission:hover,
        #html5-qrcode-button-camera-start:hover,
        #html5-qrcode-button-camera-stop:hover,
        #html5-qrcode-button-file-selection:hover {
          background-color: #2563eb !important;
        }
        
        #html5-qrcode-button-camera-stop {
          background-color: #ef4444 !important;
        }
        
        #html5-qrcode-button-camera-stop:hover {
          background-color: #dc2626 !important;
        }
        
        #html5-qrcode-anchor-scan-type-change {
          color: #3b82f6 !important;
          text-decoration: underline !important;
          font-size: 14px !important;
          margin-top: 8px !important;
        }
        
        #qr-reader__scan_region {
          background: black !important;
        }
        
        #qr-reader__dashboard_section_swaplink {
          margin-top: 12px !important;
        }
        
        video {
          width: 100% !important;
          height: auto !important;
        }
        
        canvas {
          display: none !important;
        }
      `}</style>
    </div>
  )
}

export default QRScanner