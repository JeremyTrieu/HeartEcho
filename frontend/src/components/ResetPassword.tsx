import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../styles/ResetPassword.css";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // 🔑 Extract token from URL

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>();

  const onSubmit = async (data: ResetPasswordForm) => {
    if (data.password !== data.confirmPassword) {
      setMessage("Passwords do not match.");
      setIsSuccess(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/user/reset", {
        token, // include the JWT token from URL
        password: data.password,
      });

      setMessage(response.data.message || "Password reset successful.");
      setIsSuccess(true);
    } catch (error: any) {
      setMessage(error.response?.data?.error || "An error occurred during reset.");
      setIsSuccess(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing reset token.");
    }
  }, [token]);

  return (
    <div className="reset-password-container">
      <div className="heartecho-logo">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      <h1 className="heartecho-title">heartecho</h1>
      <h2>Reset Password</h2>
      <p className="reset-password-subtitle">
        Enter your new password below.
      </p>

      {message && (
        <div className={`message-box ${isSuccess ? "success" : "error"}`}>
          <p>{message}</p>
        </div>
      )}

      {token && (
        <form onSubmit={handleSubmit(onSubmit)} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
              placeholder="Enter new password"
            />
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", { required: "Please confirm your password" })}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit">Reset Password</button>
        </form>
      )}

      <div className="auth-links">
        <p>
          Remember your password? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
