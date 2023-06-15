"use client";
import Image from "next/image";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import { Web3Auth } from "@web3auth/modal";
import { useEffect, useState } from "react";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { TorusWalletAdapter } from "@web3auth/torus-evm-adapter";
import { ethers } from "ethers";

require("dotenv").config();
// import { WalletConnectV1Adapter } from "@web3auth/wallet-connect-v1-adapter";

export default function Home() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [torusPlugin, setTorusPlugin] =
    useState<TorusWalletConnectorPlugin | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [singer, setSinger] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const clientId: string = process.env.NEXT_PUBLIC_CLIENT_ID || "";
  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId: clientId,
          web3AuthNetwork: "cyan",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0xA",
            rpcTarget: "https://mainnet.optimism.io",
            displayName: "Optimism Mainnet",
            blockExplorer: "https://optimistic.etherscan.io",
            ticker: "OP",
            tickerName: "OP",
          },
        });
        // // adding metamask adapter
        const metamaskAdapter = new MetamaskAdapter({
          clientId: clientId,
          sessionTime: 3600, // 1 hour in seconds
          web3AuthNetwork: "cyan",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x1",
            rpcTarget: "https://ethereum-mainnet-rpc.allthatnode.com",
          },
        });
        // // it will add/update  the metamask adapter in to web3auth class
        web3auth.configureAdapter(metamaskAdapter);

        // adding torus wallet connector plugin

        const torusPlugin = new TorusWalletConnectorPlugin({
          torusWalletOpts: {},
          walletInitOptions: {
            whiteLabel: {
              theme: { isDark: true, colors: { primary: "#00a8ff" } },
              logoDark: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
              logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
            },
            useWalletConnect: true,
            enableLogging: true,
          },
        });
        setTorusPlugin(torusPlugin);
        await web3auth.addPlugin(torusPlugin);
        const torusWalletAdapter = new TorusWalletAdapter({
          clientId,
        });

        // it will add/update  the torus-evm adapter in to web3auth class
        web3auth.configureAdapter(torusWalletAdapter);

        setWeb3auth(web3auth);

        await web3auth.initModal();
        // if (web3auth.provider) {
        //   const provider = new ethers.BrowserProvider(web3auth.provider);
        //   setProvider(provider);
        //   const Signer = provider.getSigner();
        //   const address = (await provider.getSigner()).address;
        //   const balance = await provider.getBalance(address);
        //   console.log(
        //     "Signer:",
        //     Signer,
        //     "address",
        //     address,
        //     "balance",
        //     balance
        //   );
        // } else {
        //   await web3auth.connect();
        //   console.log("provider is not initialized");
        // }
        if (web3auth.connected && provider !== null) {
          setLoggedIn(true);
          const Signer = provider.getSigner();
          const address = (await provider.getSigner()).address;
          const balance = await provider.getBalance(address);
          console.log(
            "Signer:",
            Signer,
            "address",
            address,
            "balance",
            balance
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    if (web3authProvider) {
      const provider = new ethers.BrowserProvider(web3authProvider);
      setProvider(provider);
      const Signer = provider.getSigner();
      const addr = (await provider.getSigner()).address;
      const formattedAddress = addr.slice(0, 6) + "..." + addr.slice(-4);
      setAddress(formattedAddress);
      const balance = await provider.getBalance(addr);
      console.log("Signer:", Signer, "address", address, "balance", balance);
    }
    setLoggedIn(true);
  };
  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get Free&nbsp;
          <code className="font-mono font-bold">.eth on Optimism</code>
        </p>
        {loggedIn && address !== null ? (
          <div
            className="lg:bg-gray-200 lg:border lg:rounded-xl lg:p-3 fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none cursor-pointer"
            onClick={logout}
          >
            <a className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0">
              {address}
            </a>
          </div>
        ) : (
          <div
            className="lg:bg-gray-200 lg:border lg:rounded-xl lg:p-3 fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none cursor-pointer"
            onClick={login}
          >
            <a className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0">
              Login
            </a>
          </div>
        )}
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Explore the Next.js 13 playground.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  );
}
