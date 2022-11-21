import { useState } from "react";
import { NotificationManager } from "react-notifications";
import { useAppContext } from "../../../context";
import SectionTitle from "../sectionTitle";

const Deposit = ({ contract }) => {

    const { web3, isConnected, ownerAddress, setIsLoading } = useAppContext();
    const [fund, setFund] = useState('');

    const deposit = async() => {

        try {

            if (!isConnected) {
                NotificationManager.warning("Metamask is not connected!", "Warning");
                return;
            }

            if (fund <= 0) {
                NotificationManager.warning("Please input correct amount");
                return;
            }

            setIsLoading(true);
            const amount = web3.utils.toWei(fund, "ether");
            const balance = await web3.eth.getBalance(ownerAddress);
            if (balance < amount) {
                NotificationManager.warning("Insufficient Funds");
                return;
            }
            await contract.methods.deposit().send({
                from: ownerAddress,
                value: amount
            });
            NotificationManager.success("Deposited successfully");
        } catch(err) {
            console.log(err);
        }
        setIsLoading(false);
    }

    return (
        <div className="container" id="depsoit">

            <SectionTitle title="Deposit"/>
            
            <div className="input-group mb-3">
                <input
                    type="number"
                    className="form-control max-w-250"
                    placeholder="Input fund amount"
                    id="deposit-fund"
                    value={fund}
                    onChange={(e) => setFund(e.target.value)}
                />
                <button className="btn btn-success ml-2" onClick={deposit}>Deposit</button>
            </div>
        </div>
    )
}

export default Deposit;