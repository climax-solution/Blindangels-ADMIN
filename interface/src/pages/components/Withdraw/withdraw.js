import { useEffect, useState } from "react";
import { NotificationManager } from "react-notifications";
import { useAppContext } from "../../../context";
import SectionTitle from "../sectionTitle";

const Withdraw = ({ contract }) => {

    const { web3, isConnected, ownerAddress, setIsLoading, updated, setUpdated } = useAppContext();

    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawRequest, setWithdrawRequest] = useState('');
    // const [decWithdrawNumber, setDecWithdrawNumber] = useState('');

    useEffect(() => {
        async function run () {
            await getLatestItem();
        }
        if (contract) run();
    }, [contract]); // eslint-disable-line react-hooks/exhaustive-deps

    const createWithdrawRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!web3.utils.isAddress(ownerAddress)) {
            NotificationManager.warning("Please enter correct address!", "Warning");
            return;
        }

        if (withdrawAmount <= 0) {
            NotificationManager.warning("Please enter correct amount!", "Warning");
            return;
        }
        
        setIsLoading(true);
        try{
            await contract.methods.newWithdrawRequest(ownerAddress, web3.utils.toWei(withdrawAmount.toString(), "ether"))
            .send({ from: ownerAddress })
            .on('receipt', async(res) => {
                NotificationManager.info("Requested successfully!", "Info");
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
        setWithdrawAmount('');
        // await getWithdrawHistory();
        await getLatestItem();
    }

    const approveWithdrawRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }
        
        if (!withdrawRequest) {
            NotificationManager.warning("No request!", "Warning");
            return;
        }

        try {
            setIsLoading(true);
            await contract.methods.approveWithdrawRequest()
            .send({ from: ownerAddress })
            .on('receipt', async() => {
                NotificationManager.success("Withdraw successfully!", "Success");
            });
            
        } catch(err) {
            console.log(err);
            NotificationManager.error("Transaction is failed!", "Failed");
        }
        setUpdated(!updated);
        setIsLoading(false);
        await getLatestItem();
        // await getWithdrawHistory();
        // await initalSetting();
    }

    const declineWithdrawRequest = async (idx) => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!withdrawRequest) {
            NotificationManager.warning("No request!", "Warning");
            return;
        }

        try {
            setIsLoading(true);
            await contract.methods.declineWithdrawRequest()
            .send({ from: ownerAddress })
            .on('receipt', async(res) => {
                NotificationManager.success("Declined withdraw successfully!", "Success");
            })
            .catch(err => {
                console.log(err);
            })
            
        } catch(err) {
            NotificationManager.error("Transaction is failed!", "Failed");
        }
        setUpdated(!updated);
        setIsLoading(false);
        // await getWithdrawHistory();
        await getLatestItem();
    }

    const getLatestItem = async() => {
        // let flag = 0;
        const withdraw = await contract.methods.withdrawRequest().call();
        if (withdraw.isActive) {
            // flag = 1;
            setWithdrawRequest({...withdraw });
        }
        
        else setWithdrawRequest(null);

        // if (flag > 0) {
        //     await contract.getPastEvents('Withdraw', {
        //         filter: { status: false },
        //         fromBlock: 	21888857,
        //         toBlock: 'latest'
        //     }).then((events) => {
        //         setDecWithdrawNumber(events.length);
        //     });
        // }
    }

    return (
        <div className="container" id="withdraw">
            <SectionTitle title="Withdraw"/>
            <div className="row justify-content-center">
                <div className="col-5">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">
                                <strong>Create withdraw request</strong>
                            </h5>
                            <fieldset id="createWithdrawFieldset">
                                <label htmlFor="createWithdrawToAddress">Send tokens to new address</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Address"
                                        aria-label="Address"
                                        id="createWithdrawToAddress"
                                        value={ownerAddress === "Loading..." ? "" : ownerAddress}
                                        readOnly={true}
                                    />
                                </div>
                                <label htmlFor="createWithdrawTokens">Tokens (ETH)</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Tokens"
                                        aria-label="Tokens"
                                        id="createWithdrawTokens"
                                        value={ withdrawAmount }
                                        onChange = { (e) => setWithdrawAmount(e.target.value) }
                                    />
                                </div>

                                <button
                                    type="button"
                                    className={`btn btn-success w-100 mb-1 ${ !isConnected && "disabled"}`}
                                    id="withdrawCreateButton"
                                    onClick={ () => createWithdrawRequest() }
                                >Create</button>
                            </fieldset>

                        </div>
                    </div>
                </div>
                <div className="col-5">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">
                                <strong>Current withdraw request</strong>
                            </h5>
                            <fieldset id="createWithdrawFieldset">
                                <label htmlFor="createWithdrawToAddress">Send tokens to new address</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="createWithdrawToAddress"
                                        value={withdrawRequest ? withdrawRequest.to : ''}
                                        readOnly
                                    />
                                </div>
                                <label htmlFor="createWithdrawTokens">Tokens (ETH)</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="createWithdrawTokens"
                                        value={ withdrawRequest ? web3 ? web3.utils.fromWei(withdrawRequest.amount, 'ether') : '' : '' }
                                        readOnly
                                    />
                                </div>
                                <label htmlFor="createWithdrawTokens">Created By</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="createWithdrawTokens"
                                        value={ withdrawRequest ? withdrawRequest.creator : '' }
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
                            <button type="button" className={`btn btn-success w-100 mb-1 ${ !isConnected && "disabled"}`} id="withdrawApproveButton"
                                onClick={ () =>approveWithdrawRequest() }>Approve</button>
                            <button type="button" className="btn btn-light w-100" id="withdrawDeclineButton"
                                onClick={ () =>declineWithdrawRequest() }>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Withdraw;