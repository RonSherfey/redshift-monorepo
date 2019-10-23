import { redshift } from '@/api';
import { errorToHumanReadable } from '@/lib/swap';
import { SwapFormFields } from '@/types';
import {
  Market,
  MarketRequirements,
  MarketsResponse,
  validator,
} from '@radar/redshift.js';
import { notification } from 'ant-design-vue';
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { decode } from 'bolt11-decoder';
import { Component, Vue } from 'vue-property-decorator';
import WithRender from './start.html';

@WithRender
@Component
export class Start extends Vue {
  public markets: MarketsResponse = [];
  public requirements: MarketRequirements = [];
  public showRefundAddressField: boolean = false;
  public loading: boolean = false;
  public form: WrappedFormUtils;

  beforeCreate() {
    this.form = this.$form.createForm(this);
  }

  async created() {
    [this.markets, this.requirements] = await Promise.all([
      redshift.http.getMarkets(),
      redshift.http.getMarketRequirements(),
    ]);
  }

  /**
   * Validate the passed invoice
   * @param _rule The validation rule
   * @param value The input value
   * @param callback The validator callback function
   */
  validateInvoice(_rule: unknown, value: string, callback: Function) {
    try {
      decode(value);
      callback();
    } catch (error) {
      callback('Please enter a valid invoice');
    }
  }

  /**
   * Validate the passed refund address
   * @param _rule The validation rule
   * @param value The input value
   * @param callback The validator callback function
   */
  validateRefundAddress(_rule: unknown, value: string, callback: Function) {
    if (validator.isValidBase58CheckOrBech32(value)) {
      callback();
    } else {
      callback('Please enter a valid refund address');
    }
  }

  /**
   * Unlike Ethereum, UTXO swaps require a refund address
   * @param market The selected market
   */
  determineInputVisibility(market: Market) {
    this.showRefundAddressField = market.includes('BTC_');
  }

  /**
   * Initiate a swap using the values input by the user
   * @param e The submit event
   */
  initiateSwap(e: Event) {
    e.preventDefault();
    this.form.validateFields(async (err: Error[], data: SwapFormFields) => {
      if (!err) {
        try {
          this.loading = true;

          // Establish a WebSocket connection
          await redshift.ws.connect({
            transports: ['websocket'],
          });

          // Request the quote
          const quote = await redshift.ws.requestQuote({
            invoice: data.invoice,
            market: data.market,
            refundAddress: data.refundAddress,
          });

          // Quote request was successful, navigate to the payment page
          this.$router.replace({
            name: 'payment',
            query: {
              invoiceAmount: decode(data.invoice).satoshis!.toString(),
              market: data.market,
              orderId: quote.orderId,
              expiryTimestampMs: quote.expiryTimestampMs.toString(),
              amount: quote.amount,
              details: JSON.stringify(quote.details),
            },
          });
        } catch (error) {
          notification.success({
            message: 'Request Error',
            description:
              errorToHumanReadable[error.message] ||
              'An unknown error occurred',
          });
        } finally {
          this.loading = false;
        }
      }
    });
  }
}
