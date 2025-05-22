import React from 'react';
import { Modal } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap';

const LoadingSpinnerModal = ({ show, children }) => {
  return (
    <Modal show={show} onHide={() => {}} style={{ border: "none" }} centered>
      <Modal.Header className='bg-burgundy-gradient text-white'>
        System Message:
      </Modal.Header>
      <Modal.Body className="d-flex flex-column align-items-center justify-content-center py-5">
        <Spinner variant='burgundy' />
        <h6 className='text-burgundy mt-3'>Mohon Tunggu</h6>
        {children} {/* <--- Tambahkan ini */}
      </Modal.Body>
    </Modal>
  );
};


export default LoadingSpinnerModal;
