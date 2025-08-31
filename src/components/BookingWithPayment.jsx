import React, { useEffect, useRef, useState } from "react";
import dropin from "braintree-web-drop-in";
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { API_CONFIG, buildUrl } from '../config/api';

export default function BookingWithPayment({ scheduleId, appointmentDate, slotStartTime, onSuccess, onError }) {
  const dropinInstance = useRef(null);
  const containerRef = useRef(null);
  const [clientToken, setClientToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const { get, post } = useApi();
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useNotification();

  useEffect(() => {
    // 1) Fetch client token from your backend
    async function fetchToken() {
      try {
        const response = await get(buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.TOKEN));
        let token;
        
        // Handle JSON response format
        if (response && response.token) {
          token = response.token;
        } else if (typeof response === 'string') {
          // Fallback for raw string response
          token = response;
        } else {
          throw new Error("Invalid token response format - expected { token: 'value' }");
        }
        
        setClientToken(token);

        // Wait for the container to be available and ensure it's empty
        if (containerRef.current) {
          // Clear any existing content
          containerRef.current.innerHTML = '';
          
          // initialize Drop-in
          dropin.create({
            authorization: token,
            container: containerRef.current,
            // optional extras:
            card: { cardholderName: true },
            // paypal: { flow: 'vault' }
          }, (createErr, instance) => {
            if (createErr) {
              console.error("Dropin create error", createErr);
              setError("Payment UI failed to initialize");
              showError("Payment UI failed to initialize");
              return;
            }
            dropinInstance.current = instance;
          });
        } else {
          throw new Error("Container element not found");
        }
      } catch (err) {
        console.error(err);
        const errorMessage = err.message || "Could not load payment token";
        setError(errorMessage);
        showError(errorMessage);
      }
    }

    // Add a small delay to ensure the container is rendered
    const timer = setTimeout(() => {
      fetchToken();
    }, 100);

    // cleanup
    return () => {
      clearTimeout(timer);
      if (dropinInstance.current) {
        dropinInstance.current.teardown().catch(() => {});
        dropinInstance.current = null;
      }
    };
  }, []); // Remove get and showError from dependencies to prevent infinite loop

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!dropinInstance.current) {
      const errorMessage = "Payment UI not ready";
      setError(errorMessage);
      showError(errorMessage);
      return;
    }

    setLoading(true);

    try {
      // 2) request the paymentMethodNonce from the dropin instance
      const { nonce } = await new Promise((resolve, reject) => {
        dropinInstance.current.requestPaymentMethod((err, payload) => {
          if (err) return reject(err);
          resolve(payload); // payload.nonce
        });
      });

      // 3) send booking request to your backend with booking info + nonce
      const bookingData = {
        scheduleId,
        appointmentDate,   // e.g. "2025-09-10"
        slotStartTime,     // e.g. "09:15:00"
        paymentMethodNonce: nonce
      };

      const response = await post(buildUrl(API_CONFIG.ENDPOINTS.PATIENT.BOOKINGS), bookingData);

      if (response) {
        const successMessage = `Booking successful! ID: ${response.bookingId || 'unknown'}`;
        setSuccess(successMessage);
        showSuccess(successMessage);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response);
        }
      }
    } catch (err) {
      console.error(err);
      let errorMessage = err.message || "Payment/booking failed";
      
      // Handle specific error cases
      if (err.message && err.message.includes('409')) {
        errorMessage = "Slot already booked. Payment refunded if charged.";
      } else if (err.message && err.message.includes('400')) {
        errorMessage = "Invalid booking data. Please check your selection.";
      }
      
      setError(errorMessage);
      showError(errorMessage);
      
      // Call onError callback if provided
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Complete Your Booking</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Booking Details */}
      <div className="mb-4 p-3 bg-gray-50 rounded border">
        <h4 className="font-medium text-gray-700 mb-2">Booking Details:</h4>
        <p className="text-sm text-gray-600">Date: {appointmentDate}</p>
        <p className="text-sm text-gray-600">Time: {slotStartTime}</p>
        <p className="text-sm text-gray-600">Schedule ID: {scheduleId}</p>
      </div>

      {/* Payment Form */}
      <div ref={containerRef} className="mb-4 min-h-[200px]" />

      <button 
        onClick={handleSubmit} 
        disabled={loading || !clientToken}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          loading || !clientToken
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Pay & Book Appointment'
        )}
      </button>

      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <h5 className="text-sm font-medium text-blue-800 mb-1">Test Card Information:</h5>
        <p className="text-xs text-blue-600">
          Visa: 4111 1111 1111 1111<br />
          Mastercard: 5555 5555 5555 4444<br />
          Any future expiration date and CVV
        </p>
        <p className="text-xs text-blue-600 mt-2">
          For quick testing, you can also use <code className="bg-blue-100 px-1 rounded">fake-valid-nonce</code>
        </p>
      </div>
    </div>
  );
}
