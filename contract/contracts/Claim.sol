// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

pragma solidity ^0.8.0;

interface ERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
}

contract BlindAngelClaim {

    bytes32 public claimMerkleRoot;

    ERC721 public nft;

    event Claimed(address indexed from, uint256 indexed amount, uint256 week);
    event UpdatedClaimList(address indexed updator, bytes32 root_);
    event ApprovedClaimList(address indexed dealer);
    event DeclinedClaimList(address indexed dealer);
    event Deposited(address dealer, uint256 amount);
    event Withdraw(address dealer, address to, uint256 amount);

    mapping(address => bool) public admins;
    mapping(address => mapping(uint256 => bool)) public claimed;

    address private last_creator;
    bool public frozen;
    bool private isApproved;

    modifier onlySigners() {
        require(admins[msg.sender]);
        _;
    }

    modifier onlyNFTOwner() {
        require(nft.balanceOf(msg.sender) > 0);
        _;
    }
    
    constructor(
        address[] memory _owners,
        address _nft
    ) {
        require(_owners.length == 3, "Owners are not 3 addresses" );
        for (uint i = 0; i < _owners.length; i ++) admins[_owners[i]] = true;
        nft = ERC721(_nft);
    }

    // end transfer part
    function claim(uint256 index, uint256 amount, bytes32[] calldata merkleProof, uint256 week) external onlyNFTOwner {
        require(!claimed[msg.sender][week], "caller already claimed reward");
        require(!frozen && isApproved, "claim is locked");

        bytes32 node = keccak256(abi.encodePacked(index, msg.sender, amount, week));

        require(
            MerkleProof.verify(merkleProof, claimMerkleRoot, node),
            "Claim: Invalid proof."
        );

        payable(msg.sender).transfer(amount);
        claimed[msg.sender][week] = true;
        emit Claimed(msg.sender, amount, week);
    }

    function updateClaimList(bytes32 root_) external onlySigners {
        require(frozen);
        
        claimMerkleRoot = root_;
        last_creator = msg.sender;
        isApproved = false;
        
        emit UpdatedClaimList(msg.sender, root_);
    }

    function approveClaimList() external onlySigners {
        require(last_creator != msg.sender, "caller is not available for apporving");

        frozen = false;
        isApproved = true;

        emit ApprovedClaimList(msg.sender);
    }

    function clearClaimList() external onlySigners {
        delete claimMerkleRoot;
        frozen = false;

        emit DeclinedClaimList(msg.sender);
    }

    function freeze() external onlySigners {
        frozen = true;
    }

    function unfreeze() external onlySigners {
        frozen = false;
    }

    function deposit(uint256 amount) external payable {
        require(msg.value >= amount);
        emit Deposited(msg.sender, amount);
    }

    function withdraw(address to) external onlySigners {
        emit Withdraw(msg.sender, to, address(this).balance);
        payable(to).transfer(address(this).balance);
    }

    receive() external payable {}
}