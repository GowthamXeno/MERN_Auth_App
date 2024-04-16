import React, { useState, useEffect } from "react";
import { Container, Col, Row, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function HomePage(props) {

  const notifyLoading = () => {
    toast.info("Logging Out Successfull..");
  };

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  const handleLogout = () => {
    axios
      .get("https://mern-authentication-app-ewyj.onrender.com/auth/logout", {
        withCredentials: true,
      })
      .then(() => {
        window.location.href = "/"; 
        setUser(null); 
        localStorage.removeItem("user");
        notifyLoading();
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
        const response = await axios.get(
          `https://mern-authentication-app-ewyj.onrender.com/api/user/profile/`,
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
    <ToastContainer />
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

