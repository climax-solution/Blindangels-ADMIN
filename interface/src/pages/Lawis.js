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
import Deposit from './components/Deposit/deposit.js';
import ManageSigner from './components/ManageSigner/manageSigner.js';
import Web3 from 'web3';
import VerifyClaim from './components/Claim/verifyClaim.js';

const { inboundTreasuryAddress, outboundTreasuryAddress, claimAddress } = config;
const Lawis = () => {
    
    const {
        web3,
        tInContract,
        tOutContract,
        cContract,
        ownerAddress,
        isLoading,
        isConnected,
        activeTab,
        setOwnerAddress,
        setIsConnected,
        setActiveTab,
        updated
    } = useAppContext();

    const [treasuryBalance, setTreasuryBalance] = useState('Loading...');
    const [claimWalletBalance,  setClaimWalletBalance ] = useState('Loading...');
    const [unClaimedBalance, setUnClaimedBalance] = useState('Loading...');
    const [outstand, setOutstand] = useState('Loading...');

    useEffect(() => {
        async function initSetting() {
            const TBalance = await web3.eth.getBalance(activeTab === 'outbound' ? outboundTreasuryAddress : inboundTreasuryAddress);
            const CBalance = await web3.eth.getBalance(claimAddress);
    
            setTreasuryBalance(web3.utils.fromWei(TBalance, 'ether'));
            setClaimWalletBalance(web3.utils.fromWei(CBalance, 'ether'));
        }
        if (web3) initSetting();
    }, [web3, activeTab, updated]);

    useEffect(() => {
        if (tInContract && tOutContract && cContract) {
            /* eslint-disable */
            checkOutStanding();
        }

        if (web3 && cContract) {
            /* eslint-disable */
            getUnclaimedAmount();
        }
    }, [activeTab, updated, tInContract, tOutContract, cContract, web3])

    const walletConnect = async() => {
        try {
            if (!window.ethereum) {
                NotificationManager.warning("Metamask is not installed", "Warning");
                return;
            } else {

                const res = await window.ethereum.enable();
                const web3 = new Web3(window.ethereum);
                const chainId = await web3.eth.getChainId();

                if (chainId !== 5) {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: web3.utils.toHex(5) }]
                    })
                }
                
                if (res.length) {
                    setIsConnected(true);
                    setOwnerAddress(res[0]);
                }
            }
        } catch(err) {

        }
    }
    
    const disconnectWallet = () => {
        setIsConnected(false);
        setOwnerAddress('');
    }

    const checkOutStanding = async() => {
        let flag = 0;
        const contract = activeTab === 'inbound' ? tInContract : activeTab === 'outbound' ? tOutContract : cContract;
        const exist_signerRequest = await contract.methods.signerRequest().call();
        const withdraw = await contract.methods.withdrawRequest().call();
        if (exist_signerRequest.isActive || withdraw.isActive) flag = 1;

        if (activeTab === 'inbound' || activeTab === 'outbound') {
            const treasury_transfer = await contract.methods.transferRequest().call();
            if (treasury_transfer.isActive && !flag) flag = 1;
        }
        else if (activeTab === 'claim') {
            const claim_rootRequest = await contract.methods.claimRootRequest().call();
            if (claim_rootRequest.isActive && !flag) flag = 1;
        }

        setOutstand(flag ? "Yes" : "No");
    }

    const getUnclaimedAmount = async() => {
        const totalClaimAmount = await cContract.methods.totalClaimAmount().call();
        const claimedAmount = await cContract.methods.totalClaimedAmount().call();
        const rest = totalClaimAmount - claimedAmount;
        setUnClaimedBalance(web3.utils.fromWei(rest.toString(), 'ether'));
    }

    return (
        <>
            <NotificationContainer/>
            { isLoading && <Loading/> }
            <div className="container d-flex justify-content-end mt-3">
                <button type="button" className="btn btn-success mb-1" id="wallet-connect" onClick={ isConnected ? disconnectWallet : walletConnect}>
                    {
                        isConnected
                            ? 'Disconnect( ' + ownerAddress.substr(0, 6) + '...' + ownerAddress.substr(-4) + ' )'
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
                                    {activeTab === 'outbound' ? outboundTreasuryAddress : inboundTreasuryAddress}
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
                                    {outstand}
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </div>

            <Tab.Container id="left-tabs-example" defaultActiveKey="inbound" onSelect={(value) => setActiveTab(value)}>
                <div className='container'>
                    <Nav variant="pills" className='border p-3'>
                        <Nav.Item>
                            <Nav.Link eventKey="inbound">Inbound</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="outbound">Outbound</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="claim">Claim</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </div>
                <Tab.Content>
                    <Tab.Pane eventKey="inbound">

                        <ManageSigner
                            contract={tInContract}
                        />

                        <CreateTransfer
                            contract={tInContract}
                        />

                        <Withdraw
                            contract={tInContract}
                        />
                        
                        <Deposit
                            contract={tInContract}
                        />

                        <TransferHistory
                            address={inboundTreasuryAddress}
                        />

                    </Tab.Pane>
                    <Tab.Pane eventKey="outbound">

                        <ManageSigner
                            contract={tOutContract}
                        />

                        <CreateTransfer
                            contract={tOutContract}
                        />

                        <Withdraw
                            contract={tOutContract}
                        />
                        
                        <Deposit
                            contract={tOutContract}
                        />

                        <TransferHistory
                            address={outboundTreasuryAddress}
                        />

                    </Tab.Pane>
                    <Tab.Pane eventKey="claim">
                        <div className="table-upload-wrapper mt-5">
                            
                            <ManageSigner
                                contract={cContract}
                            />

                            <Withdraw
                                contract={cContract}
                            />

                            <Deposit
                                contract={cContract}
                            />

                            <Freeze/>

                            <Week/>

                            <ApproveClaimList/>

                            <VerifyClaim/>

                            <UploadClaim/>
                            
                            <ClaimHistory address={claimAddress}/>

                        </div>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

        </>
    )
}

export default Lawis
