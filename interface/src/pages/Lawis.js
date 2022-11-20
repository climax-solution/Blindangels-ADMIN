import React, { useEffect, useState } from 'react'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import Loading from "./Loading.js";
import config from "../config.json";
import CreateTransfer from './components/Transfer/transfer';
import Withdraw from './components/Withdraw/withdraw';
import TransferHistory from './components/Transfer/transferHistory';
import UploadClaim from './components/Claim/uploadClaim';
import ApproveClaimList from './components/Claim/approveClaim';
import ClaimHistory from './components/Claim/claimHistory';
import { useAppContext } from '../context';
import Week from './components/Week/week';
import Freeze from './components/Freeze/freez';
import { Nav, Tab } from 'react-bootstrap';

const { treasuryAddress, claimAddress } = config;
const Lawis = () => {
    
    const { web3, tContract, cContract, ownerAddress, setOwnerAddress, isLoading, isConnected, setIsConnected } = useAppContext();

    const [treasuryBalance, setTreasuryBalance] = useState('Loading...');
    const [claimWalletBalance,  setClaimWalletBalance ] = useState('Loading...');
    const [unClaimedBalance] = useState('Loading...');

    useEffect(() => {
        async function initalSetting() {
            const TBalance = await web3.eth.getBalance(treasuryAddress);
            const CBalance = await web3.eth.getBalance(claimAddress);
    
            setTreasuryBalance(web3.utils.fromWei(TBalance, 'ether'));
            setClaimWalletBalance(web3.utils.fromWei(CBalance, 'ether'));
        }
        if (web3) initalSetting();
    }, [web3]);

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

            <Tab.Container id="left-tabs-example" defaultActiveKey="inbound">
                <div className='container'>
                    <Nav variant="pills" className='border p-3'>
                        <Nav.Item>
                            <Nav.Link eventKey="inbound">Inbound</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="outbound">Outbound</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="third">Claim</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </div>
                <Tab.Content>
                    <Tab.Pane eventKey="inbound">
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
                    </Tab.Pane>
                    <Tab.Pane eventKey="outbound">
                        <div className="table-upload-wrapper mt-5">
                
                            <UploadClaim
                                web3={web3}
                            />

                            <ApproveClaimList
                                cContract={cContract}
                            />

                            <ClaimHistory/>

                            <Week/>

                            <Freeze/>
                        </div>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

        </>
    )
}

export default Lawis
