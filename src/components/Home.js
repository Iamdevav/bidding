import React, { useEffect, useState } from "react";
import { Card, Button, Form, Row, Col, Container } from "react-bootstrap";
import "./style.css";

import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleAuctionClick = () => {
    navigate("/auction");
  };
  const handleBidderClick = () => {
    navigate("/bidder");
  };
  return (
    <Container className="container-box">
      <h1 className="heading-text">Bidding Platform</h1>
      <div>
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Please Choose One</Card.Title>
                <hr />

                <Form>
                  <Form.Group
                    controlId="auctioneerName"
                    className="mb-4"
                  ></Form.Group>
                  <Row>
                    <Col>
                      <Button
                        variant="primary"
                        className="all-button"
                        onClick={handleAuctionClick}
                      >
                        Auction Login
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        className="all-button"
                        onClick={handleBidderClick}
                      >
                        Bidder Login
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default Home;
