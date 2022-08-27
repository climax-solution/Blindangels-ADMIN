import { useState } from "react";

const TransferHistory = ({ web3 }) => {

    const [lastTransfersTreasury, setLastTransfersTreasury] = useState([]);

    return (
        <div className="container mb-5 mt-10" id="treasury-last-transfer">
            <h2 className="mt-5 mb-3">
                <strong>View Treasury Wallet Last Transfers</strong>
            </h2>
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
                            lastTransfersTreasury.map(({ returnValues: item}, idx) => {
                                return (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.createdBy}</td>
                                        <td>{item.to}</td>
                                        <td>{item.dealedBy}</td>
                                        <td>{web3.utils.fromWei(item.value, "gwei")}</td>
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