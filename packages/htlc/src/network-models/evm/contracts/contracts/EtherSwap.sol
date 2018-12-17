pragma solidity ^0.4.24;

import "./Swap.sol";

contract EtherSwap is Swap {
    enum OrderState { HasFundingBalance, Claimed, Refunded }

    struct SwapOrder {
        address user;
        bytes32 paymentHash;
        bytes32 preimage;
        uint onchainAmount;
        uint refundBlockHeight;
        OrderState state;
        bool exist;
    }
    
    mapping(bytes32 => SwapOrder) orders;

    event OrderFundingReceived(bytes32 lninvoiceHash, uint onchainAmount, bytes32 paymentHash, uint refundBlockHeight);
    event OrderClaimed(bytes32 lninvoiceHash);
    event OrderRefunded(bytes32 lninvoiceHash);
    
    /**
     * Allow the sender to fund a swap in one or more transactions.
     */
    function fund(bytes32 lninvoiceHash, bytes32 paymentHash) public payable {
        SwapOrder storage order = orders[lninvoiceHash];

        if (!order.exist) {
            order.user = msg.sender;
            order.exist = true;
            order.paymentHash = paymentHash;
            order.refundBlockHeight = block.number + refundDelay;
            order.state = OrderState.HasFundingBalance;
            order.onchainAmount = 0;
        } else {
            require(order.state == OrderState.HasFundingBalance, "Order already claimed or refunded.");
        }
        order.onchainAmount += msg.value;
            
        emit OrderFundingReceived(lninvoiceHash, order.onchainAmount, order.paymentHash, order.refundBlockHeight);
    }

    /**
     * Allow the recipient to claim the funds once they know the preimage of the hashlock.
     * Anyone can claim but tokens only send to owner.
     */
    function claim(bytes32 lninvoiceHash, bytes32 preimage) public {
        SwapOrder storage order = orders[lninvoiceHash];

        require(order.exist == true, "Order does not exist.");
        require(order.state == OrderState.HasFundingBalance, "Order cannot be claimed.");
        require(sha256(abi.encodePacked(preimage)) == order.paymentHash, "Incorrect payment preimage.");
        require(block.number <= order.refundBlockHeight, "Too late to claim.");
        
        order.preimage = preimage;
        owner.transfer(order.onchainAmount);
        order.state = OrderState.Claimed;
            
        emit OrderClaimed(lninvoiceHash);
    }
    
    /**
     * Refund the sent amount back to the funder if the timelock has expired.
     */
    function refund(bytes32 lninvoiceHash) public {
        SwapOrder storage order = orders[lninvoiceHash];
        
        require(order.exist == true, "Order does not exist.");
        require(order.state == OrderState.HasFundingBalance, "Order cannot be refunded.");
        require(block.number > order.refundBlockHeight, "Too early to refund.");
        
        order.user.transfer(order.onchainAmount);
        order.state = OrderState.Refunded;
            
        emit OrderRefunded(lninvoiceHash);
    }
}
