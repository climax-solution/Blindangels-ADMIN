import { useState } from "react";
import { useAppContext } from "../../../context";
import { NotificationManager } from "react-notifications";
import { useEffect } from "react";
import SectionTitle from "../sectionTitle";

const ManageSigner = ({ contract }) => {

    const { web3, isConnected, ownerAddress, setIsLoading } = useAppContext();

    const [signerAddress, setSignerAddress] = useState('');
    const [signerRequest, setSignerRequest] = useState('');
    const [requestType, setRequestType] = useState('');
    const [signers, setSigners] = useState([]);

    useEffect(() => {
        async function run() {
            if (contract) {
                await getLatestItem();
            }
        }
        run();
    }, [contract]); // eslint-disable-line react-hooks/exhaustive-deps

    const createSignerRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!web3.utils.isAddress(signerAddress)) {
            NotificationManager.warning("Please enter correct address!", "Warning");
            return;
        }

        if (requestType == '') {
            NotificationManager.warning("Please choose management type!", "Warning");
            return;
        }

        setIsLoading(true);
        try {
            if (requestType == "1") {
                const existSigners = await contract.methods.getAdmins().call();
                if (existSigners.length == 2) throw new Error("Signer is 2 at least");
            }
            await contract.methods.newSignerRequest(signerAddress, requestType == "0" ? true : false)
                .send({ from: ownerAddress })
                .on('receipt', async (res) => {
                    NotificationManager.info("Added successfully!", "Info");
                    setIsLoading(false);

                });
        }
        catch (err) {
            if (err?.code != 4001) {
                console.log("err", err);
                NotificationManager.error(err.response.message, "Failed");
            }
        }

        setIsLoading(false);
        setSignerAddress('');
        await getLatestItem();
    }

    const approveSignerRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!signerRequest) {
            NotificationManager.warning("No request!", "Warning");
            return;
        }

        if (signerRequest.createdBy.toLowerCase() == ownerAddress.toLowerCase()) {
            NotificationManager.warning("You can't approve self request", "Warning");
            return;
        }

        try {
            setIsLoading(true);
            await contract.methods.approveSignerRequest()
                .send({ from: ownerAddress })
                .on('receipt', async () => {
                    NotificationManager.success("Sent successfully!", "Success");
                });

        } catch (err) {
            console.log(err);
            NotificationManager.error("Transaction is failed!", "Failed");
        }
        setIsLoading(false);
        await getLatestItem();
        // await initalSetting();
    }

    const declineSignerRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!signerRequest) {
            NotificationManager.warning("No request!", "Warning");
            return;
        }

        try {
            setIsLoading(true);
            await contract.methods.declineSignerRequest()
                .send({ from: ownerAddress })
                .on('receipt', async () => {
                    NotificationManager.success("Approved successfully!", "Success");
                })
                .catch(err => {
                    console.log(err);
                })

        } catch (err) {
            if (err.code != 4001) {
                NotificationManager.error("Transaction is failed!", "Failed");
            }
        }
        setIsLoading(false);
        await getLatestItem();
    }

    const getLatestItem = async () => {
        const exist_signerRequest = await contract.methods.signerRequest().call();
        if (exist_signerRequest.isActive) {
            setSignerRequest({ ...exist_signerRequest });
        }

        else setSignerRequest(null);

        const signers = await contract.methods.getAdmins().call();
        setSigners(signers); 
    }

    return (
        <div className="container" id="manage-signers">

            <SectionTitle title="Manage Signers" />
            <div className="row mb-4">
                <div className="col-5">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">
                                <strong>Existing Signers</strong>
                            </h5>
                            <ul className="list-group signers-list">
                                {
                                    signers.map((item, idx) => (
                                        <li key={idx} className="list-group-item">{item}</li>
                                    ))
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-5">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">
                                <strong>Create request</strong>
                            </h5>
                            <fieldset id="createSignerFieldset">
                                <label htmlFor="createSignerToAddress">Signer address</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Address"
                                        aria-label="Address"
                                        id="createSignerToAddress"
                                        value={signerAddress}
                                        onChange={(e) => setSignerAddress(e.target.value)}
                                    />
                                </div>
                                <div className="d-flex gap-2 align-items-center mb-2">
                                    <div className="form-check" onChange={() => setRequestType("0")}>
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="register"
                                            id="flexRadioDefault1"
                                            checked={requestType == "0"}
                                            value="0"
                                            onChange={() => setRequestType("0")}
                                        />
                                        <label className="form-check-label" htmlFor="flexRadioDefault1">
                                            Register
                                        </label>
                                    </div>

                                    <div className="form-check ml-2" onChange={() => setRequestType("1")}>
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="remove"
                                            id="flexRadioDefault2"
                                            checked={requestType == "1"}
                                            value="1"
                                            onChange={() => setRequestType("1")}
                                        />
                                        <label className="form-check-label" htmlFor="flexRadioDefault2">
                                            Remove
                                        </label>
                                    </div>
                                </div>

                                <button type="button" className={`btn btn-success w-100 mb-1 ${!isConnected && "disabled"}`} id="transferCreateButton"
                                    onClick={() => createSignerRequest()}>Create</button>
                            </fieldset>

                        </div>
                    </div>
                </div>
                <div className="col-5">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">
                                <strong>Current signer request</strong>
                            </h5>
                            <fieldset id="createSignerFieldset">
                                <label htmlFor="createSignerToAddress">Signer address</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="createSignerToAddress"
                                        value={signerRequest ? signerRequest.signer : ''}
                                        readOnly
                                    />
                                </div>
                                <label htmlFor="createSignerTokens">Created By</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="createSignerTokens"
                                        value={signerRequest ? signerRequest.createdBy : ''}
                                        readOnly
                                    />
                                </div>
                                <label htmlFor="createSignerTokens">Request Status</label>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="createSignerTokens"
                                        value={signerRequest ? signerRequest.status == true ? "Register" : "Remove" : ""}
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
                            <button type="button" className={`btn btn-success w-100 mb-1 ${!isConnected && "disabled"}`} id="transferApproveButton"
                                onClick={() => approveSignerRequest()}>Approve</button>
                            <button type="button" className="btn btn-light w-100" id="transferDeclineButton"
                                onClick={() => declineSignerRequest()}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageSigner;