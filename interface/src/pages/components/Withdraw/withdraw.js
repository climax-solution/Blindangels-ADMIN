import { useEffect, useState } from "react";
import { NotificationManager } from "react-notifications";
import { useAppContext } from "../../../context";

const Withdraw = () => {

    const { web3, cContract, isConnected, ownerAddress } = useAppContext();

    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawRequest, setWithdrawRequest] = useState('');
    // const [decWithdrawNumber, setDecWithdrawNumber] = useState('');

    useEffect(() => {
        async function run () {
            if (cContract) {
                await getLatestItem();
            } 
        }
        run();
    }, [cContract]);

    const createWithdrawRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!web3.utils.isAddress(withdrawAddress)) {
            NotificationManager.warning("Please enter correct address!", "Warning");
            return;
        }

        if (withdrawAmount <= 0) {
            NotificationManager.warning("Please enter correct amount!", "Warning");
            return;
        }
        
        // setIsLoading(true);
        try{
            await cContract.methods.newWithdrawRequest(withdrawAddress, web3.utils.toWei(withdrawAmount.toString(), "ether"))
            .send({ from: ownerAddress })
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
        setWithdrawAddress('');
        setWithdrawAmount('');
        await getWithdrawHistory();
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
            // setIsLoading(true);
            await cContract.methods.approveWithdrawRequest()
            .send({ from: ownerAddress })
            .on('receipt', async(res) => {
                NotificationManager.success("Sent successfully!", "Success");
            });
            
        } catch(err) {
            console.log(err);
            NotificationManager.error("Transaction is failed!", "Failed");
        }
        // setIsLoading(false);
        // await getLatestItem();
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
            // setIsLoading(true);
            await cContract.methods.declineWithdrawRequest()
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
        // setIsLoading(false);
        await getWithdrawHistory();
        await getLatestItem();
    }

    const getLatestItem = async() => {
        let flag = 0;
        const withdraw = await cContract.methods.withdrawRequest().call();
        if (withdraw.isActive) {
            flag = 1;
            setWithdrawRequest({...withdraw, flag: 1});
        }
        
        else setWithdrawRequest(null);

        // if (flag > 0) {
        //     await cContract.getPastEvents('Withdraw', {
        //         filter: { status: false },
        //         fromBlock: 	21888857,
        //         toBlock: 'latest'
        //     }).then((events) => {
        //         setDecWithdrawNumber(events.length);
        //     });
        // }
    }

    const getWithdrawHistory = async() => {
        try {
            await cContract.getPastEvents('Withdraw', {
                filter: { status: true },
                fromBlock: 	21888857,
                toBlock: 'latest'
            }).then((events) => {
                // setLastWithdrawsTreasury(events);
            });

            // await cContract.getPastEvents('Withdraw', {
            //     filter: { status: true },
            //     fromBlock: 	21888857,
            //     toBlock: 'latest'
            // }).then((events) => {
            //     setLastClaimWithdrawsList(events);
            // });
            // await axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=21888857&toBlock=latest&address=${config.ddress}&topic0=0x6c201685d45b350967167ae4bbf742a99dd958968b9c36ce07db27dda4d581d0&apikey=${config.apiKey}`).then(res => {
            //     let { result } = res.data;
            //     result = result.filter(item => item.)
            //     setWithdrawedList(res.data.result);
            // });

            // await axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=21888857&toBlock=latest&address=${config.claimAddress}&topic0=0x6c201685d45b350967167ae4bbf742a99dd958968b9c36ce07db27dda4d581d0&apikey=${config.apiKey}`).then(res => {
            //     setLastClaimWithdrawsList(res.data.result);
            // });

            // await web3.eth.getTransactionReceipt('0xcf92a986183288d2010fa3519a579b8b491675bb235de3bc7d7d857966ff0caa').then(console.log);
            // await axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=21888857&toBlock=latest&address=${config.claimAddress}&topic0=0x517536260e5362f2490ab89add881956277be30f0f7b772af65167c5c17fe606&topic0_1_opr=or&topic1=0x47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d4&apikey=${config.apiKey}`).then(res => {
            //     // setWithdrawedList(res.data.result);
            // });

        } catch(err) {
            console.log(err)
        }
        
    }

    return (
        <div className="container" id="withdraw">

            <div className="row">
                <h2 className="mt-5 mb-3 col-7"><strong>Withdraw</strong></h2>
            </div>
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
                                        value={withdrawAddress}
                                        onChange={(e) => setWithdrawAddress(e.target.value)}
                                    />
                                </div>
                                <label htmlFor="createWithdrawTokens">Tokens (without decimals)</label>
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

                                <button type="button" className={`btn btn-success w-100 mb-1 ${ !isConnected && "disabled"}`} id="withdrawCreateButton"
                                    onClick={ () => createWithdrawRequest() }>Create</button>
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
                                <label htmlFor="createWithdrawTokens">Tokens (without decimals)</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="createWithdrawTokens"
                                        value={ withdrawRequest ? web3.utils.fromWei(withdrawRequest.amount, 'ether') : '' }
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
                            <button type="button" className={`btn btn-success w-100 mb-1 ${ !false && "disabled"}`} id="withdrawApproveButton"
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