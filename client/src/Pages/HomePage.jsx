import React, { useState, useEffect } from "react";
import { Container, Col, Row, Button, Spinner } from "react-bootstrap";
import axios from "axios";

function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fullCookie = urlParams.get("cookie");
    console.log("Cookie = ", fullCookie);


    if (fullCookie) {
      localStorage.setItem("fullCookie", fullCookie);
    }
  }, []);

  const handleLogout = () => {
    axios
      .get("https://mern-auth-app-5g6h.onrender.com/auth/logout", {
        withCredentials: true,
      })
      .then(() => {
        window.location.href = "/"; // Redirect to login page
        setUser(null); // Clear user data in the frontend
        localStorage.removeItem("user");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  const fetchUser = async () => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
      setLoading(false);
    } else {
      try {

         const token = localStorage.getItem("fullCookie"); // Replace with your actual JWT token

        const response = await axios.get(
          `https://mern-auth-app-5g6h.onrender.com/api/user/profile/`,
          // `http://localhost:8080/api/user/profile/?token=${token}`,
          {
            withCredentials: true,
          }
        );
        setUser(response.data.user);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      <div className="LoginPage">
        <Container className="HomePageContainer ProfileContainer">
          {loading ? (
            <div className="loader">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : user ? (
            <>
              <Row>
                <Col md={12}>
                  <h1>Welcome to MERN Auth App</h1>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <h1>Profile</h1>
                  <div className="profile-info">
                    <div className="profile-image">
                      <img src={user.profilePicture} alt="Profile" />
                    </div>
                    <div className="profile-details">
                      <p>Username: {user.username}</p>
                      <p>Email: {user.email}</p>
                    </div>
                  </div>
                  <Button onClick={handleLogout}>Logout</Button>
                </Col>
              </Row>
            </>
          ) : (
            <Row>
              <Col md={12}>
                <h1>Logging out...</h1>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </>
  );
}

export default HomePage;

