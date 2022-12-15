import { useEffect, useState } from "react";
import { NotificationManager } from "react-notifications";
import { useAppContext } from "../../../context";
import SectionTitle from "../sectionTitle";

const CreateTransfer = ({ contract }) => {

    const { web3, isConnected, ownerAddress, setIsLoading, updated, setUpdated } = useAppContext();

    const [transferAddress, setTransferAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferRequest, setTransferRequest] = useState('');
    const [decTransferNumber, setDecTransferNumber] = useState('');

    useEffect(() => {
        async function run () {
            if (contract) {
                await getLatestItem();
            } 
        }
        run();
    }, [contract]); // eslint-disable-line react-hooks/exhaustive-deps

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
        
        setIsLoading(true);
        try{
            await contract.methods.newTransferRequest(transferAddress, web3.utils.toWei(transferAmount.toString(), "ether"))
            .send({ from: ownerAddress })
            .on('receipt', async(res) => {
                NotificationManager.info("Added successfully!", "Info");
                setIsLoading(false);
                
            });
        }
        catch(err) {
            if (err) {
                NotificationManager.error("Request is failed!", "Failed");
            }
        }
        setUpdated(!updated);

        setIsLoading(false);
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
        
        if (!transferRequest) {
            NotificationManager.warning("No request!", "Warning");
            return;
        }

        try {
            setIsLoading(true);
            await contract.methods.approveTransferRequest()
            .send({ from: ownerAddress })
            .on('receipt', async(res) => {
                NotificationManager.success("Sent successfully!", "Success");
            });
            
        } catch(err) {
            console.log(err);
            NotificationManager.error("Transaction is failed!", "Failed");
        }
        setIsLoading(false);
        setUpdated(!updated);
        await getLatestItem();
        // await getTransferHistory();
        // await initalSetting();
    }

    const declineTransferRequest = async (idx) => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!transferRequest) {
            NotificationManager.warning("No request!", "Warning");
            return;
        }

        try {
            setIsLoading(true);
            await contract.methods.declineTransferRequest()
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
        
        setUpdated(!updated);
        setIsLoading(false);
        await getTransferHistory();
        await getLatestItem();
    }

    const getLatestItem = async() => {
        let flag = 0;
        const treasury_transfer = await contract.methods.transferRequest().call();
        if (treasury_transfer.isActive) {
            flag = 1;
            setTransferRequest({...treasury_transfer, flag: 1});
        }
        
        else setTransferRequest(null);

        if (flag > 0) {
            await contract.getPastEvents('Transfer', {
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
            await contract.getPastEvents('Transfer', {
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
            // await axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=21888857&toBlock=latest&address=${config.inboundTreasuryAddress}&topic0=0x6c201685d45b350967167ae4bbf742a99dd958968b9c36ce07db27dda4d581d0&apikey=${config.apiKey}`).then(res => {
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

            <SectionTitle title="Transfer"/>
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
                                <label htmlFor="createTransferTokens">Tokens (ETH)</label>
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
                                        value={transferRequest ? transferRequest.to : ''}
                                        readOnly
                                    />
                                </div>
                                <label htmlFor="createTransferTokens">Tokens (ETH)</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="createTransferTokens"
                                        value={ transferRequest ? web3.utils.fromWei(transferRequest.value, 'ether') : '' }
                                        readOnly
                                    />
                                </div>
                                <label htmlFor="createTransferTokens">Created By</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="createTransferTokens"
                                        value={ transferRequest ? transferRequest.createdBy : '' }
                                        readOnly
                                    />
                                </div>
                                <label htmlFor="createTransferTokens">Number of Cancellations</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="createTransferTokens"
                                        value={ transferRequest ? decTransferNumber : '' }
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
    )
}

export default CreateTransfer;