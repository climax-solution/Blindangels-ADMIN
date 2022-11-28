import { useEffect, useState } from "react";
import { NotificationManager } from "react-notifications";
import { useAppContext } from "../../../context";
import SectionTitle from "../sectionTitle";

const Week = () => {
    const { cContract, setIsLoading, ownerAddress, isConnected } = useAppContext();
    const [week, setWeek] = useState('');

    useEffect(() => {
        if (cContract) getWeek();
    }, [cContract]); // eslint-disable-line react-hooks/exhaustive-deps

    async function getWeek() {
        const _week = await cContract.methods.week().call();
        setWeek(_week);
    };

    const manageWeek = async(type) => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected");
            return;
        }

        setIsLoading(true);
        try {
            if (type) {
                const _frozen = await cContract.methods.frozen().call();
                if (_frozen) await cContract.methods.increaseWeek().send({ from: ownerAddress });
                else throw new Error("Freeze claim");
            } else {
                await cContract.methods.decreaseWeek().send({ from: ownerAddress });
            }
            NotificationManager.success("Success!");
        } catch(err) {
            if (err?.code !== 4001) {
                if (err?.response?.message) NotificationManager.error(err.response.message, "Failed");
                else NotificationManager.error("Transaction is failed", "Failed");
            }
        }
        setIsLoading(false);
        await getWeek();
    }

    return (
        <div className="container my-5">
            <SectionTitle title={"Current Week: " + week}/>
            <hr className="border-dark"/>
            <div className="button-group">
                <button className="btn btn-success" onClick={() => manageWeek(true)}>Increase</button>
                <button className="btn btn-warning ml-2" onClick={() => manageWeek(false)}>Decrease</button>
            </div>
        </div>
    )
}

export default Week;