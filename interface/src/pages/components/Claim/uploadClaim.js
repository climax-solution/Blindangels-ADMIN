import { useState } from "react";
import { MerkleTree } from "merkletreejs";
import { utils } from "ethers";
import keccak256 from "keccak256";
import Papa from "papaparse"
import { NotificationManager } from "react-notifications";
import { useAppContext } from "../../../context";

const UploadClaim = () => {

    const { web3, cContract, isConnected, ownerAddress, setIsLoading } = useAppContext();

    const [reflectionList, setReflectionList] = useState([]);
    const [week, setWeek] = useState(1);

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
            for (let i = 0; i < reflectionList.length; i ++) {
                if(chunkList.filter((c) => c[0] === reflectionList[i].account ).length > 0) continue;
                chunkList.push([
                    reflectionList[i].account,
                    web3.utils.toWei(reflectionList[i].balance, 'ether')
                ])
            }

            const elements = reflectionList.map((x, idx) => utils.solidityKeccak256(["uint256","address", "uint256", "uint256"], [idx + 1, x.account, web3.utils.toWei(x.balance, 'ether'), week]));
            const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
            const root = merkleTree.getHexRoot();
            const proof = merkleTree.getHexProof(elements[2]);
            console.log(proof);
            await cContract.methods.updateClaimList(root)
            .send({ from : ownerAddress })
            .on('receipt', (res) => {
                NotificationManager.success("Upload successfully!", "Success");
                const list = JSON.stringify(reflectionList);
                window.localStorage.setItem('clail-list', list);
            })
            .catch(err => console.log)
        } catch(err) {
            console.log(err);
            if (err) {
                NotificationManager.error("Upload failed!", "Failed");
            }
        }
        // setRequestedList(reflectionList);
        setReflectionList([]);
        setIsLoading(false);
    }

    return (
        <div className="container">
            <h2 className="mt-5 mb-3">
                <strong>Upload Reflections Claim List</strong>
            </h2>
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
    )
}

export default UploadClaim;