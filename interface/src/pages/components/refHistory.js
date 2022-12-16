import { useEffect, useState } from "react";
import config from "../../config.json";

const ReflectionHistory = ({ tx, web3, idx }) => {
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        async function run() {
            if (tx.data === '0x') {
                await web3.eth.getTransactionReceipt(tx.transactionHash).then((res) => {
                    const logs = res.logs.filter(item => (item.address).toLowerCase() !== (config.claimAddress).toLowerCase());
                    setLogs(logs);
                });
            }
    
            else {
                const result = web3.eth.abi.decodeParameters([{
                    type: 'address',
                    name: 'to'
                }, {
                    type: "uint256",
                    name: "amount"
                }], tx.data);
            }
        }
        run();
    }, [tx]); // eslint-disable-line react-hooks/exhaustive-deps

    const decodeAddr = (str) => {
        return web3.eth.abi.decodeParameter('address', str);
    }

    return (
        <>
        {
            tx.data === '0x' ?
            <>
                {
                    logs.map((item, idx) => {
                        return (
                            <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>{decodeAddr(item.topics[2])}</td>
                                <td>{decodeAddr(tx.topics[1])}</td>
                                <td className="text-right">{web3 ? web3.utils.fromWei(item.data, 'ether') : ""}</td>
                                <td><span className="badge badge-secondary">Batch Claim</span></td>
                            </tr>
                        )
                    })
                }
            </>
            :
            <tr>
                <td>{idx}</td>
                <td>{decodeAddr(tx.topics[1])}</td>
                <td>{decodeAddr(tx.topics[1])}</td>
                <td className="text-right">{web3 ? web3.utils.fromWei(tx.data, 'ether') : ""}</td>
                <td><span className="badge-primary">Claim</span></td>
            </tr>
        }
        </>
    )
}

export default ReflectionHistory;