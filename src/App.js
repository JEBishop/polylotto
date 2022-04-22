import { useEffect, useState } from 'react';
import './App.css';
import contract from './contracts/lotto.json';
import { ethers } from 'ethers';
//import web3 from 'web3';

const contractAddress = "0xeF14d268d90b6C7A9D6627517f45aB2313db6a03";
const abi = contract.abi;

const chainId = 80001 // Polygon Testnet

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);

  async function confirmNetwork() {
    if (window.ethereum.networkVersion !== chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: 80001 }]
          });
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
          if (err.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: 'Polygon Mainnet',
                  chainId: 80001,
                  nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                  rpcUrls: ['https://polygon-rpc.com/']
                }
              ]
            });
          }
        }
      }
  }

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      confirmNetwork();
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  const buyTicketHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const lottoContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Initialize payment");
        let lottoTxn = await lottoContract.enter({ value: ethers.utils.parseEther("1") });

        console.log("Mining... please wait");
        await lottoTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${lottoTxn.hash}`);

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const buyTicketButton = () => {
    return (
      <button onClick={buyTicketHandler} className='cta-button mint-nft-button'>
        Buy Ticket
      </button>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, []);
  
  function ShowTime() {
    var timeLeft;
    var now = new Date();
    var hrs = 24-now.getHours();
    var mins = 60-now.getMinutes();
    var secs = 60-now.getSeconds();
        timeLeft = "" +hrs+' hours '+mins+' minutes '+secs+' seconds';
    return timeLeft;
  }
  return (
    <div className='main-app'>
      <h1>polylotto</h1>
      <div>
        {currentAccount ? null : connectWalletButton()}
      </div>
        <h2>Progress to draw: 0/100</h2>
        <div>{buyTicketButton()}</div>
    </div>
  )
}

export default App;