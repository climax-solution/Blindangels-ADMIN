import { useEffect, useState } from "react";
import { MerkleTree } from "merkletreejs";
import { utils } from "ethers";
import keccak256 from "keccak256";
import Papa from "papaparse"
import { NotificationManager } from "react-notifications";
import { useAppContext } from "../../../context";
import SectionTitle from "../sectionTitle";

const UploadClaim = () => {

    const { web3, cContract, isConnected, ownerAddress, setIsLoading, updated, setUpdated } = useAppContext();

    const [reflectionList, setReflectionList] = useState([]);
    const [week, setWeek] = useState('');
    const [claimHash, setClaimHash] = useState('');

    useEffect(() => {
        if (cContract) getClaimMerkleTree(); // eslint-disable-next-line
    }, [cContract, updated])

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
        setIsLoading(true);
        try {
            const _frozen = await cContract.methods.frozen().call();
            if (!_frozen) throw new Error("Freeze claim");
            for (let i = 0; i < reflectionList.length; i ++) {
                if(chunkList.filter((c) => c[0] === reflectionList[i].account ).length > 0) continue;
                chunkList.push([
                    reflectionList[i].account,
                    web3.utils.toWei(reflectionList[i].balance, 'ether')
                ])
            }

            let totalAmount = 0;
            const elements = reflectionList.map((x, idx) => {
                totalAmount += +x.balance;
                return utils.solidityKeccak256(["uint256","address", "uint256", "uint256"], [idx + 1, x.account, web3.utils.toWei(x.balance, 'ether'), week]);
            });
            const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
            const root = merkleTree.getHexRoot();
            await cContract.methods.newClaimListRequest(root, web3.utils.toWei(totalAmount.toString(), 'ether'))
            .send({ from : ownerAddress })
            .on('receipt', () => {
                NotificationManager.success("Upload successfully!", "Success");
                const list = JSON.stringify(reflectionList);
                window.localStorage.setItem('claim-list', list);
            })
            .catch(err => console.log)
        } catch(err) {
            console.log(err);
            if (err?.code !== 4001) {
                if (err?.response?.message) NotificationManager.error(err.response.message, "Failed");
                else NotificationManager.error("Transaction is failed", "Failed");
            }
        }
        setUpdated(!updated);
        // setRequestedList(reflectionList);
        setReflectionList([]);
        setIsLoading(false);
    }

    const getClaimMerkleTree = async() => {
        const hash = await cContract.methods.claimMerkleRoot().call();
        setClaimHash(hash);
    }
    return (
        <>
            <div className="container">
                <SectionTitle title="Active Claim MerkleTree Root"/>
                <span className="btn border">{claimHash}</span>
            </div>
            <div className="container">
                <SectionTitle title="Upload Reflections Claim List"/>
                <div className='row'>
                    <div className="controls-section col">
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
                    <div className='week-secion col'>
                        <div className="input-group mb-3">
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
            </div>
        </>
    )
}

export default UploadClaim;