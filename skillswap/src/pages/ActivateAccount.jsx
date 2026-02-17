import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No activation token provided. Please check your email link.");
      return;
    }

    activateAccount(token);
  }, [searchParams]);

  const activateAccount = async (token) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/activate/${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Account activated successfully!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to activate account.");
      }
    } catch (error) {
      console.error("Activation error:", error);
      setStatus("error");
      setMessage("Network error. Please try again later.");
    }
  };

  const handleResendActivation = async (e) => {
    e.preventDefault();

    if (!resendEmail) {
      return;
    }

    setResending(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/resend-activation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: resendEmail }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Activation email sent! Please check your inbox.");
        setStatus("resent");
      } else {
        setMessage(data.message || "Failed to resend activation email.");
      }
    } catch (error) {
      console.error("Resend error:", error);
      setMessage("Network error. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto text-indigo-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Activating Your Account
            </h2>
            <p className="text-gray-600">Please wait...</p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Activated!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to login page...
            </p>
            <Link
              to="/signin"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Activation Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>

            {/* Resend Activation Form */}
            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-4">
                Need a new activation link? Enter your email below:
              </p>
              <form onSubmit={handleResendActivation} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Resend Activation Email"
                  )}
                </button>
              </form>
            </div>

            <Link
              to="/signin"
              className="inline-block mt-6 text-indigo-600 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        )}

        {/* Resent State */}
        {status === "resent" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/signin"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;
