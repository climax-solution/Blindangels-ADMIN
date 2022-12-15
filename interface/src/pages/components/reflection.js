import { useEffect, useState } from "react"

const Reflection = ({ idx, address, contract, web3 }) => {
    const [balance, setBalance] = useState('');
    useEffect(async() => {
        const item = await contract.methods.reward(address).call();
        setBalance(item.balance);
    }, []);

    return (
        <tr>
            <td>{idx}</td>
            <td>{address}</td>
            <td>{web3 ? web3.utils.fromWei(balance, 'ether') : ""}</td>
        </tr>
    )
}

export default Reflection;