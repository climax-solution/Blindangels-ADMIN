import { useEffect, useState } from "react";
import { NotificationManager } from "react-notifications";
import { useAppContext } from "../../../context";
import SectionTitle from "../sectionTitle";

const ApproveClaimList = () => {
    const { cContract, setIsLoading, ownerAddress, isConnected, updated, setUpdated } = useAppContext();

    const [pendingClaimRoot, setPendingClaimRoot] = useState('');
    const [activeClaimRoot, setActiveClaimRoot] = useState('');
    const [createdBy, setCreatedBy] = useState('');

    useEffect(() => {
        if(cContract) {
            /* eslint-disable */
            getClaimListRequest();
            getClaimActiveMerkleTree();
        }
    }, [cContract, updated])

    const approveClaimList = async() => {
        setIsLoading(true);
        try {
            await cContract.methods.approveClaimListRequest().send({ from: ownerAddress });
            NotificationManager.success('Approve successfully!', 'Success');
        } catch(err) {
            console.log(err);
            NotificationManager.error('Approve failure!', 'Failure');
        }
        setIsLoading(false);
        setUpdated(!updated);
        await getLiveRefList();
    }

    const clearClaim = async() => {
        setIsLoading(true);
        try {
            await cContract.methods.declineClaimListRequest().send({ from: ownerAddress });
            NotificationManager.info('Cleared reflections successfully!', 'Success');
        } catch {
            NotificationManager.error('Clearing reflections successfully!', 'Failure');
        }

        setIsLoading(false);
        setUpdated(!updated);
        await getLiveRefList();
    }

    const getLiveRefList = async() => {
        // const list = await cContract.methods.getClaimList().call({ from: ownerAddress });
        // setRequestedList(list);
    }

    const getClaimListRequest = async() => {
        const request = await cContract.methods.claimRootRequest().call();
        if (request.isActive) {
            setPendingClaimRoot(request.root);
            setCreatedBy(request.createdBy);
        }
        else {
            setPendingClaimRoot('');
            setCreatedBy('');
        }
    }

    const getClaimActiveMerkleTree = async() => {
        const hash = await cContract.methods.claimMerkleRoot().call();
        setActiveClaimRoot(hash);
    }

    return (
        <>
            <div className="container">
                <SectionTitle title="Active Claim List Root"/>
                <span className="btn border bg-grey">{activeClaimRoot}</span>
            </div>

            <div className="container">
                <SectionTitle title="Approve Claim List Upload Request"/>
                <div className="row">
                    <div className="col-7">
                        <div className="card">
                            <div className="card-body">
                                <fieldset id="createSignerFieldset">
                                    <label htmlFor="pending-claim-request">Pending Claim Request</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            aria-label="Address"
                                            id="pending-claim-request"
                                            value={pendingClaimRoot}
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createClaimAddress">Created By</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            aria-label="Address"
                                            id="createClaimAddress"
                                            value={createdBy}
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
                                <button type="button" className={`btn btn-success w-100 mb-1 ${!isConnected && "disabled"}`} id="claimApproveButton" onClick={ isConnected ? approveClaimList :null } >Approve</button>
                                <button type="button" className={`btn btn-light w-100 ${!isConnected && "disabled"}`} id="claimDeclineButton" onClick={ isConnected ? clearClaim : null }>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default ApproveClaimList;