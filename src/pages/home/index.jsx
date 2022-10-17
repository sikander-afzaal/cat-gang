import { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import Moment from "react-moment";
import mmt from "moment";
import xicon from "../../assets/x.png";
import Web3 from "web3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faWallet } from "@fortawesome/free-solid-svg-icons";
import { REBELXCREW_CONTRACT } from "../../constants/contracts";

const RPC_URL = "https://mainnet.infura.io/v3/bf44c3914d374866a61b9055a40b908f";
const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
const nftContract = new web3.eth.Contract(
  REBELXCREW_CONTRACT.abi,
  REBELXCREW_CONTRACT.address
);

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "500px",
    maxWidth: "100%",
  },
};

const Home = ({ mintItem, connect, killSession, connected }) => {
  const [mintedCount, setMintedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [msgTitle, setMsgTitle] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [selected, setSelected] = useState(0);
  const [toggleBtn, setToggleBtn] = useState(false);
  const [stateOfNft, setStateOfNft] = useState(1); // for the arrows in first page
  const handleClose = () => setShow(false);
  const [count, setCount] = useState(0);
  const [timerDays, setTimerDays] = useState("00");
  const [timerHours, setTimerHours] = useState("00");
  const [timerMinutes, setTimerMinutes] = useState("00");
  const [timerSeconds, setTimerSeconds] = useState("00");
  let interval = useRef();
  const handleShow = () => setShow(true);

  // const dateToFormat = "2022-10-20";

  const countDown = () => {
    if (selected >= 1) {
      setSelected((prev) => prev - 1);
    }
  };

  const countUp = () => {
    if (selected < 10) {
      setSelected((prev) => prev + 1);
    }
  };

  useEffect(async () => {
    await getMintedAmount();
  });

  const getMintedAmount = async () => {
    const result = await nftContract.methods.totalSupply().call();
    setMintedCount(result);
  };

  const onMintItem = async () => {
    if (count < 1) {
      setMsgTitle("Sorry!");
      setMsgContent("Minimum NFT Amount Must Be Greater Than 1");
      handleShow();
    } else {
      setIsLoading(true);
      let result = await mintItem(count);
      if (result > 0) {
        await getMintedAmount();
        setIsLoading(false);
        setMsgTitle("Congratulations!");
        setMsgContent("Your Mint has been successfully!");
        handleShow();
      } else if (result == 0) {
        setIsLoading(false);
        setMsgTitle("Sorry!");
        setMsgContent("Public Sale is not active yet.");
        handleShow();
      } else {
        setIsLoading(false);
        setMsgTitle("Sorry!");
        setMsgContent("Your Mint failed.");
        handleShow();
      }
    }
  };

  const [timeStatus, setTimeStatus] = useState(false);

  // const launchDuration = () => {
  //   var now = mmt(new Date());
  //   var end = mmt(dateToFormat);
  //   var duration = mmt.duration(now.diff(end));
  //   if (duration >= 0) {
  //     setTimeStatus(true);
  //   }
  // };

  // const onNotify = () => {
  //   setMsgTitle("Sorry!");
  //   setMsgContent("Please Connect Your Wallet.");
  //   handleShow();
  // };
  //TIMER -----------------------------------
  const startTimer = () => {
    let end = new Date("10/22/2022 3:00 PM");
    interval = setInterval(() => {
      let _second = 1000;
      let _minute = _second * 60;
      let _hour = _minute * 60;
      let _day = _hour * 24;
      let now = new Date();
      let nowUTC = new Date(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      );
      let distance = end - nowUTC;
      var days = Math.floor(distance / _day);
      var hours = Math.floor((distance % _day) / _hour);
      var minutes = Math.floor((distance % _hour) / _minute);
      var seconds = Math.floor((distance % _minute) / _second);
      if (distance < 0) {
        clearInterval(interval.current);
        return;
      } else {
        setTimerDays(days);
        setTimerHours(hours);
        setTimerMinutes(minutes);
        setTimerSeconds(seconds);
      }
    });
  };
  useEffect(() => {
    startTimer();
    return () => {
      clearInterval(interval.current);
    };
  });
  return (
    // <div style={{ backgroundImage: "url('background.png')", backgroundSize: 'cover' }}>
    //     <Container className="content-container">
    //         <Row>
    //             <Col md={12} className="connect-wallet-container">
    //                 <div className="btn-container">
    //                     <div style={{height: '30px'}}></div>
    //                     {connected ? (
    //                         <button className="connect-wallet-btn" onClick={killSession}>
    //                             <div className="connect-wallet">Connected Wallet</div>
    //                         </button>
    //                     ) : (
    //                         <button className="connect-wallet-btn" onClick={connect}>
    //                             <div className="connect-wallet">Connect Wallet</div>
    //                         </button>
    //                     )}
    //                 </div>
    //             </Col>
    //         </Row>
    //         <Row>
    //             <Col md={6} sm={0}>
    //                 <div className="left-container">
    //                     <video autoPlay muted loop playsInline className="left-video">
    //                         <source
    //                         src="assets/intro.mp4"
    //                         type="video/mp4"
    //                         />
    //                     </video>
    //                 </div>
    //             </Col>
    //             <Col md={6}>
    //                 <div className="right-container">
    //                     <div className="logo-container">
    //                         <img src='logo.png' className="logo-image" />
    //                     </div>
    //                     <div className="rebel-text">{mintedCount} / 4444 REBELS</div>
    //                     {timeStatus ? (
    //                         <div style={{ textAlign: 'center' }}>
    //                             <div className="price-text mb-3">
    //                                 PRICE: { parseFloat(0.1 * count).toFixed(1)} ETH
    //                             </div>
    //                             <div style={{ marginBottom: '30px' }}>
    //                                 <div className="control-container">
    //                                     <div style={{ display: 'inline-block' }}>
    //                                         <button className="count-btn" onClick={countDown}>
    //                                             <div className="mark-container">-</div>
    //                                         </button>
    //                                     </div>
    //                                     <div style={{ display: 'inline-block' }}>
    //                                         <div style={{ width: '120px', color: '#B7FF00' }}>{count}</div>
    //                                     </div>
    //                                     <div style={{ display: 'inline-block' }}>
    //                                         <button className="count-btn" onClick={countUp}>
    //                                             <div className="mark-container">+</div>
    //                                         </button>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                             <div className="mint-btn-container">
    //                                 {connected ? (
    //                                     isLoading == true ? (
    //                                         <button className="mint-btn">
    //                                             <div className="mint-btn-text">
    //                                                 <Spinner
    //                                                     as="span"
    //                                                     animation="grow"
    //                                                     size="sm"
    //                                                     role="status"
    //                                                     aria-hidden="true"
    //                                                 />
    //                                             </div>
    //                                         </button>
    //                                     ) : (
    //                                         <button className="mint-btn" onClick={onMintItem}>
    //                                             <div className="mint-btn-text">Mint Now</div>
    //                                         </button>
    //                                     )
    //                                 ) : (
    //                                     <button className="mint-btn" onClick={onNotify}>
    //                                         <div className="mint-btn-text">Mint Now</div>
    //                                     </button>
    //                                 )}
    //                             </div>
    //                         </div>
    //                     ) : (
    //                         <div className="rebel-text pt-3 pb-5 launchTime-container">
    //                             Launch in
    //                             <Moment interval={1000} date={dateToFormat} format="dd:hh:mm:ss" durationFromNow onChange={launchDuration} />
    //                         </div>
    //                     )}
    //                     <div className="rebel-text pt-3 pb-5 launchTime-container">
    //                             Launch in
    //                             <Moment interval={1000} date={dateToFormat} format="dd:hh:mm:ss" durationFromNow onChange={launchDuration} />
    //                         </div>
    //                 </div>
    //             </Col>
    //         </Row>
    //         <div className="icon-img-container">
    //             <a href="https://discord.gg/rebelxcrew" target="_blank" title="Discord">
    //                 <img className="icon-img" src="assets/images/discord-img.png" />
    //             </a>
    //             <a href="https://opensea.io/collection/rebelxcrew" target="_blank" title="Opensea">
    //                 <img className="icon-img" src="assets/images/opensea-img.png" />
    //             </a>
    //             <a href="https://looksrare.org/collections/0x4AC710eD2F55c60ADdeea5f94C44e1C618b0765d" target="_blank" title="Looksrare">
    //                 <img className="icon-img" src="assets/images/looksrare-img.png" />
    //             </a>
    //             <a href="https://rarible.com/collection/0x4ac710ed2f55c60addeea5f94c44e1c618b0765d/items" target="_blank" title="Rarible">
    //                 <img className="icon-img" src="assets/images/rarible-img.png" />
    //             </a>
    //             <a href="https://mintable.app/store/RebelXCrew/0x4ac710ed2f55c60addeea5f94c44e1c618b0765d" target="_blank" title="Mintable">
    //                 <img className="icon-img" src="assets/images/mintable-img.png" />
    //             </a>
    //         </div>
    //     </Container>
    //     <Modal
    //         isOpen={show}
    //         onRequestClose={handleClose}
    //         style={customStyles}
    //     >
    //         <div style={{ width: '100%', padding: '20px', cursor: 'pointer', textAlign: 'right' }}>
    //             <img src={xicon} className='modal1-close-btn' onClick={handleClose} />
    //         </div>
    //         <div className='modal1-text'>
    //             <h2 style={{ textAlign: 'center' }}>{msgTitle}</h2>
    //             <div style={{ textAlign: 'center', width: '100%', marginTop: '40px' }}>
    //                 <h4>{msgContent}</h4>
    //             </div>
    //         </div>
    //         <div style={{ textAlign: 'center', width: '100%', margin: '60px 0 30px 0' }}>
    //             <button className="mint-btn" onClick={handleClose}>
    //                 <div className="mint-btn-text">Close</div>
    //             </button>
    //         </div>
    //     </Modal>
    // </div>
    <div className="container-main">
      <header>
        <div className="flex desktop">
          <img src="/logo.png" alt="" />
          <button className="home-btn">Home</button>
        </div>
        <div className="mobile back">
          <FontAwesomeIcon icon={faChevronLeft} />
          <p>HOME</p>
        </div>
        <p className="desktop">
          <strong>CONGRATULATIONS,</strong> YOU ARE ONE OF THE LUCKY FEW WHO
          MADE IT TO OUR WHITELIST! <br /> YOU ARE ABLE TO MINT UP TO 10 NFTS AT
          THE PRICE OF 0.05 ETH
        </p>
        <img src="/cat-logo.png" className="mobile" alt="" />
        {connected ? (
          <button className="connect-wallet-btn desktop " onClick={killSession}>
            <FontAwesomeIcon icon={faWallet} />
            Connected
          </button>
        ) : (
          <button className="connect-wallet-btn desktop " onClick={connect}>
            <FontAwesomeIcon icon={faWallet} />
            Connect Wallet
          </button>
        )}
        <button
          className={`mobile toggle-btn ${toggleBtn ? "active-toggle" : ""}`}
          onClick={() =>
            setToggleBtn((prev) => {
              if (prev) {
                killSession();
              } else {
                connect();
              }
              return !prev;
            })
          }
        >
          <FontAwesomeIcon icon={faWallet} />
        </button>
      </header>
      <div className="main-mint-page">
        <p className="mobile">
          <strong>CONGRATULATIONS,</strong> YOU ARE ONE OF THE LUCKY FEW WHO
          MADE IT TO OUR WHITELIST! <br /> YOU ARE ABLE TO MINT UP TO 10 NFTS AT
          THE PRICE OF 0.05 ETH
        </p>
        {isMinted && window.innerWidth < 1305 ? (
          <></>
        ) : (
          <div className="left-mint">
            <div className="tab-row">
              <div className="tab">
                <img src="/tab1.svg" alt="" />
                <div className="tab-text">
                  <p>WHITELISTERS</p>
                  <h2>0.05 ETH</h2>
                </div>
              </div>
              <div className="tab">
                <img
                  src={`/tab2-${stateOfNft === 2 ? "purple" : "black"}.svg`}
                  alt=""
                />
                <div className="tab-text">
                  <p>Public Sale</p>
                  <h2>0.06 ETH</h2>
                </div>
              </div>
              <div className="tab">
                <img
                  src={`/tab2-${stateOfNft === 3 ? "purple" : "black"}.svg`}
                  alt=""
                />
                <div className="tab-text">
                  <p>Revel</p>
                  <h2>0.07 ETH</h2>
                </div>
              </div>
            </div>
            <div className="mint-section">
              <img
                src={selected > 0 ? "/select.png" : "/unselect.png"}
                alt=""
              />
              <div className="select-mint">
                <img
                  onClick={() => setSelected(1)}
                  className={selected >= 1 ? "selected" : ""}
                  src="/small.png"
                  alt=""
                />
                <img
                  onClick={() => setSelected(2)}
                  className={selected >= 2 ? "selected" : ""}
                  src="/small.png"
                  alt=""
                />
                <img
                  onClick={() => setSelected(3)}
                  className={selected >= 3 ? "selected" : ""}
                  src="/small.png"
                  alt=""
                />
                <img
                  onClick={() => setSelected(4)}
                  className={selected >= 4 ? "selected" : ""}
                  src="/small.png"
                  alt=""
                />
                <img
                  onClick={() => setSelected(5)}
                  className={selected >= 5 ? "selected" : ""}
                  src="/small.png"
                  alt=""
                />
                <img
                  onClick={() => setSelected(6)}
                  className={selected >= 6 ? "selected" : ""}
                  src="/small.png"
                  alt=""
                />
                <img
                  onClick={() => setSelected(7)}
                  className={selected >= 7 ? "selected" : ""}
                  src="/small.png"
                  alt=""
                />
                <img
                  onClick={() => setSelected(8)}
                  className={selected >= 8 ? "selected" : ""}
                  src="/small.png"
                  alt=""
                />
                <img
                  onClick={() => setSelected(9)}
                  className={selected >= 9 ? "selected" : ""}
                  src="/small.png"
                  alt=""
                />
                <img
                  onClick={() => setSelected(10)}
                  className={selected >= 10 ? "selected" : ""}
                  src="/small.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        )}
        <div className="right-mint">
          <div className="purple-box">
            {isMinted ? (
              <div className="desktop2">
                <img src="/cat-logo.png" alt="" />
                <p className="congrats">
                  <strong>Congragulation</strong> <br /> on your
                </p>
                <h1 className="minted">
                  05 <span>MINT/S</span>
                </h1>
                <h3 className="spread">Spread the word</h3>
                <img className="twitter" src="/twitter.png" alt="" />
              </div>
            ) : (
              <>
                <img src="/cat-logo.png" alt="" />
                <h1>Pre-sale-mint</h1>
                <div className="calc-div">
                  <h2 className="desktop">
                    Amount <br /> <span>max 10</span>
                  </h2>
                  <button onClick={countDown}>-</button>
                  <h3>
                    {selected <= 9 ? `0${selected}` : selected} <br />{" "}
                    <span className="mobile">max 10</span>
                  </h3>
                  <button onClick={countUp}>+</button>
                  <button
                    onClick={() => setSelected(10)}
                    className="max desktop"
                  >
                    MAX
                  </button>
                </div>
                <div className="total-div">
                  <p>TOTAL</p>
                  <h2>
                    0.00<span>ETH</span>
                  </h2>
                </div>
                <p className="desktop">
                  REMAINING <br /> <span>8967 / 9900</span>
                </p>
                {connected ? (
                  <button className="connect" onClick={killSession}>
                    <FontAwesomeIcon icon={faWallet} />
                    Connected
                  </button>
                ) : (
                  <button className="connect" onClick={connect}>
                    <FontAwesomeIcon icon={faWallet} />
                    Connect Wallet
                  </button>
                )}
              </>
            )}
          </div>
          {isMinted ? (
            <div className="mobile congrats-mob">
              <p>
                <strong>Congragulation</strong> <br /> on your
              </p>
              <div className="mint-box-mobile">
                <h1>
                  05 <span>MINT/S</span>
                </h1>
                <div className="purple-count">
                  <h2>Countdown to nft revel</h2>
                  <div className="timer-div">
                    <div className="time-box">
                      <h1>{timerDays < 10 ? `0${timerDays}` : timerDays}</h1>
                      <h3>Days</h3>
                    </div>
                    <p>:</p>
                    <div className="time-box">
                      <h1>{timerHours < 10 ? `0${timerHours}` : timerHours}</h1>
                      <h3>Hour</h3>
                    </div>
                    <p>:</p>
                    <div className="time-box">
                      <h1>
                        {timerMinutes < 10 ? `0${timerMinutes}` : timerMinutes}
                      </h1>
                      <h3>Minutes</h3>
                    </div>
                    <p>:</p>
                    <div className="time-box">
                      <h1>
                        {timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                      </h1>
                      <h3>Seconds</h3>
                    </div>
                  </div>
                </div>
              </div>
              <img src="/date.png" alt="" />
              <h3 className="spread">Spread the word</h3>
              <img className="twitter" src="/twitter.png" alt="" />
            </div>
          ) : (
            <div className="countdown-div">
              <div className="left-count">
                <h2>Countdown to nft revel</h2>
                <div className="timer-div">
                  <div className="time-box">
                    <h1>{timerDays < 10 ? `0${timerDays}` : timerDays}</h1>
                    <h3>Days</h3>
                  </div>
                  <p>:</p>
                  <div className="time-box">
                    <h1>{timerHours < 10 ? `0${timerHours}` : timerHours}</h1>
                    <h3>Hour</h3>
                  </div>
                  <p>:</p>
                  <div className="time-box">
                    <h1>
                      {timerMinutes < 10 ? `0${timerMinutes}` : timerMinutes}
                    </h1>
                    <h3>Minutes</h3>
                  </div>
                  <p>:</p>
                  <div className="time-box">
                    <h1>
                      {timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                    </h1>
                    <h3>Seconds</h3>
                  </div>
                </div>
              </div>
              <img src="/date.png" alt="" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
