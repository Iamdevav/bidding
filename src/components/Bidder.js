import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Form,
  Modal,
  Container,
  Alert,
  Spinner,
} from "react-bootstrap";
import "./style.css";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socketIo from "socket.io-client";
import { FaArrowLeft } from "react-icons/fa";
import api from "../api";

const ENDPOINT = "http://localhost:5000";
let socket;

const Bidder = () => {
  const [auctions, setAuctions] = useState([]);
  const [bidderName, setBidderName] = useState("");
  const [showBidderModal, setShowBidderModal] = useState(false);
  const [bidders, setBidders] = useState([]);
  const [bidAmount, setBidAmount] = useState();
  const [userType, setUserType] = useState();
  const [showValidation, setShowValidation] = useState(false);
  const [bidStatus, setBidStatus] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showWonItemToast, setShowWonItemToast] = useState(false);

  useEffect(() => {
    socket = socketIo(ENDPOINT, { transports: ["websocket"] });
    let auctionData;
    socket.on("getAuction", (data) => {
      setAuctions(data);
      auctionData = data;
      if (bidders.length === 0) {
        setBidAmount(
          data.length !== 0 && parseInt(data[data.length - 1].price) + 100
        );
      }
    });
    socket.on("getBids", (data) => {
      setBidders(data);
      if (data.length !== 0) {
        setBidAmount(
          data[data.length - 1].auction_id ===
            auctionData[auctionData.length - 1].id
            ? parseInt(data[data.length - 1].amount) + 100
            : parseInt(auctionData[auctionData.length - 1].price) + 100
        );
      }
    });
  }, [bidStatus]);

  const handleBidderSubmit = async (event) => {
    event.preventDefault();
    if (bidderName.trim() === "") {
      setShowValidation(true);
      return;
    }
    setIsLoggingIn(true);
    if (bidderName) {
      setUserType("Bidder");
      const data = {
        name: bidderName,
        userType: "Biddder",
      };
      await api.post(`login`, data);
      setTimeout(() => {
        setIsLoggingIn(false);
        toast.success("Login successful!");
        setShowBidderModal(true);
      }, 2000);
      setBidAmount(
        auctions.length > 0 && bidders.length === 0
          ? parseInt(auctions[auctions.length - 1].price) + 100
          : bidders[bidders.length - 1]?.auction_id ===
            auctions[auctions.length - 1]?.id
          ? bidders.length !== 0 &&
            parseInt(bidders[bidders.length - 1].amount) + 100
          : parseInt(auctions[auctions.length - 1].price) + 100
      );
    }
  };
  useEffect(() => {
    if (
      auctions.length > 0 &&
      auctions[auctions.length - 1].status === "sold" &&
      bidderName === bidders[bidders.length - 1]?.name &&
      !showWonItemToast
    ) {
      setShowWonItemToast(true);
      toast.success("Congratulations! You won this item!");
    } else if (
      showWonItemToast &&
      (auctions.length === 0 ||
        auctions[auctions.length - 1].status !== "sold" ||
        bidderName !== bidders[bidders.length - 1]?.name)
    ) {
      setShowWonItemToast(false);
    }
  }, [auctions, bidders, bidderName, showWonItemToast]);

  // useEffect(() => {
  //   if (
  //     auctions.length > 0 &&
  //     auctions[auctions.length - 1].status === "sold" &&
  //     bidderName === bidders[bidders.length - 1]?.name &&
  //     !showWonItemToast
  //   ) {
  //     setShowWonItemToast(true);
  //     toast.success("You won this item!");
  //   }
  //   if (
  //     auctions.length > 0 &&
  //     auctions[auctions.length - 1].status === "pending" &&
  //     bidders[bidders.length - 1]?.name !== bidderName &&
  //     !showWonItemToast
  //   ) {
  //     setShowWonItemToast(true);
  //     console.log("heloo toast");
  //     toast.warning(
  //       "You are NOT the highest bidder, Bid again to get back in!"
  //     );
  //   }
  // }, [auctions, bidders, bidderName, showWonItemToast]);
  const handlebidderModalSubmit = async (event) => {
    event.preventDefault();
    const data = {
      auction_id: auctions.length > 0 && auctions[auctions.length - 1].id,
      amount: bidAmount,
      name: bidderName,
    };
    const bidAmountCheck =
      bidders.length !== 0
        ? auctions[auctions.length - 1].id ===
          bidders[bidders.length - 1].auction_id
          ? bidders[bidders.length - 1]?.amount
          : auctions[auctions.length - 1]?.price
        : auctions[auctions.length - 1].price;
    if (bidAmountCheck >= bidAmount) {
      return toast.error("Amount must be more than current price");
    }
    await api.post(`bids`, data);
    setBidStatus(true);
    setTimeout(() => {
      setBidStatus(false);
      toast.success("Your Payment is Successful!");
    }, 1000);
  };
  const handlebidderModalClose = () => {
    setShowBidderModal(false);
  };
  const handleNameChange = (event) => {
    if (showValidation) {
      setShowValidation(false);
    }
    setBidderName(event.target.value);
  };
  return (
    <Container className="container-box">
      <h1 className="heading-text">Bidding Platform</h1>
      <Card className="custom-card">
        <Card.Body>
          <div className="back-button">
            <div>
              <Link to="/">
                <FaArrowLeft className="back-icon" />
              </Link>
            </div>
            <div style={{ marginLeft: "10px" }}>
              <Card.Title>Bidder</Card.Title>
            </div>
          </div>
          <hr />
          {showValidation && (
            <Alert variant="danger">Please enter your name.</Alert>
          )}
          <Form onSubmit={handleBidderSubmit}>
            <Form.Group controlId="auctioneerName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={bidderName}
                onChange={handleNameChange}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoggingIn}
              className="all-button"
            >
              {isLoggingIn ? (
                <>
                  <Spinner animation="border" size="sm" /> Logging in...
                </>
              ) : (
                "Bidder Login"
              )}
            </Button>
          </Form>
        </Card.Body>
        <ToastContainer position="top-right" autoClose={3000} />
      </Card>
      <Modal
        show={showBidderModal}
        onHide={handlebidderModalClose}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Easy Bid</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="item-name">
              <Form.Label>Your Name - </Form.Label>
              <Form.Label className="product-name">{bidderName}</Form.Label>
            </Form.Group>
            {auctions.length > 0 && (
              <Form.Group controlId="item-name">
                <Form.Label>Auction Item - </Form.Label>
                <Form.Label className="product-name">
                  <Form.Label>
                    {auctions.length > 0 && auctions[auctions.length - 1].name}
                  </Form.Label>
                </Form.Label>
              </Form.Group>
            )}
            {auctions.length === 0 && "There is no Auction item"}
            {auctions.length > 0 && (
              <Form.Group controlId="startingPrice" className="mb-3">
                <Form.Label>Current Price -</Form.Label>

                {bidders.length !== 0 ? (
                  <Form.Label>
                    {bidders[bidders.length - 1].auction_id ===
                    auctions[auctions.length - 1].id
                      ? "$" + bidders[bidders.length - 1].amount
                      : auctions[auctions.length - 1].price}
                  </Form.Label>
                ) : (
                  <Form.Label className="product-name">
                    {" "}
                    {"$" + auctions[auctions.length - 1]?.price}
                  </Form.Label>
                )}
              </Form.Group>
            )}
            {auctions.length > 0 && (
              <Form.Group controlId="item-name">
                <Form.Label> Auction Item Current Status -</Form.Label>
                {/* <Form.Label className="current-status">
                  {auctions[auctions.length - 1]?.buttonStatus === "Stop"
                    ? "Stop Auction"
                    : auctions[auctions.length - 1].status !== "pending"
                    ? auctions[auctions.length - 1]?.status === "sold"
                      ? bidderName === bidders[bidders.length - 1]?.name
                        ? `You won this item for $${bidAmount}!`
                        : auctions[auctions.length - 1]?.status
                      : auctions[auctions.length - 1]?.status
                    : bidders[bidders.length - 1]?.name === bidderName
                    ? "You are the highest bidder."
                    : bidders.filter(
                        (data) =>
                          data.auction_id === auctions[auctions.length - 1].id
                      ).length === 0
                    ? "Accepting Bids"
                    : "You are NOT the highest bidder, Bid again to get back in!"}
                </Form.Label> */}
                <Form.Label className="current-status">
                  {auctions[auctions.length - 1]?.buttonStatus === "Stop"
                    ? "Stop Auction"
                    : auctions[auctions.length - 1].status !== "pending"
                    ? auctions[auctions.length - 1]?.status === "sold"
                      ? bidderName === bidders[bidders.length - 1]?.name
                        ? `You won this item for $${
                            bidders[bidders.length - 1]?.amount
                          }!`
                        : auctions[auctions.length - 1]?.status
                      : auctions[auctions.length - 1]?.status
                    : bidders[bidders.length - 1]?.name === bidderName
                    ? "You are the highest bidder."
                    : bidders.filter(
                        (data) =>
                          data.auction_id === auctions[auctions.length - 1].id
                      ).length === 0
                    ? "Accepting Bids"
                    : "You are NOT the highest bidder, Bid again to get back in!"}
                </Form.Label>
                <hr />
                {bidders[bidders.length - 1]?.auction_id ===
                auctions[auctions.length - 1].id ? (
                  <div className="price-container">
                    <div>
                      <p>{bidders[bidders.length - 1].name}</p>
                    </div>
                    <div>
                      <p> {"$" + bidders[bidders.length - 1].amount}</p>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </Form.Group>
            )}
            <hr />${" "}
            <input
              type="number"
              className="text-center "
              style={{ width: "30%" }}
              disabled={
                auctions.length !== 0 &&
                auctions[auctions.length - 1].buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                  ? true
                  : auctions[auctions.length - 1].status !== "pending" && true
              }
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
            <Button
              variant="primary"
              type="submit"
              className="extra-button"
              onClick={(e) => handlebidderModalSubmit(e)}
              disabled={
                auctions.length !== 0 &&
                auctions[auctions.length - 1].buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                  ? true
                  : auctions[auctions.length - 1].status !== "pending" && true
              }
            >
              Bid
            </Button>
            <Button
              variant="white"
              className="extra-button"
              onClick={() => {
                setBidAmount(parseInt(bidAmount) + 100);
              }}
              disabled={
                auctions.length !== 0 &&
                auctions[auctions.length - 1].buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                  ? true
                  : auctions[auctions.length - 1].status !== "pending" && true
              }
            >
              +100
            </Button>
            <Button
              variant="white"
              className="extra-button"
              onClick={() => setBidAmount(parseInt(bidAmount) + 200)}
              disabled={
                auctions.length !== 0 &&
                auctions[auctions.length - 1].buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                  ? true
                  : auctions[auctions.length - 1].status !== "pending" && true
              }
            >
              +200
            </Button>
            <Button
              variant="danger"
              className="extra-button"
              onClick={() =>
                setBidAmount(bidders[bidders.length - 1].amount + 100)
              }
              disabled={
                auctions.length !== 0 &&
                auctions[auctions.length - 1].buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                  ? true
                  : auctions[auctions.length - 1].status !== "pending" && true
              }
            >
              Reset
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Bidder;
