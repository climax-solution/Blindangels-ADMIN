import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useAppContext } from "../../../context";
import SectionTitle from "../sectionTitle";
import config from "../../../config.json";

const { bitqueryKey } = config;

const TransferHistory = ({ address }) => {

    const { web3 } = useAppContext();

    const [lastTransfersTreasury, setLastTransfersTreasury] = useState([]);

    useEffect(() => {
        if (address) fetchTransferHistory(); // eslint-disable-next-line
    }, [address])

    const fetchTransferHistory = async() => {
        const query = `
            query{
                ethereum(network: goerli) {
                    smartContractEvents(
                        smartContractAddress: {is: "${address}"}
                        smartContractEvent: {is: "Transfer"}
                        options: {desc: "block.height", limit: 10}
                    ) {
                        block {
                            height
                        }
                        arguments {
                            value
                            argument
                        }
                    }
                }            
            }
        `;
        await axios.post(
            "https://graphql.bitquery.io/",
            {
                query
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": bitqueryKey
                },
            }
        ).then(res => {
            const { data } = res.data;
            setLastTransfersTreasury(data.ethereum.smartContractEvents);
        }).catch(err => {
            setLastTransfersTreasury([]);
        })
    }

    return (
        <div className="container mb-5 mt-10" id="treasury-last-transfer">
            <SectionTitle title="View Treasury Wallet Last Transfers"/>
            <div className='overflow-auto'>
                <table id="upload-table" className="table">
                    <thead className='thead-dark'>
                        <tr>
                            <th>#</th>
                            <th>Creator</th>
                            <th>To</th>
                            <th>Dealer</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            lastTransfersTreasury.map(({ arguments: item}, idx) => {
                                return (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item[0].value}</td>
                                        <td>{item[2].value}</td>
                                        <td>{item[1].value}</td>
                                        <td>{web3.utils.fromWei(item[3].value, "ether")}</td>
                                    </tr>
                                )
                            })
                        }
                        {
                            !lastTransfersTreasury.length && 
                            <tr>
                                <td colSpan={5} className="text-center">No requested</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
            <div className='container mt-3'>
                {/* <button className="btn btn-success">Download Report</button> */}
            </div>
        </div>
    )
}

export default TransferHistory;