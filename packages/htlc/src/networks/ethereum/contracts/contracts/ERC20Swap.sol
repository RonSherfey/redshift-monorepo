pragma solidity ^0.4.24;

import "./Swap.sol";
import "./ERC20Interface.sol";

contract ERC20Swap is Swap {
    enum OrderState { HasFundingBalance, Claimed, Refunded }

    struct SwapOrder {
        address user;
        address tokenContractAddress;
        bytes32 paymentHash;
        bytes32 preimage;
        uint onchainAmount;
        uint refundBlockHeight;
        OrderState state;
        bool exist;
    }
    
    mapping(bytes32 => SwapOrder) orders;

    event OrderErc20FundingReceived(
        bytes32 lninvoiceHash,
        uint onchainAmount,
        bytes32 paymentHash,
        uint refundBlockHeight,
        address tokenContractAddress
    );
    event OrderErc20Claimed(bytes32 lninvoiceHash);
    event OrderErc20Refunded(bytes32 lninvoiceHash);
    
    /**
     * Allow the sender to fund a swap in one or more transactions.
     */
    function fund(bytes32 lninvoiceHash, bytes32 paymentHash, address tokenContractAddress, uint tokenAmount) public {
        SwapOrder storage order = orders[lninvoiceHash];

        if (!order.exist) {
            order.user = msg.sender;
            order.tokenContractAddress = tokenContractAddress;
            order.exist = true;
            order.paymentHash = paymentHash;
            order.refundBlockHeight = block.number + refundDelay;
            order.state = OrderState.HasFundingBalance;
            order.onchainAmount = 0;
        } else {
            require(order.state == OrderState.HasFundingBalance, "Order already claimed or refunded.");
        }

        // one token type per order
        require(order.tokenContractAddress == tokenContractAddress, "Incorrect token.");
        // fund token to this contract
        require(ERC20Interface(tokenContractAddress).transferFrom(msg.sender, this, tokenAmount), "Unable to transfer token.");

        order.onchainAmount += tokenAmount;
            
        emit OrderErc20FundingReceived(
            lninvoiceHash,
            order.onchainAmount,
            order.paymentHash,
            order.refundBlockHeight,
            order.tokenContractAddress
        );
    }

    /**
     * Allow the recipient to claim the funds once they know the preimage of the hashlock.
     * Anyone can claim but tokens only send to owner.
     */
    function claim(address tokenContractAddress, bytes32 lninvoiceHash, bytes32 preimage) public {
        SwapOrder storage order = orders[lninvoiceHash];

        require(order.exist == true, "Order does not exist.");
        require(order.state == OrderState.HasFundingBalance, "Order cannot be claimed.");
        require(sha256(abi.encodePacked(preimage)) == order.paymentHash, "Incorrect payment preimage.");
        require(block.number <= order.refundBlockHeight, "Too late to claim.");
        
        order.preimage = preimage;
        // transfer token to owner
        ERC20Interface(tokenContractAddress).transfer(owner, order.onchainAmount);
        order.state = OrderState.Claimed;
            
        emit OrderErc20Claimed(lninvoiceHash);
    }
    
    /**
     * Refund the sent token amount back to the funder if the timelock has expired.
     */
    function refund(address tokenContractAddress, bytes32 lninvoiceHash) public {
        SwapOrder storage order = orders[lninvoiceHash];
        
        require(order.exist == true, "Order does not exist.");
        require(order.state == OrderState.HasFundingBalance, "Order cannot be refunded.");
        require(block.number > order.refundBlockHeight, "Too early to refund.");

        // transfer token to recepient        
        ERC20Interface(tokenContractAddress).transfer(order.user, order.onchainAmount);
        order.state = OrderState.Refunded;
            
        emit OrderErc20Refunded(lninvoiceHash);
    }
}
