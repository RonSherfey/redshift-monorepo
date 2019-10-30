import { redshift } from '@/api';
import { errorToHumanReadable } from '@/lib/general';
import { SwapFormFields } from '@/types';
import {
  ApiError,
  Market,
  MarketRequirements,
  MarketsResponse,
  validator,
} from '@radar/redshift.js';
import { notification } from 'ant-design-vue';
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { decode, PaymentRequestObject } from 'bolt11-decoder';
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
   * The invoice field validator
   * @param _rule The validation rule
   * @param value The input value
   * @param callback The validator callback function
   */
  invoiceValidator(_rule: unknown, value: string, callback: Function) {
    if (!value) {
      callback('Please enter an invoice');
    } else if (!this.isValidInvoice(value).isValid) {
      callback('Please enter a valid invoice');
    } else {
      callback();
    }
  }

  /**
   * The market field validator
   * @param _rule The validation rule
   * @param value The input value
   * @param callback The validator callback function
   */
  marketValidator(_rule: unknown, value: string, callback: Function) {
    if (!value) {
      callback('Please select an asset to pay with');
    } else if (value.includes('BTC_')) {
      callback('Bitcoin demo not implemented');
    } else {
      callback();
    }
  }

  /**
   * The refund address field validator
   * @param _rule The validation rule
   * @param value The input value
   * @param callback The validator callback function
   */
  refundAddressValidator(_rule: unknown, value: string, callback: Function) {
    if (!value) {
      callback('Please enter a refund address');
    } else if (!validator.isValidBase58CheckOrBech32(value)) {
      callback('Please enter a valid refund address');
    } else {
      callback();
    }
  }

  /**
   * Validate the passed invoice. If valid, return the decoded invoice
   * @param invoice The bolt11 invoice
   */
  isValidInvoice(invoice: string) {
    try {
      const decodedInvoice = decode(invoice);
      return {
        decodedInvoice,
        isValid: true,
      };
    } catch (error) {
      return {
        isValid: false,
      };
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
   * Check if the invoice meets the requirements for the passed market
   * @param decodedInvoice The decoded payment request
   * @param market The market
   */
  marketRequirementsSatisfied(
    decodedInvoice: PaymentRequestObject,
    market: Market,
  ) {
    // Check that we have all information required to validate
    if (this.requirements) {
      const { payReq } = this.requirements.find(r => r.market === market) || {};

      if (payReq) {
        const { minExpirationSeconds, minBaseUnits, maxBaseUnits } = payReq;
        const expiry = new Date(decodedInvoice.timeExpireDateString);
        const secondsUntilExpiry = (expiry.getTime() - Date.now()) / 1000;

        let error: ApiError | undefined = undefined;
        if (secondsUntilExpiry < Number(minExpirationSeconds)) {
          // Ensure invoice expiry is greater than mimumim
          error = ApiError.INVOICE_EXPIRES_TOO_SOON;
        } else if (decodedInvoice.satoshis < Number(minBaseUnits)) {
          // Ensure invoice amount is greater than mimumim
          error = ApiError.INVOICE_AMOUNT_BELOW_MINIMUM;
        } else if (decodedInvoice.satoshis > Number(maxBaseUnits)) {
          // Ensure invoice amount is less than maximum
          error = ApiError.INVOICE_AMOUNT_ABOVE_MAXIMUM;
        }

        if (error) {
          this.form.setFields({
            invoice: {
              value: decodedInvoice.paymentRequest,
              errors: [new Error(errorToHumanReadable[error])],
            },
          });
          return false;
        }
        return true;
      }
    }
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

          // Ensure the invoice meets the market requirements
          const decodedInvoice = decode(data.invoice);
          const invoiceMeetsRequirements = this.marketRequirementsSatisfied(
            decodedInvoice,
            data.market,
          );
          if (!invoiceMeetsRequirements) return;

          // Establish a WebSocket connection
          await redshift.ws.connect();

          // Request the quote
          const quote = await redshift.ws.requestQuote({
            invoice: data.invoice,
            market: data.market,
            refundAddress: data.refundAddress, // Used for bitcoin only
          });

          // Quote request was successful, navigate to the payment page
          this.$router.replace({
            name: 'payment',
            query: {
              invoiceAmount: decodedInvoice.satoshis.toString(),
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
