import React, { useState } from "react";
import { Container, Col, Row } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ResetPwPage() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const notifySuccess = (message) => {
    toast.success(message);
  };

  const notifyError = (error) => {
    toast.error(error.message || "An error occurred");
  };

  const notifyLoading = () => {
  toast.info("Sending Reset Request...");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    notifyLoading();
    try {
      const response = await axios.post(
        "https://mern-authentication-app-ewyj.onrender.com/password/reset-password",
        { resetToken: token, newPassword }
      );
      setMessage(response.data.message);
      notifySuccess(response.data.message);
    } catch (error) {
      console.error(
        "Reset password error:",
        error.response ? error.response.data : error
      );
      notifyError(error);
    }
  };

  const handleGoToLogin = () => {
    window.location.href = "/";
  };

  
  return (
    <>
      <ToastContainer />
      <div className="LoginPage">
        <Container className="LoginPageContainer">
          <Row className="PwPageContainer">
            <Col md={12}>
              <div className="PwPage">
                <h1>Reset Password</h1>
                <p>Enter your new password below</p>
                <form className="form-pw" onSubmit={handleSubmit}>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    required
                  />
                  <button type="submit">Reset Password</button>
                </form>
                {message && (
                  <div className="ResponseDiv">
                    <p>{message}</p>
                    <button onClick={handleGoToLogin}>Back to Login</button>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default ResetPwPage;
