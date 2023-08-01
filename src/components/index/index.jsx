import { Container, Row, Col } from "react-bootstrap"

function Index() {
    return (
        <Container>
            <Row className="justify-content-center" >
                <Col xs={12} md={8} lg={6}>
                    <h1 className="text-center mt-5" style={{ fontSize: '3em' }}>¡Bienvenidos a esta pagina</h1>
                    <p className="text-center mt-4">
                        En el menu de arriba encontraran las opciones para navegar en nuestras diferentes secciones.
                    </p>
                </Col>
            </Row>
        </Container>
    )

}

export default Index;

