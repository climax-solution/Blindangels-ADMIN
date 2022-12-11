import { createContext, useContext, useEffect, useState } from "react";
import { getWeb3 } from "./utility/getWeb3";
import treasuryAbi from "./contracts/treasury_abi.json";
import claimAbi from "./contracts/claim_abi.json";
import config from "./config.json";

const AppContext = createContext({});
const { inboundTreasuryAddress, outboundTreasuryAddress, claimAddress } = config;

export const AppWrapper = ({ children }) => {

    const [web3, setWEB3] = useState(null);
    const [tInContract, setInTreasuryContract] = useState(null)
    const [tOutContract, setOutTreasuryContract] = useState(null)
    const [cContract, setClaimContract] = useState(null);
    const [ownerAddress, setOwnerAddress] = useState('Loading...');
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [activeTab, setActiveTab] = useState("inbound");
    const [updated, setUpdated] = useState(false);

    useEffect(async() => {
        const _web3 = await getWeb3();
        if (_web3) {
            const _inTreasury = new _web3.eth.Contract(treasuryAbi, inboundTreasuryAddress);
            const _outTreasury = new _web3.eth.Contract(treasuryAbi, outboundTreasuryAddress);
            const _Claim = new _web3.eth.Contract(claimAbi, claimAddress);

            setClaimContract(_Claim);
            setInTreasuryContract(_inTreasury);
            setOutTreasuryContract(_outTreasury);
            setWEB3(_web3);
            
            if (window.ethereum) {
                const provider = window.ethereum;

                provider
                .on("accountsChanged", (accounts) => {
                    setOwnerAddress(accounts[0]);
                })
                .on("chainChanged", () => {
                    window.location.reload();
                })
            }
        }
    }, []); // eslint-disable-next-line

    const context = {
        web3,
        tInContract,
        tOutContract,
        cContract,
        ownerAddress,
        isLoading,
        isConnected,
        activeTab,
        updated,
        setOwnerAddress,
        setIsLoading,
        setIsConnected,
        setActiveTab,
        setUpdated
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