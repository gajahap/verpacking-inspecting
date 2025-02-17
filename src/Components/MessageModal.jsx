import React from 'react';
import { Modal, Button, Stack } from 'react-bootstrap';

const MessageModal = (props) => {
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
            <h5>{props.status === 200 ? 'Berhasil' : props.status === 422 ? 'Gagal mengirim data' : props.title}</h5>
            {props.message}
            <hr />
            <Button variant="" className="text-primary text-strong" onClick={props.onHide}>
                OK
            </Button>
        </Stack>

      </Modal.Body>

    </Modal>
  );
};

export default MessageModal;

