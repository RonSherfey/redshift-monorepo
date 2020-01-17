pragma solidity ^0.6.1;
pragma experimental ABIEncoderV2;

import "./Swap.sol";
import "./IERC20.sol";

contract ERC20Swap is Swap {
    enum OrderState { HasFundingBalance, Claimed, Refunded }

    struct FundDetails {
        bytes16 orderUUID;
        bytes32 paymentHash;
        address tokenContractAddress;
        uint256 tokenAmount;
    }
    struct FundDetailsWithAdminRefundEnabled {
        bytes16 orderUUID;
        bytes32 paymentHash;
        address tokenContractAddress;
        uint256 tokenAmount;
        bytes32 refundHash;
    }
    struct ClaimDetails {
        bytes16 orderUUID;
        bytes32 paymentPreimage;
    }
    struct AdminRefundDetails {
        bytes16 orderUUID;
        bytes32 refundPreimage;
    }
    struct SwapOrder {
        address user;
        address tokenContractAddress;
        bytes32 paymentHash;
        bytes32 refundHash;
        uint256 onchainAmount;
        uint256 refundBlockHeight;
        OrderState state;
        bool exist;
    }

    mapping(bytes16 => SwapOrder) orders;

    event OrderFundingReceived(
        bytes16 orderUUID,
        uint256 onchainAmount,
        bytes32 paymentHash,
        uint256 refundBlockHeight,
        address tokenContractAddress
    );
    event OrderFundingReceivedWithAdminRefundEnabled(
        bytes16 orderUUID,
        uint256 onchainAmount,
        bytes32 paymentHash,
        uint256 refundBlockHeight,
        address tokenContractAddress,
        bytes32 refundHash
    );
    event OrderClaimed(bytes16 orderUUID);
    event OrderRefunded(bytes16 orderUUID);
    event OrderAdminRefunded(bytes16 orderUUID);

    /**
     * Delete the order data that is no longer necessary after a swap is claimed or refunded.
     */
    function deleteUnnecessaryOrderData(SwapOrder storage order) internal {
        delete order.user;
        delete order.tokenContractAddress;
        delete order.paymentHash;
        delete order.onchainAmount;
        delete order.refundBlockHeight;
    }

    /**
     * Allow the sender to fund a swap in one or more transactions.
     */
    function fund(FundDetails memory details) public {
        SwapOrder storage order = orders[details.orderUUID];

        if (!order.exist) {
            order.user = msg.sender;
            order.tokenContractAddress = details.tokenContractAddress;
            order.exist = true;
            order.paymentHash = details.paymentHash;
            order.refundBlockHeight = block.number + refundDelay;
            order.state = OrderState.HasFundingBalance;
        } else {
            require(order.state == OrderState.HasFundingBalance, "Order already claimed or refunded.");
            require(order.tokenContractAddress == details.tokenContractAddress, "Incorrect token.");
        }

        // Fund token to this contract
        require(
            IERC20(details.tokenContractAddress)
                .transferFrom(msg.sender, address(this), details.tokenAmount), "Unable to transfer token."
        );
        order.onchainAmount += details.tokenAmount;

        emit OrderFundingReceived(
            details.orderUUID,
            order.onchainAmount,
            order.paymentHash,
            order.refundBlockHeight,
            order.tokenContractAddress
        );
    }

    /**
     * Allow the sender to fund a swap in one or more transactions and provide a refund
     * hash, which can enable faster refunds if the refund preimage is supplied by the
     * counterparty once it's decided that a claim transaction will not be submitted.
     */
    function fundWithAdminRefundEnabled(FundDetailsWithAdminRefundEnabled memory details) public {
        SwapOrder storage order = orders[details.orderUUID];

        if (!order.exist) {
            order.user = msg.sender;
            order.tokenContractAddress = details.tokenContractAddress;
            order.exist = true;
            order.paymentHash = details.paymentHash;
            order.refundHash = details.refundHash;
            order.refundBlockHeight = block.number + refundDelay;
            order.state = OrderState.HasFundingBalance;
        } else {
            require(order.state == OrderState.HasFundingBalance, "Order already claimed or refunded.");
            require(order.tokenContractAddress == details.tokenContractAddress, "Incorrect token.");
        }

        // Fund token to this contract
        require(
            IERC20(details.tokenContractAddress)
                .transferFrom(msg.sender, address(this), details.tokenAmount), "Unable to transfer token."
        );
        order.onchainAmount += details.tokenAmount;

        emit OrderFundingReceivedWithAdminRefundEnabled(
            details.orderUUID,
            order.onchainAmount,
            order.paymentHash,
            order.refundBlockHeight,
            order.tokenContractAddress,
            order.refundHash
        );
    }

    /**
     * Allow the recipient to claim the funds once they know the preimage of the hashlock.
     * Anyone can claim, but the tokens will always be sent to the owner.
     */
    function claim(ClaimDetails memory details) public {
        SwapOrder storage order = orders[details.orderUUID];

        require(order.exist == true, "Order does not exist.");
        require(order.state == OrderState.HasFundingBalance, "Order not in claimable state.");
        require(sha256(abi.encodePacked(details.paymentPreimage)) == order.paymentHash, "Incorrect payment preimage.");
        require(block.number <= order.refundBlockHeight, "Too late to claim.");

        order.state = OrderState.Claimed;

        // Transfer tokens to the contract owner
        require(
            IERC20(order.tokenContractAddress)
                .transfer(owner, order.onchainAmount), "Unable to transfer token."
        );

        deleteUnnecessaryOrderData(order);
        emit OrderClaimed(details.orderUUID);
    }

    /**
     * Refund the sent token amount back to the funder if the timelock has expired.
     */
    function refund(bytes16 orderUUID) public {
        SwapOrder storage order = orders[orderUUID];

        require(order.exist == true, "Order does not exist.");
        require(order.state == OrderState.HasFundingBalance, "Order not in refundable state.");
        require(block.number > order.refundBlockHeight, "Too early to refund.");

        order.state = OrderState.Refunded;

        // Transfer tokens back to the original funder
        require(
            IERC20(order.tokenContractAddress)
                .transfer(order.user, order.onchainAmount), "Unable to transfer token."
        );

        deleteUnnecessaryOrderData(order);
        emit OrderRefunded(orderUUID);
    }

    /**
     * Refund the sent token amount back to the funder if a valid refund preimage is supplied.
     * This provides a better UX than a timelocked refund. It is entirely at the discretion
     * of the entity on the opposite side of the swap as to whether the refund preimage will
     * be provided to the funder, but is recommended once it's decided that a claim transaction
     * will not be submitted.
     */
    function adminRefund(AdminRefundDetails memory details) public {
        SwapOrder storage order = orders[details.orderUUID];

        require(order.exist == true, "Order does not exist.");
        require(order.state == OrderState.HasFundingBalance, "Order not in refundable state.");
        require(order.refundHash != 0, "Admin refund not allowed.");
        require(sha256(abi.encodePacked(details.refundPreimage)) == order.refundHash, "Incorrect refund preimage.");

        order.state = OrderState.Refunded;

        // Transfer tokens back to the original funder
        require(
            IERC20(order.tokenContractAddress)
                .transfer(order.user, order.onchainAmount), "Unable to transfer token."
        );

        deleteUnnecessaryOrderData(order);
        emit OrderAdminRefunded(details.orderUUID);
    }

    /**
     * Allow the sender to fund multiple swaps in one or more transactions.
     */
    function batchFund(FundDetails[] calldata details) external {
        for (uint256 i = 0; i < details.length; i++) {
            fund(details[i]);
        }
    }

    /**
     * Allow the sender to fund multiple swaps in one or more transactions and
     * provide a refund hashes, which can enable faster refunds if the refund preimage is supplied.
     */
    function batchFundWithAdminRefundEnabled(FundDetailsWithAdminRefundEnabled[] calldata details) external {
        for (uint256 i = 0; i < details.length; i++) {
            fundWithAdminRefundEnabled(details[i]);
        }
    }

    /**
     * Allow the recipient to claim the funds for multiple swaps once they know the preimage of the hashlock.
     * Anyone can claim, but the tokens will always be sent to the owner.
     */
    function batchClaim(ClaimDetails[] calldata details) external {
        for (uint256 i = 0; i < details.length; i++) {
            claim(details[i]);
        }
    }

    /**
     * Refund the sent token amounts back to the funders if the timelocks have expired.
     */
    function batchRefund(bytes16[] calldata orderUUIDs) external {
        for (uint256 i = 0; i < orderUUIDs.length; i++) {
            refund(orderUUIDs[i]);
        }
    }

    /**
     * Refund the sent token amounts back to the funder if a valid refund preimage is supplied.
     * This provides a better UX than a timelocked refund. It is entirely at the discretion
     * of the entity on the opposite side of the swap as to whether the refund preimage will
     * be provided to the funder, but is recommended once it's decided that a claim transaction
     * will not be submitted.
     */
    function batchAdminRefund(AdminRefundDetails[] calldata details) external {
        for (uint256 i = 0; i < details.length; i++) {
            adminRefund(details[i]);
        }
    }
}
