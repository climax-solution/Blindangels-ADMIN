import React, { useEffect, useState } from 'react'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import Select from 'react-select'
import axios from 'axios'
import Papa from "papaparse"
import MSDOGE from "../contracts/MSDOGE.json";
import treasuryAbi from "../contracts/treasury_abi.json";
import claimAbi from "../contracts/claim_abi.json";
import {getWeb3} from "../utility/getWeb3.js"
import Loading from "./Loading.js";
import config from "./config.json";
import Reflection from './components/reflection';
import ReflectionHistory from './components/refHistory'

const options = [
    { value: 1, label: "Treasury Wallet" },
    { value: 2, label: "Claim Wallet" }
];

const Lawis = () => {
    
    const { SigAddress, TOKEN, treasuryAddress, claimAddress } = config;

    const [msdoge, setMsdoge] = useState(null);
    const [msdogeSig, setMsdogeSig] = useState(null);
    const [web3, setWEB3] = useState({});
    const [ownerAddress, setOwnerAddress] = useState('Loading...');
    const [treasuryBalance, setTreasuryBalance] = useState('Loading...');
    const [claimWalletBalance,  setClaimWalletBalance ] = useState('Loading...');
    const [isLoading, setIsLoading] = useState(false);

    const [transferAddress, setTransferAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [activeWallet, setActiveWallet] = useState();

    const [unClaimedBalance, setUnClaimedBalance] = useState('Loading...');
    const [requestedList, setRequestedList] = useState([]);
    const [reflectionList, setReflectionList] = useState([]);
    const [transferedList, setTransferedList] = useState([]);
    const [lastTransfersTreasury, setLastTransfersTreasury] = useState([]);
    const [lastClaimTransfersList, setLastClaimTransfersList] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [endTransferRequest, setEndTransferRequest] = useState('');
    const [decTransferNumber, setDecTransferNumber] = useState('');

    const [tContract, setTreasuryContract] = useState({})
    const [cContract, setClaimContract] = useState({});

    useEffect(async() => {
        
        const _web3 = getWeb3();
        if (_web3) {
            const _MSDoge = new _web3.eth.Contract(MSDOGE, TOKEN);
            const _Treasury = new _web3.eth.Contract(treasuryAbi, treasuryAddress);
            const _Claim = new _web3.eth.Contract(claimAbi, claimAddress);

            
            setClaimContract(_Claim);
            setTreasuryContract(_Treasury);
            setMsdoge(_MSDoge);
            setWEB3(_web3);

            // const treasury = await _MsDogeSig.methods.treasuryWallet().call();
            // const claims = await _MsDogeSig.methods.claimWallet().call();
            
            // setTreasuryWallet(treasury);
            // setClaimWallet(claims);
            // setMsdogeSig(_MsDogeSig);

            // const _owner = await _web3.eth.getAccounts();
            // if (_owner.length) {
            //     if (OWNERS.indexOf(_owner[0]) > -1) {
            //         setIsConnected(true);
            //         setOwnerAddress(_owner[0]);
            //     }
            // }
        }
    }, [])

    useEffect(async() => {
        if (msdoge) await initalSetting();
        if (msdoge && isConnected && ownerAddress != 'Loading...') {
            console.log('changed');
            await getTransferHistory();
            await getLatestItem();
            await getLiveRefList();
        }

    }, [msdoge, isConnected, ownerAddress])

    const initalSetting = async () => {
        const TBalance = await msdoge.methods.balanceOf(treasuryAddress).call();
        const CBalance = await msdoge.methods.balanceOf(claimAddress).call();
        const _unClaimedBalance = await cContract.methods.unClaimedBalance().call();

        setTreasuryBalance(web3.utils.fromWei(TBalance, 'gwei'));
        setClaimWalletBalance(web3.utils.fromWei(CBalance, 'gwei'));
        setUnClaimedBalance(web3.utils.fromWei(_unClaimedBalance, 'gwei'));
    }

    const createTransferRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!web3.utils.isAddress(transferAddress)) {
            NotificationManager.warning("Please enter correct address!", "Warning");
            return;
        }

        if (transferAmount <= 0) {
            NotificationManager.warning("Please enter correct amount!", "Warning");
            return;
        }

        if (!activeWallet) {
            NotificationManager.warning("Please choose wallet!", "Warning");
            return;
        }

        setIsLoading(true);
        try{
            let walletContract = activeWallet.value == 2 ? cContract : tContract;
                await walletContract.methods.newTransferRequest(transferAddress, web3.utils.toWei(transferAmount.toString(), "gwei"))
                .send({ from: ownerAddress })
                .on('receipt', async(res) => {
                    NotificationManager.info("Added successfully!", "Info");
                    await getTransferHistory();
                    await getLatestItem();
                    setIsLoading(false);
                    setTransferAddress('');
                    setTransferAmount('');
                });
        }
        catch(err) {
            if (err) {
                console.log("err", err);
                setIsLoading(false);
                NotificationManager.error("Request is failed!", "Failed");
                setTransferAddress('');
                setTransferAmount('');
            }
        }
    }

    const approveTransferRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }
        
        if (!endTransferRequest) {
            NotificationManager.warning("No request!", "Warning");
            return;
        }

        try {
            setIsLoading(true);
            const activeContract = endTransferRequest.flag == 1 ? tContract : cContract;
            await activeContract.methods.approveTransferRequest()
            .send({ from: ownerAddress })
            .on('receipt', async(res) => {
                NotificationManager.success("Sent successfully!", "Success");
            });
            
        } catch(err) {
            console.log(err);
            NotificationManager.error("Transaction is failed!", "Failed");
        }
        setIsLoading(false);
        await initalSetting();
        await getTransferHistory();
        await getLatestItem();
    }

    const declineTransferRequest = async (idx) => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!endTransferRequest) {
            NotificationManager.warning("No request!", "Warning");
            return;
        }

        try {
            setIsLoading(true);
            const activeContract = endTransferRequest.flag == 1 ? tContract : cContract;
            await activeContract.methods.declineTransferRequest()
            .send({ from: ownerAddress })
            .on('receipt', async(res) => {
                NotificationManager.success("Sent successfully!", "Success");
            })
            .catch(err => {
                console.log(err);
            })
            
        } catch(err) {
            NotificationManager.error("Transaction is failed!", "Failed");
        }
        await initalSetting();
        await getTransferHistory();
        await getLatestItem();
        setIsLoading(false);
    }
    
    const importReflectionList = (e) => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        try {
            const file = e.target.files[0];
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    setReflectionList(results.data);
                },
            });
        } catch(err) {
            console.log(err);
        }
    }
    
    const updateClaimList = async() => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!reflectionList.length) {
            NotificationManager.warning("No air drop list", "Warning");
            return;
        }

        let chunkList = [];
        let totalBalance = 0;
        setIsLoading(true);
        console.log(reflectionList);
        try {
            for (let i = 0; i < reflectionList.length; i ++) {
                if(chunkList.filter((c) => c[0] === reflectionList[i].account ).length > 0) continue;
                totalBalance += Number(reflectionList[i].balance);
                chunkList.push([
                    reflectionList[i].account,
                    web3.utils.toWei(reflectionList[i].balance, 'gwei')
                ])
            }

            // const treasuryBalance = await msdoge.methods.balanceOf(ownerAddress).call();
            // if (treasuryBalance <= totalBalance) {
            //     NotificationManager.warning("Balance is not enough", "Warning");
            //     return;
            // }
            totalBalance = Math.ceil(totalBalance);
            // await msdoge.methods.approve(SigAddress, web3.utils.toWei(totalBalance.toString(), "gwei"))
            // .send({ from: ownerAddress })
            // .on('receipt', async(res) => {                
                await cContract.methods.updateClaimList(chunkList)
                .send({ from : ownerAddress })
                .on('receipt', res => {
                    NotificationManager.success("Airdropped successfully!", "Success");
                })
                .catch(err => console.log)
            // })
        } catch(err) {
            console.log(err);
            if (err) {
                NotificationManager.error("Airdropped failed!", "Failed");
            }
        }
        setReflectionList([]);
        setIsLoading(false);
        await getTransferHistory
    }

    const batchClaim = async() => {
        setIsLoading(true);
        try {
            await cContract.methods.batchClaim().send({ from: ownerAddress });
        } catch(err) {

        }
        await getLiveRefList();
        setIsLoading(false);
    }

    const clearClaim = async() => {
        setIsLoading(true);
        try {
            await cContract.methods.updateClaimList([]).send({ from: ownerAddress });
        } catch {

        }

        setIsLoading(false);
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

    const getLatestItem = async() => {
        const treasury_transfer = await tContract.methods.transferRequest().call();
        const claim_transfer = await cContract.methods.transferRequest().call();
        let flag = 0;
        if (treasury_transfer.isActive == true && claim_transfer.isActive == true) {
            if (treasury_transfer.created_at > claim_transfer.created_at) {
                flag = 1;
                setEndTransferRequest({...treasury_transfer, flag: 1});
            }
            else {
                setEndTransferRequest({...claim_transfer, flag: 2});
                flag = 2;
            }
        } else if (treasury_transfer.isActive) {
            flag = 1;
            setEndTransferRequest({...treasury_transfer, flag: 1});
        } else if (claim_transfer.isActive) {
            setEndTransferRequest({...claim_transfer, flag: 2});
            flag = 2;
        } else setEndTransferRequest(null);

        if (flag > 0) {
            const activeContract = flag == 1 ? tContract : cContract;
            await activeContract.getPastEvents('Transfer', {
                filter: { status: false },
                fromBlock: 	21839985,
                toBlock: 'latest'
            }).then((events) => {
                setDecTransferNumber(events.length);
            });
        }
    }

    const getTransferHistory = async() => {
        try {
            // await tContract.getPastEvents('Transfer', {
            //     filter: { status: true },
            //     fromBlock: 	21839985,
            //     toBlock: 'latest'
            // }).then((events) => {
            //     setLastTransfersTreasury(events);
            // });

            await axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=21839985&toBlock=latest&address=${config.treasuryAddress}&topic0=0x6c201685d45b350967167ae4bbf742a99dd958968b9c36ce07db27dda4d581d0&apikey=${config.apiKey}`).then(res => {
                let { result } = res.data;
                result = result.filter(item => item.)
                setTransferedList(res.data.result);
            });

            await axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=21839985&toBlock=latest&address=${config.claimAddress}&topic0=0x6c201685d45b350967167ae4bbf742a99dd958968b9c36ce07db27dda4d581d0&apikey=${config.apiKey}`).then(res => {
                setLastClaimTransfersList(res.data.result);
            });

            // await web3.eth.getTransactionReceipt('0xcf92a986183288d2010fa3519a579b8b491675bb235de3bc7d7d857966ff0caa').then(console.log);
            await axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=21839985&toBlock=latest&address=${config.claimAddress}&topic0=0x517536260e5362f2490ab89add881956277be30f0f7b772af65167c5c17fe606&topic0_1_opr=or&topic1=0x47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d4&apikey=${config.apiKey}`).then(res => {
                setTransferedList(res.data.result);
            });

        } catch(err) {
            console.log(err)
        }
        
    }

    const getLiveRefList = async() => {
        const list = await cContract.methods.getClaimList().call({ from: ownerAddress });
        setRequestedList(list);
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


            <div className="container" id="transfer">

                <div className="row">
                    <h2 className="mt-5 mb-3 col-7"><strong>Transfer</strong></h2>
                </div>
                <div className="row justify-content-center">
                    <div className="col-5">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <strong>Create transfer request</strong>
                                </h5>
                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Send tokens to new address</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Address"
                                            aria-label="Address"
                                            id="createTransferToAddress"
                                            value={transferAddress}
                                            onChange={(e) => setTransferAddress(e.target.value)}
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Tokens (without decimals)</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Tokens"
                                            aria-label="Tokens"
                                            id="createTransferTokens"
                                            value={ transferAmount }
                                            onChange = { (e) => setTransferAmount(e.target.value) }
                                        />
                                    </div>

                                    <label htmlFor="createTransferTokens">Wallet</label>
                                    <div className="input-group mb-3">
                                        <Select
                                            options={options}
                                            value={activeWallet}
                                            onChange={(value) => setActiveWallet(value)}
                                            placeholder="Select wallet..."
                                            className="w-100"
                                        />
                                    </div>

                                    <button type="button" className={`btn btn-success w-100 mb-1 ${ !isConnected && "disabled"}`} id="transferCreateButton"
                                        onClick={ () => createTransferRequest() }>Create</button>
                                </fieldset>

                            </div>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <strong>Current transfer request</strong>
                                </h5>
                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Send tokens to new address</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createTransferToAddress"
                                            value={endTransferRequest ? endTransferRequest.to : ''}
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Tokens (without decimals)</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={ endTransferRequest ? web3.utils.fromWei(endTransferRequest.value, 'gwei') : '' }
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Created By</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={ endTransferRequest ? endTransferRequest.createdBy : '' }
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Number of Cancellations</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={ endTransferRequest ? decTransferNumber : '' }
                                            readOnly
                                        />
                                    </div>
                                </fieldset>

                            </div>
                        </div>
                    </div>
                    <div className="col-2">
                        <div className="card">
                            <div className="card-body">
                                <button type="button" className={`btn btn-success w-100 mb-1 ${ !isConnected && "disabled"}`} id="transferApproveButton"
                                    onClick={ () =>approveTransferRequest() }>Approve</button>
                                <button type="button" className="btn btn-light w-100" id="transferDeclineButton"
                                    onClick={ () =>declineTransferRequest() }>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mb-5 mt-10" id="treasury-last-transfer">
                <h2 className="mt-5 mb-3">
                    <strong>View Treasury Wallet Last Transfers</strong>
                </h2>
                <div className='overflow-auto'>
                    <table id="upload-table" className="table">
                        <thead className='thead-dark'>
                            <tr>
                                <th>#</th>
                                <th>Creator</th>
                                <th>To</th>
                                <th>Dealer</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                lastTransfersTreasury.map(({ returnValues: item}, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{item.createdBy}</td>
                                            <td>{item.to}</td>
                                            <td>{item.dealedBy}</td>
                                            <td>{web3.utils.fromWei(item.value, "gwei")}</td>
                                        </tr>
                                    )
                                })
                            }
                            {
                                !lastTransfersTreasury.length && 
                                <tr>
                                    <td colSpan={5} className="text-center">No requested</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
                <div className='container mt-3'>
                    {/* <button className="btn btn-success">Download Report</button> */}
                </div>
            </div>

            <div className="container mb-5 mt-10" id="treasury-last-transfer">
                <h2 className="mt-5 mb-3">
                    <strong>View Claim Wallet Last Transfers</strong>
                </h2>
                <div className='overflow-auto'>
                    <table id="upload-table" className="table">
                        <thead className='thead-dark'>
                            <tr>
                                <th>#</th>
                                <th>Creator</th>
                                <th>To</th>
                                <th>Dealer</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                lastClaimTransfersList.map(({ returnValues: item}, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{item.createdBy}</td>
                                            <td>{item.to}</td>
                                            <td>{item.dealedBy}</td>
                                            <td>{web3.utils.fromWei(item.value, "gwei")}</td>
                                        </tr>
                                    )
                                })
                            }
                            {
                                !lastClaimTransfersList.length && 
                                <tr>
                                    <td colSpan={5} className="text-center">No requested</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
                <div className='container mt-3'>
                    {/* <button className="btn btn-success">Download Report</button> */}
                </div>
            </div>

            <div className="table-upload-wrapper mt-5">
                
                <div className="container">
                    <h2 className="mt-5 mb-3">
                        <strong>Upload Reflections Claim List</strong>
                    </h2>
                    <div className="controls-section">
                        <div className="upload-file-button">
                            <div className="file-indicator">
                                Chose file to upload
                            </div>
                            <label htmlFor="file-upload" className={`custom-file-upload btn  btn-success ${!isConnected && "disabled"}`}>
                                Browse
                            </label>
                            {
                            
                                isConnected ? <input id="file-upload" type="file" accept='.csv' onChange={importReflectionList} /> : ""
                            }
                        </div>

                        <button id="uploadBtn" className={`btn btn-success ${!isConnected && "disabled"}`} onClick={isConnected ? updateClaimList : null}>Upload</button>

                        <div className="filler"></div>
                    </div>
                    <table className="table upload-data my-5">
                        <thead className='thead-dark'>
                            <tr>
                                <th>#</th>
                                <th>Addresses</th>
                                <th>Balances</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                reflectionList.map((item, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{item.account}</td>
                                            <td className='text-right'>{item.balance}</td>
                                        </tr>
                                    )
                                })
                            }
                            {
                                !reflectionList.length && 
                                <tr>
                                    <td colSpan={3} className="text-center">No rows</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>

                <div className="container">
                    <h2 className="mt-5 mb-3">
                        <strong>Approve Reflections Claim List</strong>
                    </h2>
                    <table className="table upload-data mb-5 mt-1">
                        <thead className='thead-dark'>
                            <tr>
                                <th>#</th>
                                <th>Addresses</th>
                                <th>Balances</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                requestedList.map((item, idx) => {
                                    return (
                                        <Reflection
                                            idx={idx + 1}
                                            address={item}
                                            contract={cContract}
                                            web3={web3}
                                            key={idx}
                                        />
                                    )
                                })
                            }
                            {
                                !requestedList.length && 
                                <tr>
                                    <td colSpan={3} className="text-center">No requested</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                    <div className="row">
                        <div className="col-2">
                            <div className="card-body">
                                <button type="button" className="btn btn-success w-100 mb-1" id="transferApproveButton" onClick={ batchClaim } disabled={!requestedList.length && true}>Approve</button>
                                <button type="button" className="btn btn-light w-100" id="transferDeclineButton" onClick={ clearClaim }>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mb-5 mt-10">
                    <h2 className="mt-5 mb-3">
                        <strong>View Last Reflections Claimed</strong>
                    </h2>
                    <div className="table-panel w-100 overflow-auto" style={{ overflow: 'auto'}}>
                        <table id="upload-table" className="table">
                            <thead className='thead-dark'>
                                <tr>
                                    <th>#</th>
                                    {/* <th>From</th> */}
                                    <th>To</th>
                                    <th>Dealer</th>
                                    <th>Value</th>
                                    <th>Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    transferedList.map((item, idx) => {
                                        return (
                                            <ReflectionHistory
                                                key={idx + 1}
                                                idx={idx}
                                                tx={item}
                                                web3={web3}
                                            />
                                        )
                                    })
                                }
                                {
                                    !transferedList.length && 
                                    <tr>
                                        <td colSpan={5} className="text-center">No requested</td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className='mt-3'>
                        {/* <button className="btn btn-success">Download Report</button> */}
                    </div>                    
                </div>

            </div>
        </>
    )
}

export default Lawis
