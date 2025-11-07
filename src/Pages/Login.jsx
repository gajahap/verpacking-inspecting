import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import axiosInstance from '../axiosConfig';
import MessageModal from '../Components/MessageModal';
import LoadingSpinner from '../Components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isForceLogin, setIsForceLogin] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);


  useEffect(() => {
    console.log(isForceLogin);
  }, [isForceLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('auth/login', {
        username,
        password,
        force_login: isForceLogin
      });

      if (!response.data.success) {
        setModalMessage(response.data.message);
        setShowModal(true);
        return;
      }

      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      navigate('/');
    } catch (error) {
      console.error(error);
      setModalMessage(error.message);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMessage('');
  };
  return (
    isLoading ? (
      <LoadingSpinner />
    ) : (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-burgundy-gradient bg-pattern-container">
        <Row className="w-100 px-2">
          <Col xs={12} sm={10} md={8} lg={6} xl={3} className="mx-auto">
            <>
              <div
                className="text-light py-4"
                style={{ fontWeight: '200', fontSize: '2rem' }}
              >
                Vinspect <b>GAP</b>
              </div>
              <Card className="pb-2 border-white">
                <Card className="px-2 py-4 shadow border-white">
                  <Card.Body>
                    <Card.Title className="text-left mb-4 text-2xl">
                      Please Login First!
                    </Card.Title>
                    <hr />
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="email">
                        <Form.Label className="text-strong">Username</Form.Label>
                        <Form.Control
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="bg-transparent border-burgundy"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="password">
                        <Form.Label className="text-strong">Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-transparent border-burgundy"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="remember">
                        <Form.Check
                          type="checkbox"
                          label="Saya telah login diperangkat lain"
                          className="small-text"
                          name='force_login'
                          checked={isForceLogin}
                          onChange={(e) => setIsForceLogin(e.target.checked)}
                        />
                      </Form.Group>
                      <div className="d-grid">
                        <Button type="submit" variant="burgundy">
                          Login
                        </Button>
                      </div>
                    </Form>
                    <p className="text-center mt-3">
                      <small>
                        Don't have an account? <a href="/register">Register here</a>
                      </small>
                    </p>
                  </Card.Body>
                </Card>
              </Card>
            </>
          </Col>
        </Row>
        <MessageModal
          show={showModal}
          onHide={handleCloseModal}
          title="Error"
          message={modalMessage}
        />
      </Container>
    )
  );
};

export default Login;
