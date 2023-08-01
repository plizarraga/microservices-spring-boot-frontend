import React from 'react';
import { Button, Modal} from 'react-bootstrap';

// Crear ErrorModal
function ErrorModal({ show, onHide, error }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Ha ocurrido un error</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ErrorModal;
