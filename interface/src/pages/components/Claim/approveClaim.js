import MerkleTree from "merkletreejs";
import { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { utils } from "ethers";
import { NotificationManager } from "react-notifications";
import keccak256 from "keccak256";
import { useAppContext } from "../../../context";
import SectionTitle from "../sectionTitle";

const ApproveClaimList = () => {
    const { cContract, setIsLoading, ownerAddress, isConnected, web3, updated, setUpdated } = useAppContext();

    const [requestedList, setRequestedList] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [claimHash, setClaimHash] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const csvLink = useRef() // setup the ref that we'll use for the hidden CsvLink click once we've updated the data

    useEffect(() => {
        const list = JSON.parse(window.localStorage.getItem('claim-list'));
        if (list && list.length) {
            setRequestedList(list);
        }
        else setRequestedList([]);
    }, [updated]);

    useEffect(() => {
        if(cContract) getClaimListRequest(); // eslint-disable-next-line
    }, [cContract])

    const approveClaimList = async() => {
        setIsLoading(true);
        try {
            await cContract.methods.approveClaimListRequest().send({ from: ownerAddress });
            NotificationManager.success('Approve successfully!', 'Success');
            window.localStorage.removeItem('claim-list');
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
            window.localStorage.removeItem('claim-list');
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

    const downloadProofs = async() => {
        const week = await cContract.methods.week().call();
        const elements = requestedList.map((x, idx) => utils.solidityKeccak256(["uint256","address", "uint256", "uint256"], [idx + 1, x.account, web3.utils.toWei(x.balance, 'ether'), week]));
        const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
        let _csvData = [
            ["account", "proofs"],
        ];
        requestedList.map((item, index) => {
            const proof = merkleTree.getHexProof(elements[index]);
            if (proof.length == 1) _csvData.push([item.account, `[${proof[0]}]`]);

            if (proof.length > 1) {
                _csvData.push([item.account, `[${proof[0]}`]);
                for (let i = 1; i < proof.length; i ++) {
                    if (i == proof.length - 1) _csvData.push(["", proof[i]]);
                    else _csvData.push(["", `${proof[i]}]`]);
                }
            }

            return item;
        });
        setCsvData(_csvData);
        csvLink.current.link.click();
    }

    const getClaimListRequest = async() => {
        const request = await cContract.methods.claimRootRequest().call();
        if (request.isActive) {
            setClaimHash(request.root);
            setCreatedBy(request.createdBy);
        }
    }

    return (
        <div className="container">
            <SectionTitle title="Approve Reflections Claim List"/>
            {
                createdBy ? (
                    <div>
                        <strong>Created By: </strong>
                        <span className="btn border">{ createdBy }</span>
                    </div>
                ) : ""
            }

            <div>
                <strong>Pending Claim Request: </strong>
                <span className="btn border">{ claimHash ? claimHash : "No pending request" }</span>
            </div>

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
                <div className="d-flex gap-2">
                    <div>
                        <button type="button" className={`btn btn-success w-100 mb-1 ${!isConnected && "disabled"}`} id="transferApproveButton" onClick={ isConnected ? approveClaimList :null } >Approve</button>
                        <button type="button" className={`btn btn-light w-100 ${!isConnected && "disabled"}`} id="transferDeclineButton" onClick={ isConnected ? clearClaim : null }>Cancel</button>
                    </div>
                    <div className="ml-3">
                        <button
                            className={`btn btn-success ${!isConnected && "disabled"}`}
                            onClick={isConnected ? downloadProofs : null}
                        >Download Proofs</button>
                        <CSVLink
                            data={csvData}
                            className="d-none"
                            ref={csvLink}
                        >Download</CSVLink>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ApproveClaimList;