import { redshift } from '@/api';
import { MetaMaskButton } from '@/components/partials/metamask-button';
import { getNetworkDetails, marketToOnchainTicker } from '@/lib/general';
import { RefundDetails } from '@/types';
import {
  BlockHeightUpdate,
  Network,
  RefundDetailsResponse,
  StateUpdate,
  Subnet,
  UserSwapState,
} from '@radar/redshift.js';
import { Component, Vue } from 'vue-property-decorator';
import { Route } from 'vue-router';
import WithRender from './refund.html';

Component.registerHooks(['beforeRouteEnter']);

@WithRender
@Component({
  components: {
    MetaMaskButton,
  },
})
export class Refund extends Vue {
  public refund: RefundDetails = {
    state: UserSwapState.WAITING_FOR_REFUND_TX,
    details: {} as RefundDetailsResponse,
    progress: {
      percent: 0,
      status: 'active',
    },
  };
  public prevRoute: Route | undefined = undefined;
  public blocksUntilRefundable: number | undefined = 0;
  public isLoading: boolean = true;

  beforeRouteEnter(_to: Route, from: Route, next: Function) {
    next((vm: Vue & { prevRoute: Route }) => {
      vm.prevRoute = from;
    });
  }

  async created() {
    // Establish a WebSocket connection and re-subscribe to updates if not already connected
    if (!redshift.ws.socket || !redshift.ws.socket.connected) {
      await redshift.ws.connect();
      await redshift.ws.subscribeToOrderState(this.orderId);
    }

    // Request the refund details for the failed swap
    this.refund.details = await redshift.ws.requestRefundDetails(this.orderId);
    this.blocksUntilRefundable = this.refund.details.blocksRemaining;
    this.isLoading = false;

    if (this.blocksUntilRefundable > 0) {
      // Subscribe to block height updates so we can display a refund block countdown to the user
      const { network, subnet } = getNetworkDetails(this.refund.details.market);
      await redshift.ws.subscribeToBlockHeight(network, subnet);
      redshift.ws.onBlockHeightChanged(update =>
        this.handleBlockHeightChange(update, network, subnet),
      );
    }

    // Handle the order state changed event
    redshift.ws.onOrderStateChanged(this.handleStateChange);

    // The page was refreshed. Fetch the latest swap state
    if (!this.prevRoute || !this.prevRoute.name) {
      this.handleStateChange({
        orderId: this.orderId,
        state: await redshift.http.getOrderState(this.orderId),
      });
    }
  }

  get onchainTicker() {
    if (!this.refund.details) return;
    return marketToOnchainTicker[this.refund.details.market];
  }

  get orderId() {
    return this.$route.query.orderId as string;
  }

  /**
   * The transaction state update handler
   * @param update The state update
   */
  async handleStateChange(update: StateUpdate) {
    if (update.orderId !== this.orderId) return;

    switch (update.state) {
      case UserSwapState.WAITING_FOR_REFUND_TX_CONFIRMATION: {
        this.refund.progress.percent = 50;
        break;
      }
      case UserSwapState.REFUNDED: {
        this.refund.progress.percent = 100;
        redshift.ws.disconnect(); // Swap refunded. We can close the WebSocket connection
        break;
      }
    }
    this.refund.state = update.state;
  }

  /**
   * The block height update handler
   * @param update The block height update
   * @param network The network we're listening to
   * @param subnet The subnet we're listening to
   */
  async handleBlockHeightChange(
    update: BlockHeightUpdate,
    network: Network,
    subnet: Subnet,
  ) {
    const blocks = this.refund.details.refundableAtBlockHeight - update.height;
    if (blocks > 0) {
      this.blocksUntilRefundable = blocks;
    } else {
      this.blocksUntilRefundable = 0;
      await redshift.ws.unsubscribeFromBlockHeight(network, subnet);
    }
  }

  /**
   * A helper method used to check if any of the passed states are active
   * @param states The swap states to check for
   */
  isState(...states: UserSwapState[]) {
    return states.some(s => s === this.refund.state);
  }
}
