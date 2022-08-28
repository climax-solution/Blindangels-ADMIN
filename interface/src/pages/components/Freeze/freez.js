import { useEffect, useState } from "react";
import { NotificationManager } from "react-notifications";
import { useAppContext } from "../../../context";
import SectionTitle from "../sectionTitle";

const Freeze = () => {
    const { cContract, setIsLoading, ownerAddress, isConnected } = useAppContext();
    const [frozen, setFrozen] = useState(false);

    useEffect(() => {
        if (cContract) getFrozen();
    }, [cContract]);

    async function getFrozen() {
        const _frozen = await cContract.methods.frozen().call();
        setFrozen(_frozen);
    };

    const manageFrozen = async(type) => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected");
            return;
        }

        setIsLoading(true);
        try {
            if (type) {
                await cContract.methods.freeze().send({ from: ownerAddress });
            } else {
                await cContract.methods.unfreeze().send({ from: ownerAddress });
            }
            NotificationManager.success("Success!");
        } catch(err) {
            console.log(err);
            NotificationManager.error("Failed");
        }
        setIsLoading(false);
        await getFrozen();
    }

    return (
        <div className="container my-5">
            <SectionTitle title={"Claim Status: " + (frozen ? "Frozen": "Not Frozen")}/>
            <hr className="border-dark"/>
            <div className="button-group">
                <button className="btn btn-success" onClick={() => manageFrozen(true)}>Freeze</button>
                <button className="btn btn-warning ml-2" onClick={() => manageFrozen(false)}>Unfreeze</button>
            </div>
        </div>
    )
}

export default Freeze;