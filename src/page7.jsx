import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./page7.css";
import Bg from "./components/bg.jsx";
import envelopeImage from "./assets/envelope.png";
import { apiFetch } from "./lib/api";

function Page7() {
  const navigate = useNavigate();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState("");

  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    country: "",
  });
  const [signInStatus, setSignInStatus] = useState(null);
  const [signUpStatus, setSignUpStatus] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("cs_lab_token");
    const storedUser = localStorage.getItem("cs_lab_user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const destination = parsedUser?.role === "admin" ? "/dashboard" : "/posts";
        navigate(destination, { replace: true });
      } catch (error) {
        localStorage.removeItem("cs_lab_user");
      }
    }
  }, [navigate]);

  const handleAuthSuccess = (data, defaultMessage, setStatus, resetForm) => {
    localStorage.setItem("cs_lab_token", data.token);
    if (data.user) {
      localStorage.setItem("cs_lab_user", JSON.stringify(data.user));
    }
    setStatus({ type: "success", message: data.message || defaultMessage });
    resetForm();
    const destination = data.user?.role === "admin" ? "/dashboard" : "/posts";
    navigate(destination, { replace: true });
  };

  const handleSignInChange = (event) => {
    const { name, value } = event.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUpChange = (event) => {
    const { name, value } = event.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignInSubmit = async (event) => {
    event.preventDefault();
    if (!signInData.email || !signInData.password) {
      setSignInStatus({ type: "error", message: "Please fill in both fields." });
      return;
    }

    if (!validateEmail(signInData.email)) {
      setSignInStatus({ type: "error", message: "Enter a valid email address." });
      return;
    }

    try {
      const response = await apiFetch(`/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signInData),
      });

      const data = await response.json();

      if (!response.ok) {
        setSignInStatus({ type: "error", message: data.message || "Could not sign in." });
        return;
      }

      handleAuthSuccess(
        data,
        "Signed in successfully.",
        setSignInStatus,
        () => setSignInData({ email: "", password: "" })
      );
    } catch (error) {
      setSignInStatus({ type: "error", message: "Server error. Try again later." });
    }
  };

  const handleSignUpSubmit = async (event) => {
    event.preventDefault();
    if (!signUpData.name || !signUpData.email || !signUpData.password) {
      setSignUpStatus({ type: "error", message: "Name, email, and password are required." });
      return;
    }

    if (!validateEmail(signUpData.email)) {
      setSignUpStatus({ type: "error", message: "Enter a valid email address." });
      return;
    }

    if (signUpData.password.length < 6) {
      setSignUpStatus({ type: "error", message: "Password must be at least 6 characters long." });
      return;
    }

    const ageNumber = Number(signUpData.age);
    if (signUpData.age && (Number.isNaN(ageNumber) || ageNumber <= 0)) {
      setSignUpStatus({ type: "error", message: "Age must be a positive number." });
      return;
    }

    try {
      const response = await apiFetch(`/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData),
      });

      const data = await response.json();

      if (!response.ok) {
        setSignUpStatus({ type: "error", message: data.message || "Could not sign up." });
        return;
      }

      handleAuthSuccess(
        data,
        "Thanks for signing up.",
        setSignUpStatus,
        () =>
          setSignUpData({
            name: "",
            email: "",
            password: "",
            age: "",
            gender: "",
            country: "",
          })
      );
    } catch (error) {
      setSignUpStatus({ type: "error", message: "Server error. Try again later." });
    }
  };

  return (
    <div className="page7-container">
      <Bg style={{backgroundColor:"White"}} />

      
      <h1 className="page7-heading">Comics Studies<br />Lab@IITJ</h1>

      <div className="envelope-wrapper">
        <img src={envelopeImage} alt="Envelope with @" className="envelope-img" />
      </div>

      <div className="signin-section">
        <form className="auth-form" onSubmit={handleSignInSubmit}>
          <label className="auth-label" htmlFor="signin-email">
            <span>Email</span>
            <input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              value={signInData.email}
              onChange={handleSignInChange}
              className="auth-input"
            />
          </label>
          <label className="auth-label" htmlFor="signin-password">
            <span>Password</span>
            <input
              id="signin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={signInData.password}
              onChange={handleSignInChange}
              className="auth-input"
            />
          </label>
          <button type="submit" className="auth-button">Sign in</button>
          {signInStatus && (
            <p className={`auth-feedback auth-feedback-${signInStatus.type}`}>
              {signInStatus.message}
            </p>
          )}
        </form>
      </div>

    
      <div className="signup-section">
        <form className="auth-form" onSubmit={handleSignUpSubmit}>
          <label className="auth-label" htmlFor="signup-name">
            <span>Name</span>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              value={signUpData.name}
              onChange={handleSignUpChange}
              className="auth-input"
            />
          </label>
          <label className="auth-label" htmlFor="signup-email">
            <span>Email</span>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              value={signUpData.email}
              onChange={handleSignUpChange}
              className="auth-input"
            />
          </label>
          <label className="auth-label" htmlFor="signup-password">
            <span>Password</span>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={signUpData.password}
              onChange={handleSignUpChange}
              className="auth-input"
            />
          </label>
          <label className="auth-label" htmlFor="signup-age">
            <span>Age</span>
            <input
              id="signup-age"
              name="age"
              type="number"
              min="1"
              value={signUpData.age}
              onChange={handleSignUpChange}
              className="auth-input"
            />
          </label>
          <label className="auth-label" htmlFor="signup-gender">
            <span>Gender</span>
            <input
              id="signup-gender"
              name="gender"
              type="text"
              value={signUpData.gender}
              onChange={handleSignUpChange}
              className="auth-input"
            />
          </label>
          <label className="auth-label" htmlFor="signup-country">
            <span>Country</span>
            <input
              id="signup-country"
              name="country"
              type="text"
              autoComplete="country-name"
              value={signUpData.country}
              onChange={handleSignUpChange}
              className="auth-input"
            />
          </label>
          <button type="submit" className="auth-button">Sign up</button>
          {signUpStatus && (
            <p className={`auth-feedback auth-feedback-${signUpStatus.type}`}>
              {signUpStatus.message}
            </p>
          )}
        </form>
      </div>
      {/* === Leave Review Button === */}
<button
  className="leave-review-button"
  onClick={() => setShowReviewModal(true)}
>
  💬 Leave Review
</button>

{/* === Review Modal === */}
{showReviewModal && (
  <div className="review-modal-overlay">
    <div className="review-modal">
      <button className="close-review-modal" onClick={() => setShowReviewModal(false)}>
        ✕
      </button>
      <h3 className="review-modal-title">Share Your Review</h3>
      <textarea
        className="review-textarea"
        placeholder="Write your review here..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
      />
      <button
        className="submit-review-button"
        onClick={() => {
          if (reviewText.trim()) {
            alert("Thank you for your feedback!");
            setReviewText("");
            setShowReviewModal(false);
          } else {
            alert("Please write something before submitting.");
          }
        }}
      >
        Submit
      </button>
    </div>
  </div>
)}

    </div>
  );
}

export default Page7;
