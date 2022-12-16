import { NotificationManager } from "react-notifications";
import Papa from "papaparse"
import { useAppContext } from "../../../context";
import SectionTitle from "../sectionTitle";
import { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { utils } from "ethers";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";

const VerifyClaim = () => {
    const { web3, cContract, isConnected, updated } = useAppContext();

    const [requestedList, setRequestedList] = useState([]);
    const [week, setWeek] = useState('');
    const [pendingClaimRoot, setPendingClaimRoot] = useState('');
    const [generatedClaimRoot, setGeneratedClaimRoot] = useState('');
    const [fileName, setFileName] = useState('');
    const [csvData, setCsvData] = useState('');
    const csvLink = useRef() // setup the ref that we'll use for the hidden CsvLink click once we've updated the data

    useEffect(() => {
        /* eslint-disable */
        if (cContract) getClaimListRequest();
    }, [cContract, updated])

    useEffect(() => {
        if (csvData.length) {
            csvLink.current.link.click();
        }
    }, [csvData])

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
                    setRequestedList(results.data);
                    setGeneratedClaimRoot('');
                    setFileName(file.name);
                },
            });
        } catch(err) {
            console.log(err);
        }

        e.target.value = null;
    }

    const downloadProofs = async() => {
        const elements = requestedList.map((x, idx) => utils.solidityKeccak256(["uint256","address", "uint256", "uint256"], [idx + 1, x.account, web3.utils.toWei(x.balance, 'ether'), week]));
        const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
        let _csvData = [
            ["account", "proofs", "merkle_root"],
        ];
        requestedList.map((item, index) => {
            const proof = merkleTree.getHexProof(elements[index]);
            _csvData.push([item.account, `[${proof}]`, merkleTree.getHexRoot()]);

            return item;
        });
        setCsvData(_csvData);
    }

    const getClaimListRequest = async() => {
        const request = await cContract.methods.claimRootRequest().call();
        if (request.isActive) {
            setPendingClaimRoot(request.root);
        }        
        else {
            setPendingClaimRoot('');
        }
        setGeneratedClaimRoot('');
    }

    const compareAndGenerate = () => {
        const elements = requestedList.map((x, idx) => utils.solidityKeccak256(["uint256","address", "uint256", "uint256"], [idx + 1, x.account, web3.utils.toWei(x.balance, 'ether'), week]));
        const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
        setGeneratedClaimRoot(merkleTree.getHexRoot());
    }

    const clear = () => {
        setGeneratedClaimRoot('');
        setRequestedList([]);
        setFileName('');
    }

    return (
        <>
            <div className="container">
                <SectionTitle title="Verify Claim List Upload Request"/>
                <div className='row'>
                    <div className="controls-section col-md-5">
                        <div className="upload-file-button">
                            <div className="file-indicator">
                            {fileName ? fileName : "Chose file to upload"}
                            </div>
                            <label htmlFor="file-upload-verify" className={`custom-file-upload btn  btn-success ${!isConnected && "disabled"}`}>
                                Browse
                            </label>
                            {
                            
                                isConnected ? <input id="file-upload-verify" type="file" accept='.csv' onChange={importReflectionList} /> : ""
                            }
                        </div>
                        <label className={`btn btn-warning ${!isConnected && "disabled"}`} onClick={clear}>
                            Clear
                        </label>
                    </div>
                    <div className='week-section col-md-4 d-flex'>
                        <div className="input-group mr-2">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Input week number"
                                id="week"
                                value={week}
                                onChange={(e) => setWeek(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <button id="uploadBtn" className={`btn btn-success ${(!isConnected || !requestedList.length) && "disabled"}`} onClick={(isConnected && requestedList.length) ? compareAndGenerate : null}>Compare & Generate</button>
                    </div>
                </div>
                
                <div>
                    <fieldset id="createSignerFieldset">
                        <label htmlFor="pending-claim-request">Pending Claim Request</label>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control max-w-600px"
                                aria-label="Pending Claim Request"
                                id="pending-claim-request"
                                value={pendingClaimRoot}
                                readOnly
                            />
                        </div>
                        <label htmlFor="createClaimAddress">Generated Claim Request</label>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control max-w-600px"
                                aria-label="Address"
                                id="createClaimAddress"
                                value={generatedClaimRoot}
                                readOnly
                            />
                        </div>
                        <label htmlFor="pending-claim-request">Are lists the same?</label>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control max-w-100px"
                                aria-label="Pending Claim Request"
                                id="pending-claim-request"
                                value={pendingClaimRoot && generatedClaimRoot ? ( pendingClaimRoot === generatedClaimRoot ? "Yes" : "No" ) : ""}
                                readOnly
                            />
                        </div>
                    </fieldset>
                </div>

                <div className="row">
                    <div className="d-flex gap-2">
                        <div className="ml-3">
                            <button
                                className={`btn btn-success ${(!isConnected || !requestedList.length) && "disabled"}`}
                                onClick={(isConnected && requestedList.length) ? downloadProofs : null}
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
        </>
    )
}

export default VerifyClaim;