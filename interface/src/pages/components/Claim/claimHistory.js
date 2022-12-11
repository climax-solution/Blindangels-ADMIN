import { useEffect, useState } from "react";
import { useAppContext } from "../../../context";
import SectionTitle from "../sectionTitle";
import config from "../../../config.json";
import axios from "axios";

const { bitqueryKey } = config;

const ClaimHistory = ({ address }) => {
    const { web3 } = useAppContext();
    const [claimedList, setClaimedList] = useState([]);

    useEffect(() => {
        async function fetchHistory() {
            const query = `
                query{
                    ethereum(network: goerli) {
                        smartContractEvents(
                            smartContractAddress: {is: "${address}"}
                            smartContractEvent: {is: "Claimed"}
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
                setClaimedList(data.ethereum.smartContractEvents);
            }).catch(err => {
                setClaimedList([]);
            });
        }

        if (address) fetchHistory();

    }, [address]) 

    return (
        <div className="container mb-5 mt-10">
            <SectionTitle title="View Last Reflections Claimed"/>
            <div className="table-panel w-100 overflow-auto" style={{ overflow: 'auto'}}>
                <table id="upload-table" className="table">
                    <thead className='thead-dark'>
                        <tr>
                            <th>#</th>
                            {/* <th>From</th> */}
                            <th>Wallet Address</th>
                            <th>Value</th>
                            <th>Week</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            claimedList.map((item, idx) => {
                                return (
                                    <tr key={idx}>
                                        <td>{ idx + 1}</td>
                                        <td>{item.arguments[0].value}</td>
                                        <td>{web3.utils.fromWei(item.arguments[1].value, "ether")}</td>
                                        <td>{item.arguments[2].value}</td>
                                    </tr>
                                )
                            })
                        }
                        {
                            !claimedList.length && 
                            <tr>
                                <td colSpan={5} className="text-center">No requested</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
            <div className='mt-3'>
                {/* <button className="btn btn-success">Download Report</button> */}
            </div>                    
        </div>
    )
}

export default ClaimHistory;