import React, { useEffect, useState } from 'react'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import treasuryAbi from "../contracts/treasury_abi.json";
import claimAbi from "../contracts/claim_abi.json";
import {getWeb3} from "../utility/getWeb3.js"
import Loading from "./Loading.js";
import config from "./config.json";
import CreateTransfer from './components/Transfer/createTransfer';
import Withdraw from './components/Withdraw/withdraw';
import TransferHistory from './components/Transfer/transferHistory';
import UploadClaim from './components/Claim/uploadClaim';
import ApproveClaimList from './components/Claim/approveClaim';
import ClaimHistory from './components/Claim/claimHistory';

const Lawis = () => {
    
    const { treasuryAddress, claimAddress } = config;

    const [web3, setWEB3] = useState({});
    const [ownerAddress, setOwnerAddress] = useState('Loading...');
    const [treasuryBalance, setTreasuryBalance] = useState('Loading...');
    const [claimWalletBalance,  setClaimWalletBalance ] = useState('Loading...');
    const [isLoading, setIsLoading] = useState(false);

    const [unClaimedBalance] = useState('Loading...');
    const [isConnected, setIsConnected] = useState(false);

    const [tContract, setTreasuryContract] = useState({})
    const [cContract, setClaimContract] = useState({});

    useEffect(async() => {
        const _web3 = getWeb3();
        if (_web3) {
            const _Treasury = new _web3.eth.Contract(treasuryAbi, treasuryAddress);
            const _Claim = new _web3.eth.Contract(claimAbi, claimAddress);

            setClaimContract(_Claim);
            setTreasuryContract(_Treasury);
            setWEB3(_web3);
        }
    }, [])

    useEffect(async() => {
        if (web3) await initalSetting();
        if (web3 && isConnected && ownerAddress != 'Loading...') {
            console.log('changed', web3);
            // await getLiveRefList();
        }

    }, [web3, isConnected, ownerAddress]);

    const initalSetting = async () => {
        console.log(web3);
        // const TBalance = await web3.eth.getBalance(treasuryAddress);
        // const CBalance = await web3.eth.getBalance(claimAddress);

        // setTreasuryBalance(web3.utils.fromWei(TBalance, 'gwei'));
        // setClaimWalletBalance(web3.utils.fromWei(CBalance, 'ether'));
    }

    const walletConnect = async() => {
        if (web3) {
            if (!window.ethereum) {
                NotificationManager.warning("Metamask is not installed", "Warning");
                return;
            } else {
                const res = await window.ethereum.enable();
                if (res.length) {
                    setIsConnected(true);
                    setOwnerAddress(res[0]);
                }
            }
        }
    }
    

    

    return (
        <>
            <NotificationContainer/>
            { isLoading && <Loading/> }
            <div className="container d-flex justify-content-end mt-3">
                <button type="button" className="btn btn-success mb-1" id="wallet-connect" onClick={walletConnect}>
                    {
                        isConnected
                            ? ownerAddress.substr(0, 6) + '...' + ownerAddress.substr(-4)
                            : "Connect Wallet"
                    }
                </button>
            </div>

            <div className="container mt-5">
                <div className="row">
                    <div className="col-sm-6 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Treasury address
                                </h5>
                                <div className="card-text" id="tokenAddress">
                                    {treasuryAddress}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="col-sm-6 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Claim Wallet address
                                </h5>
                                <div className="card-text" id="ownerAddress">
                                    {claimAddress}
                                </div>

                            </div>

                        </div>
                    </div>
                    
                    <div className="col-sm-3 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Treasury Balance
                                </h5>
                                <div className="card-text" id="tokenSupply">
                                    {treasuryBalance}
                                </div>
                            </div>

                        </div>

                    </div>

                    <div className="col-sm-3 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Claim Wallet Balance
                                </h5>
                                <div className="card-text" id="tokensTransfered">
                                    {claimWalletBalance}
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="col-sm-3 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Amount Unclaimed
                                </h5>
                                <div className="card-text" id="unClaimedBalanc">
                                    {unClaimedBalance}
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="col-sm-3 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Outstanding Actions
                                </h5>
                                <div className="card-text" id="lockStatus">
                                    false
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </div>

            <CreateTransfer
                tContract={tContract}
                web3={web3}
            />

            <Withdraw
                cContract={cContract}
                web3={web3}
            />

            <TransferHistory
                web3={web3}
            />

            <div className="table-upload-wrapper mt-5">
                
                <UploadClaim
                    web3={web3}
                />

                <ApproveClaimList
                    cContract={cContract}
                />

                <ClaimHistory/>

            </div>
        </>
    )
}

export default Lawis
