import { redshift } from '@/api';
import { MetaMaskButton } from '@/components/partials/metamask-button';
import { marketToOffchainTicker, marketToOnchainTicker } from '@/lib/swap';
import { SwapDetails } from '@/types';
import {
  StateUpdate,
  SwapCompleteStateUpdate,
  UserSwapState,
} from '@radar/redshift.js';
import BigNumber from 'bignumber.js';
import { Component, Vue } from 'vue-property-decorator';
import { Route } from 'vue-router';
import WithRender from './payment.html';

Component.registerHooks(['beforeRouteEnter']);

@WithRender
@Component({
  components: {
    MetaMaskButton,
  },
})
export class Payment extends Vue {
  public swap: SwapDetails = {
    state: UserSwapState.WAITING_FOR_FUNDING_TX,
    progress: {
      percent: 0,
      status: 'active',
    },
  };
  public prevRoute: Route = {} as Route;

  beforeRouteEnter(_to: Route, from: Route, next: Function) {
    next((vm: Vue & { prevRoute: Route }) => {
      vm.prevRoute = from;
    });
  }

  async created() {
    // Establish a WebSocket connection if not already connected
    if (!redshift.ws.socket || !redshift.ws.socket.connected) {
      await redshift.ws.connect();
    }

    // Subscribe to order state updates
    await redshift.ws.subscribeToOrderState(this.orderId);

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
    return marketToOnchainTicker[this.$route.query.market as string];
  }

  get offchainTicker() {
    return marketToOffchainTicker[this.$route.query.market as string];
  }

  get orderId() {
    return this.$route.query.orderId as string;
  }

  get expiryTimestampMs() {
    return Number(this.$route.query.expiryTimestampMs);
  }

  get amount() {
    return new BigNumber(this.$route.query.amount as string).toString(); // Convert to BigNumber to remove trailing 0's
  }

  get invoiceAmount() {
    return this.$route.query.invoiceAmount;
  }

  get paymentDetails() {
    return JSON.parse(this.$route.query.details as string);
  }

  /**
   * The transaction state update handler
   * @param update The state update
   */
  async handleStateChange(update: StateUpdate) {
    if (update.orderId !== this.orderId) return;

    switch (update.state) {
      case UserSwapState.WAITING_FOR_FUNDING_TX_CONFIRMATION:
      case UserSwapState.WAITING_FOR_ADDITIONAL_FUNDING_TX_CONFIRMATION:
        this.swap.progress.percent = 50;
        break;
      case UserSwapState.PARTIALLY_FUNDED:
        this.swap.progress.percent = 75;
        break;
      case UserSwapState.FUNDED:
        this.swap.progress.percent = 90;
        break;
      case UserSwapState.COMPLETE:
        this.swap.progress.percent = 100;
        this.swap.preimage = (update as SwapCompleteStateUpdate).preimage;
        break;
      case UserSwapState.WAITING_FOR_REFUND_TX:
      case UserSwapState.ADDRESS_BLACKLISTED_WAITING_FOR_REFUND_TX:
        this.swap.progress.status = 'exception'; // TODO: Write refund flow example
        break;
      case UserSwapState.FUND_WINDOW_ELAPSED:
        break;
    }
    this.swap.state = update.state;
  }

  /**
   * A helper method used to check if any of the passed states are active
   * @param states The swap states to check for
   */
  isState(...states: UserSwapState[]) {
    return states.some(s => s === this.swap.state);
  }
}
