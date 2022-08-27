import { useEffect, useState } from "react";
import { NotificationManager } from "react-notifications";
import { useAppContext } from "../../../context";

const ApproveClaimList = () => {
    const { cContract, setIsLoading, ownerAddress } = useAppContext();

    const [requestedList, setRequestedList] = useState([]);

    useEffect(() => {
        const list = JSON.parse(window.localStorage.getItem('claim-list'));
        if (list && list.length) {
            setRequestedList(list);
        }
    }, []);

    const approveClaimList = async() => {
        setIsLoading(true);
        try {
            await cContract.methods.approveClaimList().send({ from: ownerAddress });
            NotificationManager.success('Claimed reflections successfully!', 'Success');
        } catch(err) {
            NotificationManager.error('Claimed reflections successfully!', 'Failure');
        }
        setIsLoading(false);
        await getLiveRefList();
    }

    const clearClaim = async() => {
        setIsLoading(true);
        try {
            await cContract.methods.clearClaimList().send({ from: ownerAddress });
            NotificationManager.info('Cleared reflections successfully!', 'Success');
        } catch {
            NotificationManager.error('Clearing reflections successfully!', 'Failure');
        }

        setIsLoading(false);
        await getLiveRefList();
    }

    const getLiveRefList = async() => {
        // const list = await cContract.methods.getClaimList().call({ from: ownerAddress });
        // setRequestedList(list);
    }

    return (
        <div className="container">
            <h2 className="mt-5 mb-3">
                <strong>Approve Reflections Claim List</strong>
            </h2>
            <div className="my-5" style={{ maxHeight: "500px", overflow: "auto"}}>
                <table className="table upload-data">
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
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.account}</td>
                                        <td className='text-right'>{item.balance}</td>
                                    </tr>
                                )
                            })
                        }
                        {
                            !requestedList.length && 
                            <tr>
                                <td colSpan={3} className="text-center">No rows</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
            <div className="row">
                <div className="col-2">
                    <div className="card-body">
                        <button type="button" className="btn btn-success w-100 mb-1" id="transferApproveButton" onClick={ approveClaimList } >Approve</button>
                        <button type="button" className="btn btn-light w-100" id="transferDeclineButton" onClick={ clearClaim }>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ApproveClaimList;