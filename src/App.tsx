import * as React from "react";
import { Router, Route, Switch, BrowserRouter } from "react-router-dom";
import { createBrowserHistory } from "history";

import Web3 from "web3";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

import WalletConnectProvider from "@walletconnect/web3-provider";

import { apiGetAccountAssets } from "./helpers/api";
import { getChainData } from "./helpers/utilities";
import { IAssetData } from "./helpers/types";
import { REBELXCREW_CONTRACT } from "./constants/contracts";
import { toHex } from "./helpers/utils";

import Home from "./pages/home/index.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer";

interface IAppState {
  fetching: boolean;
  address: string;
  web3: any;
  signer: any;
  provider: any;
  library: any;
  connected: boolean;
  chainId: number;
  networkId: number;
  assets: IAssetData[];
  showModal: boolean;
  pendingRequest: boolean;
  result: any | null;
  isHide: boolean;
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  address: "",
  web3: null,
  signer: null,
  provider: null,
  library: null,
  connected: false,
  chainId: 1,
  networkId: 1,
  assets: [],
  showModal: false,
  pendingRequest: false,
  result: null,
  isHide: true,
};

function initWeb3(provider: any) {
  const web3: any = new Web3(provider);

  web3.eth.extend({
    methods: [
      {
        name: "chainId",
        call: "eth_chainId",
        outputFormatter: web3.utils.hexToNumber,
      },
    ],
  });
  return web3;
}

const history = createBrowserHistory();
class App extends React.Component<any, any> {
  public web3Modal: Web3Modal;
  public state: IAppState;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
    };

    this.web3Modal = new Web3Modal({
      network: this.getNetwork(),
      cacheProvider: true,
      providerOptions: this.getProviderOptions(),
      theme: {
        background: "rgba(43, 51, 94, 0.9)",
        main: "rgb(250, 250, 250)",
        secondary: "rgba(250, 250, 250, 0.7)",
        border: "rgba(196, 196, 196, 0.3)",
        hover: "rgba(53, 61, 104, 0.75)",
      },
    });
  }

  public componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      // this.onConnect();
    }
    this.setState({ isHide: true });
  }

  public onConnect = async () => {
    this.setState({ isHide: true });
    const provider = await this.web3Modal.connect();
    const library = new ethers.providers.Web3Provider(provider);
    const signer = library.getSigner();

    await this.subscribeProvider(provider);
    const web3: any = initWeb3(provider);
    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];
    const networkId = await web3.eth.net.getId();
    const chainId = await web3.eth.chainId();

    await this.setState({ library, signer });
    if (networkId !== 1) await this.switchNetwork();

    await this.setState({
      web3,
      provider,
      connected: true,
      address,
      chainId,
      networkId,
    });
    await this.getAccountAssets();
    await this.getMintedAmount();
  };

  public subscribeProvider = async (provider: any) => {
    if (!provider.on) {
      return;
    }
    provider.on("close", () => this.resetApp());
    provider.on("accountsChanged", async (accounts: string[]) => {
      await this.setState({ address: accounts[0] });
      await this.getAccountAssets();
    });
    provider.on("chainChanged", async (chainId: number) => {
      const { web3 } = this.state;
      const networkId = await web3.eth.net.getId();
      await this.setState({ chainId, networkId });
      await this.getAccountAssets();
    });

    provider.on("networkChanged", async (networkId: number) => {
      const { web3 } = this.state;
      const chainId = await web3.eth.chainId();
      await this.setState({ chainId, networkId });
      await this.getAccountAssets();
    });
  };

  public getNetwork = () => getChainData(this.state.chainId).network;

  public getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID,
        },
      },
    };
    return providerOptions;
  };

  public switchNetwork = async () => {
    const { library } = this.state;
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(1) }],
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAccountAssets = async () => {
    const { address, chainId } = this.state;
    this.setState({ fetching: true });
    try {
      const assets = await apiGetAccountAssets(address, chainId);

      await this.setState({ fetching: false, assets });
    } catch (error) {
      console.error(error);
      await this.setState({ fetching: false });
    }
  };

  public onMintItem = async (amount: number) => {
    const { signer } = this.state;
    try {
      const contract = new ethers.Contract(
        REBELXCREW_CONTRACT.address,
        REBELXCREW_CONTRACT.abi,
        signer
      );
      let mintPrice = await contract.PRICE();
      let payPrice = (mintPrice.toString() / Math.pow(10, 18)) * amount;
      const pubSaleActive = await contract._isPublicSaleActive();
      if (pubSaleActive) {
        const mintTx = await contract.create(amount, {
          value: ethers.utils.parseUnits(payPrice.toString(), 18),
        });
        const mintTxReceipt = await mintTx.wait();
        if (mintTxReceipt.status !== 1) {
          return -1;
        } else {
          return 1;
        }
      } else {
        return 0;
      }
    } catch (error) {
      return -1;
    }
  };

  public getMintedAmount = async () => {
    const { signer } = this.state;
    try {
      const contract = new ethers.Contract(
        REBELXCREW_CONTRACT.address,
        REBELXCREW_CONTRACT.abi,
        signer
      );
      const mintTx = await contract.totalSupply();
      console.log("---------------", mintTx.toString());
      const mintTxReceipt = await mintTx.wait();
      if (mintTxReceipt.status !== 1) {
        return -1;
      } else {
        return 1;
      }
    } catch (error) {
      return -1;
    }
  };

  public toggleModal = () =>
    this.setState({ showModal: !this.state.showModal });

  public resetApp = async () => {
    const { web3 } = this.state;
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await this.web3Modal.clearCachedProvider();
    this.setState({ ...INITIAL_STATE });
  };

  public _onHideMenu = (bool: boolean) => {
    this.setState({ isHide: bool });
  };

  public render = () => {
    const { connected } = this.state;
    return (
      <div className="App">
        <BrowserRouter>
          <Header />
          <Router history={history}>
            <Switch>
              <Route
                exact
                path="/"
                render={() => (
                  <Home
                    mintItem={this.onMintItem}
                    connect={this.onConnect}
                    killSession={this.resetApp}
                    connected={connected}
                  />
                )}
              />
            </Switch>
          </Router>
          <Footer />
        </BrowserRouter>
      </div>
    );
  };
}

export default App;
