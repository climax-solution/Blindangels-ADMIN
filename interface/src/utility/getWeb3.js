import Web3 from "web3";

export const getWeb3 = async() => {
    let web3;
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        const chainID = await web3.eth.getChainId();
        if (chainID != 5) web3 = new Web3("https://eth-goerli.g.alchemy.com/v2/LYuZuxHIZHqSqR5qCsT768jCORqGoXqn");
    }
    else {
        web3 = new Web3("https://eth-goerli.g.alchemy.com/v2/LYuZuxHIZHqSqR5qCsT768jCORqGoXqn");
    }

    return web3;
}