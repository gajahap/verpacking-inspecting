import React, { useEffect, useState } from 'react';
import Bottom from '../Layouts/Bottom/Bottom';
import { Container, Card, Form, Button } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';

const UserConfiguration = () => {
  const [user, setUser] = useState({ username: '' });

  const [formData, setFormData] = useState({
    username: '',
    old_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    axiosInstance.get(`auth/profile`)
      .then(res => {
        const username = res.data.data.username || '';
        setUser({ username });
        setFormData(prev => ({ ...prev, username }));
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.username !== user.username && !formData.password) {
      alert("Masukan password lama");
      return;
    }

    if (
      formData.username === user.username &&
      !formData.new_password &&
      !formData.new_password_confirmation
    ) {
      return;
    }

    if (formData.new_password !== formData.new_password_confirmation) {
      alert("New password dan new password confirm harus sama");
      return;
    }

    console.log(formData);

    axiosInstance.post(`auth/change-password`, formData)
      .then(res => {
        console.log(res);
        if(!res.data.success) {
          alert(res.data.message);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <>
      <div style={{ position: "relative", height: "30rem" }}>
        <div
          style={{
            height: "100%",
            justifyContent: "center",
            paddingBottom: "100px",
          }}
          className="bg-burgundy-gradient bg-pattern-container text-white p-4 curved-container"
        />
      </div>

      <div
        className="text-white p-4"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
          <Card className="mx-auto my-auto shadow border-0" style={{ width: '18rem' }}>
            <Card.Header className='bg-burgundy-gradient text-white'>
              <h5 className="text-center">User Configuration</h5>
            </Card.Header>
            <Card.Body className="d-flex justify-content-center align-items-center">
              <Form className="w-100" onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className='fw-bold' style={{ fontSize: '12px' }}>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    autoComplete="username"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className='fw-bold' style={{ fontSize: '12px' }}>Password lama</Form.Label>
                  <Form.Control
                    type="password"
                    name="old_password"
                    onChange={handleChange}
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className='fw-bold' style={{ fontSize: '12px' }}>Password baru</Form.Label>
                  <Form.Control
                    type="password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className='fw-bold' style={{ fontSize: '12px' }}>Konfirmasi Password Baru</Form.Label>
                  <Form.Control
                    type="password"
                    name="new_password_confirmation"
                    value={formData.new_password_confirm}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                </Form.Group>
                <Button variant="burgundy" type="submit" className="w-100">Submit</Button>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>

      <Bottom />
    </>
  );
};

export default UserConfiguration;
