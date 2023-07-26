import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Contact from './components/contact/contact';
import Product from './components/products/product';

function App() {
  

  return (
    <Router>
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg" style={{ height: '90px' }}>
          <Container fluid>
            <Navbar.Brand className="ms-3">Nombre del Ecommerce</Navbar.Brand>

            {/* Agregar los botones en el centro */}
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-center">
              <Link to="/productos" className="btn btn-warning me-2" variant="warning" style={{ marginRight: '10px' }}>Productos</Link>
              <Link to="/contactos" className="btn btn-warning" variant="warning">Contactos</Link>
            </Navbar.Collapse>

            <Navbar.Text className="me-3 ms-auto">Bienvenidos a esta plataforma</Navbar.Text>
          </Container>
        </Navbar>

        <Routes>
          <Route path="/productos" element={<Product />} />
          <Route path="/contactos" element={<Contact />} />
          
        </Routes>
      </div>
    </Router>

  );
}

export default App;
