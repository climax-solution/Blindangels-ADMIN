// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.0;

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
}

contract BlindAngelClaim is Ownable {

    bytes32 public claimMerkleRoot;
    IERC721 public nft;

    struct WithdrawStruct {
        address creator;
        address to;
        uint256 amount;
        bool isActive;
    }

    struct SignerRequest {
        address createdBy;
        address signer;
        bool status;
        bool isActive;
    }

    struct AdminExist {
        uint256 index;
        bool status;
    }

    struct ClaimRootRequest {
        address createdBy;
        bytes32 root;
        bool isActive;
    }

    event Claimed(address indexed from, uint256 indexed amount, uint256 week);
    event UpdatedClaimList(address indexed updator, bytes32 root_);
    event ApprovedClaimList(address indexed dealer);
    event DeclinedClaimList(address indexed dealer);
    event Deposit(address indexed dealer, uint256 amount);
    event AddSigner(address indexed dealer, address indexed creator, address signer);
    event RemoveSigner(address indexed dealer, address indexed creator, address signer);
    event Withdraw(address indexed dealer, address indexed creator, address to, uint256 amount);

    address[] public admins;
    mapping(address => AdminExist) public adminsExist;
    mapping(address => mapping(uint256 => bool)) public claimed;

    address private last_creator;
    bool public frozen;
    bool private isApproved;
    bool private updatedClaimList;
    uint256 public week;

    WithdrawStruct public withdrawRequest;
    SignerRequest public signerRequest;
    ClaimRootRequest public claimRootRequest;

    modifier onlySigners() {
        require(adminsExist[msg.sender].status, "not signer");
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
        require(_owners.length > 1, "Signer is 2 at least." );
        for (uint256 i = 0; i < _owners.length; i ++) {
            admins.push(_owners[i]);
            adminsExist[_owners[i]] = AdminExist(i, true);
        }
        nft = IERC721(_nft);
    }

    // end transfer part
    function claim(uint256 index, uint256 amount, bytes32[] calldata merkleProof, uint256 _week) external onlyNFTOwner {
        require(week == _week, "claim is not available for this week");
        require(!claimed[msg.sender][week], "caller already claimed reward");
        require(!frozen && isApproved, "claim is locked");

        bytes32 node = keccak256(abi.encodePacked(index, msg.sender, amount, week));

        require(
            MerkleProof.verify(merkleProof, claimMerkleRoot, node),
            "Claim: Invalid proof."
        );

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failure! Not withdraw");

        claimed[msg.sender][week] = true;
        emit Claimed(msg.sender, amount, week);
    }

    function newClaimListRequest(bytes32 root_) external onlySigners {
        require(frozen);

        claimRootRequest = ClaimRootRequest(msg.sender, root_, true);
        
        emit UpdatedClaimList(msg.sender, root_);
    }

    function approveClaimListRequest() external onlySigners {
        require(frozen);
        require(claimRootRequest.createdBy != msg.sender, "caller is not available to approve");
        require(claimRootRequest.isActive, "request is not created");

        claimMerkleRoot = claimRootRequest.root;

        emit ApprovedClaimList(msg.sender);
    }

    function declineClaimListRequest() external onlySigners {
        require(claimRootRequest.isActive, "request is not created");

        delete claimRootRequest;

        emit DeclinedClaimList(msg.sender);
    }

    function clearClaimList() external onlySigners {
        delete claimMerkleRoot;
        frozen = false;
    }

    function freeze() external onlySigners {
        frozen = true;
    }

    function unfreeze() external onlySigners {
        frozen = false;
    }

    function deposit() external payable {
        require(msg.value > 0, "insufficient funds");
        emit Deposit(msg.sender, msg.value);
    }

    function newWithdrawRequest(address to, uint256 amount) external onlySigners {
        require(amount > 0, "withdraw amount must be greater than zero");
        require(to != address(0), "withdraw not allow to empty address");

        withdrawRequest = WithdrawStruct({
            creator: msg.sender,
            to: to,
            amount: amount,
            isActive: true
        });
    }

    function approveWithdrawRequest() external onlySigners {
        require(withdrawRequest.isActive, "withdraw is not requested");
        require(withdrawRequest.creator != msg.sender, "caller is not available to approve");

        (bool sent, ) = payable(withdrawRequest.to).call{value: withdrawRequest.amount}("");

        require(sent, "Failure! Not withdraw");

        withdrawRequest.isActive = false;
        emit Withdraw(msg.sender, withdrawRequest.creator, withdrawRequest.to, withdrawRequest.amount);
    }

    function declineWithdrawRequest() external onlySigners {
        require(withdrawRequest.isActive, "withdraw is not requested");

        withdrawRequest.isActive = false;
    }

    function increaseWeek() external onlySigners {
        week ++;
    }

    function decreaseWeek() external onlySigners {
        require(week > 0 ,"can't decrease");
        week --;
    }

     function newSignerRequest(address signer, bool status) public onlySigners {
        require(signer != msg.sender, "can't request self address");
        require(signer != address(0), "invalid address");

        if (adminsExist[signer].status == status) {
            if (status) revert("signer is already existed");
            else revert("signer is not existed");
        }

        if (!status) {
            require(admins.length > 2, "admin count is 2 at least");
        }

        signerRequest = SignerRequest({
            createdBy: msg.sender,
            signer: signer,
            isActive: true,
            status: status
        });

    }
    
    function declineSignerRequest() public onlySigners {
        require(signerRequest.isActive);
        
        signerRequest.isActive = false;
    }

    function approveSignerRequest() public onlySigners {
        require(signerRequest.isActive);
        require(signerRequest.createdBy != msg.sender, "can't approve transaction you created");
        
        address signer = signerRequest.signer;
        if (signerRequest.status) {
            admins.push(signer);
            adminsExist[signer] = AdminExist(admins.length - 1, true);
            emit AddSigner(msg.sender, signerRequest.createdBy, signer);
        } else {
            uint256 index = adminsExist[signer].index;
            if (index != admins.length - 1) {
                admins[index] = admins[admins.length -1];
                adminsExist[admins[index]].index = index;
            }
            admins.pop();
            emit RemoveSigner(msg.sender, signerRequest.createdBy, signer);
            delete adminsExist[signer];
        }

        signerRequest.isActive = false;
    }

    function getAdmins() public view returns(address[] memory) {
        return admins;
    }
}