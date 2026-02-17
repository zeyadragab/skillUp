import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "../components/context/UserContext";
import { Shield, Loader2, ArrowLeft, RefreshCw } from "lucide-react";

const OTPVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useUser();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate("/otp-login");
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every((digit) => digit !== "") && index === 5) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();

      // Auto-submit after paste
      setTimeout(() => handleVerify(pastedData), 100);
    }
  };

  const handleVerify = async (otpCode = otp.join("")) => {
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Navigate to home
        navigate("/home");
        window.location.reload();
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error("OTP verify error:", error);
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResending(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/otp/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(60); // 60 seconds cooldown
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Network error. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Back Button */}
        <Link
          to="/otp-login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code sent to
            <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* OTP Input */}
        <div className="flex justify-center gap-3 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              disabled={loading}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={() => handleVerify()}
          disabled={loading || otp.some((digit) => !digit)}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & Login"
          )}
        </button>

        {/* Resend OTP */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
          {countdown > 0 ? (
            <p className="text-gray-500">
              Resend in <span className="font-semibold">{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={resending}
              className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-2"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend OTP
                </>
              )}
            </button>
          )}
        </div>

        {/* Security Note */}
        <p className="mt-8 text-center text-xs text-gray-500">
          OTP expires in 10 minutes. Never share your OTP with anyone.
        </p>
      </div>
    </div>
  );
};

export default OTPVerify;
