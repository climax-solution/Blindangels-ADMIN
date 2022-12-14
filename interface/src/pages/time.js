import moment from "moment";
import { useEffect, useState } from "react"
import { useAppContext } from "../context";

const Time = ({ blockNumber }) => {
    
    const { web3 } = useAppContext();

    const [isLoading, setLoading] = useState(true);
    const [time, setTime] = useState('');

    useEffect(() => {
        async function getTime() {
            setLoading(true);
            const timestamp = await web3.eth.getBlock(blockNumber);
            const _time = moment(timestamp.timestamp * 1000).calendar();
            setTime(_time);
            setLoading(false);
        }

        if (blockNumber && web3) getTime();

    }, [blockNumber, web3])

    return (
        <td>{ isLoading ? "Loading..." : time }</td>
    )
}

export default Time;