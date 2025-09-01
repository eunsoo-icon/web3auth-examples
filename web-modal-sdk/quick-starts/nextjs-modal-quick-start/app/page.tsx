/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */

"use client";

// IMP START - Quick Start
import {
  IAdapter,
  IProvider,
  WEB3AUTH_NETWORK,
  getEvmChainConfig,
  WEB3AUTH_NETWORK_TYPE
} from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
// IMP END - Quick Start
import { useEffect, useState } from "react";

// IMP START - Blockchain Calls
import RPC from "./ethersRPC";
import { AuthAdapter, LoginConfig } from "@web3auth/auth-adapter";
// import RPC from "./viemRPC";
// import RPC from "./web3RPC";
// IMP END - Blockchain Calls

// IMP START - Dashboard Registration
const configs: {name: string, clientId: string, web3AuthNetwork: WEB3AUTH_NETWORK_TYPE, loginConfig?: LoginConfig}[] = [
  {
    name: "Web3auth examples",
    clientId: "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ",
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  },
  {
    name: "Supercycl",
    clientId: "BKJLN8dF895jB7Y0iKjGX6s3wpnrKHZdShbXhGfFeQ8q_QRL1jNCWt9TtsOgPKz3lA5jX9hKIDD-25V1gClUCrU",
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    loginConfig: {
      google: {
        verifier: "group-google-login",
        verifierSubIdentifier: "supecycl-google-login",
        // verifier: "supercycl-google-auth",
        typeOfLogin: "google",
        clientId: "484626646693-g2gu470r38u70hdegst1rve07v0oeu6m",
      },
    },
  },
  {
    name: "Hana Wallet v4.1.3",
    clientId: "BM3yT6NmMXOrwztsgF1V15ZxVOVjG6q3nRr9baQaOSrkRLFq-J40dvzZA-S6TSkWYOwgszkS1Y1aYMAQCPbL5oE",
    web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
    loginConfig: {
      google: {
        // TODO different wallet address with Hana. Need to check the configuration
        // hana wallet v4.1.3 address: 0xa976653De0AD943c62babe090a3476124B70Fb74
        // this example address: 0x7f466b2830C6bBfD9386D5D73727dA47A7EE33FA
        verifier: "hana-google-aggregate",
        verifierSubIdentifier: "hana-google-chrome-test2",
        typeOfLogin: "google",
        clientId: "126616343848-09it14orn4odu9mfuads76u3kf5odogs",
      },
    },
  },
];
// IMP END - Dashboard Registration

function App() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [configIndex, setconfigIndex] = useState<number>(0);
  const [editorValue, setEditorValue] = useState(JSON.stringify(configs[0], null, 2));
  const [initWeb3auth, setInitWeb3auth] = useState(false);
  const [web3auth, setWeb3Auth] = useState<Web3Auth | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!initWeb3auth) return;
      try {
        console.log("init web3auth with configIndex", configIndex);
// IMP START - Chain Config
        const config = configs[configIndex] || configs[0];
        const chainId = 0xaa36a7; // Sepolia testnet
// Get custom chain configs for your chain from https://web3auth.io/docs/connect-blockchain
        const chainConfig = getEvmChainConfig(chainId, config.clientId)!;
// IMP END - Chain Config

// IMP START - SDK Initialization
        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: {chainConfig},
        });

        const web3AuthOptions: Web3AuthOptions = {
          clientId: config.clientId,
          web3AuthNetwork: config.web3AuthNetwork,
          privateKeyProvider,
        }
        const w3a = new Web3Auth(web3AuthOptions);
        setWeb3Auth(w3a);
// IMP END - SDK Initialization

        // IMP START - Configuring External Wallets
        const adapters = await getDefaultExternalAdapters({options: web3AuthOptions});
        adapters.forEach((adapter: IAdapter<unknown>) => {
          w3a.configureAdapter(adapter);
        });
        // IMP END - Configuring External Wallets
        // configure adapter

        const authAdapter = new AuthAdapter({
          adapterSettings: {
            whiteLabel: {
              appName: config.name,
              logoLight: "https://web3auth.io/images/web3authlog.png",
              logoDark: "https://web3auth.io/images/web3authlogodark.png",
              defaultLanguage: "ko", // en, de, ja, ko, zh, es, fr, pt, nl
              mode: "dark", // whether to enable dark mode. defaultValue: false
            },
            loginConfig: config.loginConfig,
          },
        });
        w3a.configureAdapter(authAdapter);

        // IMP START - SDK Initialization
        await w3a.initModal();
        // IMP END - SDK Initialization
        setProvider(w3a.provider);

        if (w3a.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
    setInitWeb3auth(false);
  }, [initWeb3auth]);

  const login = async () => {
    // IMP START - Login
    const web3authProvider = await web3auth!.connect();
    // IMP END - Login
    setProvider(web3authProvider);
    if (web3auth!.connected) {
      setLoggedIn(true);
    }
  };

  const getUserInfo = async () => {
    // IMP START - Get User Information
    const user = await web3auth?.getUserInfo();
    // IMP END - Get User Information
    uiConsole(user);
  };

  const logout = async () => {
    // IMP START - Logout
    await web3auth?.logout();
    // IMP END - Logout
    setProvider(null);
    setLoggedIn(false);
    uiConsole("logged out");
  };

  // IMP START - Blockchain Calls
  // Check the RPC file for the implementation
  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const address = await RPC.getAccounts(provider);
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const balance = await RPC.getBalance(provider);
    uiConsole(balance);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const signedMessage = await RPC.signMessage(provider);
    uiConsole(signedMessage);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole("Sending Transaction...");
    const transactionReceipt = await RPC.sendTransaction(provider);
    uiConsole(transactionReceipt);
  };
  // IMP END - Blockchain Calls

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>
    </>
  );

  const handleSave = () => {
    configs[configIndex] = JSON.parse(editorValue);
    setInitWeb3auth(true);
  };

  const unloggedInView = (
    <div className="card space-x-2">
      <select
        value={configIndex}
        onChange={(e) => {
          const newIndex = Number(e.target.value);
          setconfigIndex(newIndex);
          setEditorValue(JSON.stringify(configs[newIndex], null, 2));
          setInitWeb3auth(true);
        }}
        className="border rounded p-1"
      >
        <option value={0}>Web3auth</option>
        <option value={1}>Supercycl</option>
        <option value={2}>Hana Wallet</option>
      </select>
      <textarea
        value={editorValue}
        onChange={(e) => setEditorValue(e.target.value)}
        rows={20}
        cols={120}
        className="w-full border rounded p-2 font-mono text-sm"
      />
      <div className="flex gap-2">
        <button onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded">
          Save
        </button>
        <button onClick={login} className="card">
          Login
        </button>
      </div>
    </div>
  );
  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="https://web3auth.io/docs/sdk/pnp/web/modal" rel="noreferrer">
          Web3Auth{" "}
        </a>
        & NextJS Quick Start
      </h1>

      <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-pnp-examples/tree/main/web-modal-sdk/quick-starts/nextjs-modal-quick-start"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
        <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWeb3Auth%2Fweb3auth-pnp-examples%2Ftree%2Fmain%2Fweb-modal-sdk%2Fquick-starts%2Fnextjs-modal-quick-start&project-name=w3a-nextjs-modal&repository-name=w3a-nextjs-modal">
          <img src="https://vercel.com/button" alt="Deploy with Vercel" />
        </a>
      </footer>
    </div>
  );
}

export default App;
