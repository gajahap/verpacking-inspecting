import React from 'react';
import { Modal, Button, Stack } from 'react-bootstrap';

const ConfirmModal = (props) => {
  const handleConfirm = () => {
    props.onConfirm(true);
  };

  const handleCancel = () => {
    props.onConfirm(false);
  };

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body>
        <Stack className='text-center'>
            <h5>{props.title}</h5>
            Apakah anda yakin?
            <hr />
            <Button variant="" className="text-primary text-strong p-0" onClick={handleConfirm}>
                YA
            </Button>
            <hr />
            <Button variant="" className="text-danger text-strong p-0" onClick={handleCancel}>
                BATAL
            </Button>

        </Stack>

      </Modal.Body>

    </Modal>
  );
};

export default ConfirmModal;


