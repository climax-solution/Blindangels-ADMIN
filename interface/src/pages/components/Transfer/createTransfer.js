import { useState } from "react";
import { NotificationManager } from "react-notifications";

const CreateTransfer = ({ tContract, web3 }) => {

    const [transferAddress, setTransferAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [endTransferRequest, setEndTransferRequest] = useState('');
    const [decTransferNumber, setDecTransferNumber] = useState('');

    const [isConnected, setIsConnected] = useState(false);

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
        
        // setIsLoading(true);
        try{
            await tContract.methods.newTransferRequest(transferAddress, web3.utils.toWei(transferAmount.toString(), "gwei"))
            .send({ from: "ownerAddress" })
            .on('receipt', async(res) => {
                NotificationManager.info("Added successfully!", "Info");
                // setIsLoading(false);
                
            });
        }
        catch(err) {
            if (err) {
                console.log("err", err);
                NotificationManager.error("Request is failed!", "Failed");
            }
        }

        // setIsLoading(false);
        setTransferAddress('');
        setTransferAmount('');
        await getTransferHistory();
        await getLatestItem();
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
            // setIsLoading(true);
            await tContract.methods.approveTransferRequest()
            .send({ from: "ownerAddress" })
            .on('receipt', async(res) => {
                NotificationManager.success("Sent successfully!", "Success");
            });
            
        } catch(err) {
            console.log(err);
            NotificationManager.error("Transaction is failed!", "Failed");
        }
        // setIsLoading(false);
        // await getLatestItem();
        // await getTransferHistory();
        // await initalSetting();
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
            // setIsLoading(true);
            await tContract.methods.declineTransferRequest()
            .send({ from: "ownerAddress" })
            .on('receipt', async(res) => {
                NotificationManager.success("Sent successfully!", "Success");
            })
            .catch(err => {
                console.log(err);
            })
            
        } catch(err) {
            NotificationManager.error("Transaction is failed!", "Failed");
        }
        // setIsLoading(false);
        await getTransferHistory();
        await getLatestItem();
    }

    const getLatestItem = async() => {
        let flag = 0;
        const treasury_transfer = await tContract.methods.transferRequest().call();
        if (treasury_transfer.isActive) {
            flag = 1;
            setEndTransferRequest({...treasury_transfer, flag: 1});
        }
        
        else setEndTransferRequest(null);

        if (flag > 0) {
            await tContract.getPastEvents('Transfer', {
                filter: { status: false },
                fromBlock: 	21888857,
                toBlock: 'latest'
            }).then((events) => {
                setDecTransferNumber(events.length);
            });
        }
    }

    const getTransferHistory = async() => {
        try {
            await tContract.getPastEvents('Transfer', {
                filter: { status: true },
                fromBlock: 	21888857,
                toBlock: 'latest'
            }).then((events) => {
                // setLastTransfersTreasury(events);
            });

            // await cContract.getPastEvents('Transfer', {
            //     filter: { status: true },
            //     fromBlock: 	21888857,
            //     toBlock: 'latest'
            // }).then((events) => {
            //     setLastClaimTransfersList(events);
            // });
            // await axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=21888857&toBlock=latest&address=${config.treasuryAddress}&topic0=0x6c201685d45b350967167ae4bbf742a99dd958968b9c36ce07db27dda4d581d0&apikey=${config.apiKey}`).then(res => {
            //     let { result } = res.data;
            //     result = result.filter(item => item.)
            //     setTransferedList(res.data.result);
            // });

            // await axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=21888857&toBlock=latest&address=${config.claimAddress}&topic0=0x6c201685d45b350967167ae4bbf742a99dd958968b9c36ce07db27dda4d581d0&apikey=${config.apiKey}`).then(res => {
            //     setLastClaimTransfersList(res.data.result);
            // });

            // await web3.eth.getTransactionReceipt('0xcf92a986183288d2010fa3519a579b8b491675bb235de3bc7d7d857966ff0caa').then(console.log);
            // await axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=21888857&toBlock=latest&address=${config.claimAddress}&topic0=0x517536260e5362f2490ab89add881956277be30f0f7b772af65167c5c17fe606&topic0_1_opr=or&topic1=0x47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d4&apikey=${config.apiKey}`).then(res => {
            //     // setTransferedList(res.data.result);
            // });

        } catch(err) {
            console.log(err)
        }
        
    }

    return (
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
                            <button type="button" className={`btn btn-success w-100 mb-1 ${ !false && "disabled"}`} id="transferApproveButton"
                                onClick={ () =>approveTransferRequest() }>Approve</button>
                            <button type="button" className="btn btn-light w-100" id="transferDeclineButton"
                                onClick={ () =>declineTransferRequest() }>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateTransfer;