import { useState } from "react";
import ReflectionHistory from "../refHistory";

const ClaimHistory = ({ web3 }) => {
    const [transferedList, setTransferedList] = useState([]);

    return (
        <div className="container mb-5 mt-10">
            <h2 className="mt-5 mb-3">
                <strong>View Last Reflections Claimed</strong>
            </h2>
            <div className="table-panel w-100 overflow-auto" style={{ overflow: 'auto'}}>
                <table id="upload-table" className="table">
                    <thead className='thead-dark'>
                        <tr>
                            <th>#</th>
                            {/* <th>From</th> */}
                            <th>To</th>
                            <th>Dealer</th>
                            <th>Value</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            transferedList.map((item, idx) => {
                                return (
                                    <ReflectionHistory
                                        key={idx + 1}
                                        idx={idx}
                                        tx={item}
                                        web3={web3}
                                    />
                                )
                            })
                        }
                        {
                            !transferedList.length && 
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