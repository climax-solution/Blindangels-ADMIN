import { useState } from "react";
import { useAppContext } from "../../../context";
import SectionTitle from "../sectionTitle";

const TransferHistory = () => {

    const { web3 } = useAppContext();

    const [lastTransfersTreasury, setLastTransfersTreasury] = useState([]);

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
                            lastTransfersTreasury.map(({ returnValues: item}, idx) => {
                                return (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.createdBy}</td>
                                        <td>{item.to}</td>
                                        <td>{item.dealedBy}</td>
                                        <td>{web3.utils.fromWei(item.value, "ether")}</td>
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