import React, { useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { backendUrl, navigate } = useContext(ShopContext);
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        backendUrl + "/api/user/reset-password",
        {
          password,
          token,
        }
      );

      if (response.data.success) {
        toast.success("Password reset successful");
        navigate("/login");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Reset link expired or invalid"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-20 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-4">
        <p className="prata-regular text-3xl">Reset Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <p className="text-sm text-gray-600 text-center mb-2">
        Enter your new password below.
      </p>

      <input
        type="password"
        placeholder="New Password"
        className="w-full px-3 py-2 border border-gray-800"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Confirm Password"
        className="w-full px-3 py-2 border border-gray-800"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button
        disabled={loading}
        className="bg-black text-white font-light px-8 py-2 mt-4 w-full"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      <p
        onClick={() => navigate("/login")}
        className="text-sm cursor-pointer mt-2"
      >
        Back to Login
      </p>
    </form>
  );
};

export default ResetPassword;
