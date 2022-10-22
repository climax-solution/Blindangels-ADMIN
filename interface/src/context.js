import { createContext, useContext, useEffect, useState } from "react";
import { getWeb3 } from "./utility/getWeb3";
import treasuryAbi from "./contracts/treasury_abi.json";
import claimAbi from "./contracts/claim_abi.json";
import config from "./config.json";

const AppContext = createContext({});
const { treasuryAddress, claimAddress } = config;

export const AppWrapper = ({ children }) => {

    const [web3, setWEB3] = useState(null);
    const [tContract, setTreasuryContract] = useState(null)
    const [cContract, setClaimContract] = useState(null);
    const [ownerAddress, setOwnerAddress] = useState('Loading...');
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const _web3 = getWeb3();
        if (_web3) {
            const _Treasury = new _web3.eth.Contract(treasuryAbi, treasuryAddress);
            const _Claim = new _web3.eth.Contract(claimAbi, claimAddress);

            setClaimContract(_Claim);
            setTreasuryContract(_Treasury);
            setWEB3(_web3);
        }
    }, [])

    const context = {
        web3, tContract, cContract, ownerAddress, setOwnerAddress, isLoading, setIsLoading, isConnected, setIsConnected
    };

    return(
        <AppContext.Provider value={context}>
            {children}
        </AppContext.Provider>
    )
}


export const useAppContext = () => {
    return useContext(AppContext);
}