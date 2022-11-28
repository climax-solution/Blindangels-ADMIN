// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlindAngelOutboundTreasury is Ownable {
    
    event Transfer(address indexed createdBy, address indexed dealedBy, address to, uint256 value);
    event Deposit(address indexed dealer, uint256 amount);
    event Withdraw(address indexed dealer, address indexed creator, address to, uint256 amount);
    event AddSigner(address indexed dealer, address indexed creator, address signer);
    event RemoveSigner(address indexed dealer, address indexed creator, address signer);

    struct TransferRequest {
        bool isActive;
        address createdBy;
        address to;
        uint256 value;
        uint256 created_at;
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

    struct WithdrawStruct {
        address creator;
        address to;
        uint256 amount;
        bool isActive;
    }

    TransferRequest public transferRequest;
    SignerRequest public signerRequest;
    WithdrawStruct public withdrawRequest;

    address[] private admins;
    mapping(address => AdminExist) public adminsExist;

    modifier onlySigners() {
        require(adminsExist[msg.sender].status, "not signer");
        _;
    }
    
    constructor(
        address[] memory _owners
    ) {
        require(_owners.length > 1, "Signer is 2 at least." );
        for (uint256 i = 0; i < _owners.length; i ++) {
            admins.push(_owners[i]);
            adminsExist[_owners[i]] = AdminExist(i, true);
        }
    }

    // start transfer part
    
    function newTransferRequest(address to, uint256 value) public onlySigners {
        transferRequest = TransferRequest({
            to: to,
            value: value,
            isActive: true,
            createdBy: msg.sender,
            created_at: block.timestamp
        });
        
    }
    
    function declineTransferRequest() public onlySigners {
        require(transferRequest.isActive);
        
        transferRequest.isActive = false;
    }

    function approveTransferRequest() public onlySigners {
        require(transferRequest.isActive);
        require(transferRequest.createdBy != msg.sender, "can't approve transaction you created");
        
        (bool sent, ) = payable(transferRequest.to).call{value: transferRequest.value}("");

        require(sent, "Failure! Not withdraw");

        transferRequest.isActive = false;
        emit Transfer(transferRequest.createdBy, msg.sender, transferRequest.to, transferRequest.value);
    }

    // end transfer part

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

    function deposit() external payable {
        require(msg.value > 0, "insufficient funds");
        emit Deposit(msg.sender, msg.value);
    }

    function getAdmins() public view returns(address[] memory) {
        return admins;
    }

    receive() external payable {}
    
}