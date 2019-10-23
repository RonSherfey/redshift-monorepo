import { metamask } from '@/lib/ethereum';
import { MetaMaskError } from '@/types';
import { EvmUnsignedTx, OnChainTicker } from '@radar/redshift-types';
import { decToHex } from 'hex2dec';
import { Component, Prop, Vue } from 'vue-property-decorator';
import WithRender from './metamask-button.html';

@WithRender
@Component
export class MetaMaskButton extends Vue {
  @Prop() public tx: EvmUnsignedTx;
  @Prop() public asset: OnChainTicker;
  public metamaskApproved: boolean = false;
  public metamaskNetworkCorrect: boolean = false;
  public metamaskAddress: string | undefined = '';
  public metamaskError: string | undefined = '';
  public userHasInteracted: boolean = false;

  get metamaskReady() {
    return (
      this.metamaskApproved && // The user has approved interaction with MetaMask
      this.metamaskNetworkCorrect && // The MetaMask network is correct
      this.userHasInteracted && // The user has already interacted with the button
      !this.metamaskError // There is no MetaMask error
    );
  }

  async created() {
    this.metamaskApproved = await metamask.isApproved();
    this.metamaskNetworkCorrect = metamask.isSubnetCorrect(this.asset);
    if (this.metamaskApproved && this.metamaskNetworkCorrect) {
      const [address] = await window.ethereum.enable();

      // Set the selected address
      this.metamaskAddress = address;
    }
  }

  /**
   * Call sendTransaction only if we're granted access to MetaMask
   * and the network is correct.
   */
  async connectAndSendTransaction() {
    // Clear error state
    this.metamaskError = undefined;
    this.userHasInteracted = true;

    const address = await this.connectToMetaMask();
    if (address && this.validateSubnet()) {
      this.metamaskAddress = address;
      await this.sendTransaction(address);
    }
  }

  /**
   * Attempt to connect to MetaMask and return the active address.
   * Display and error message and set approved to false if an error is thrown.
   */
  async connectToMetaMask() {
    try {
      const address = await metamask.connectAndFetchAddress();
      this.metamaskApproved = true;
      return address;
    } catch (error) {
      this.metamaskError = error.message;
      this.metamaskApproved = false;
      return false;
    }
  }

  /**
   * Validate the subnet. Display an error message if
   * an error is thrown.
   */
  validateSubnet() {
    if (!metamask.isSubnetCorrect(this.asset)) {
      this.metamaskError = MetaMaskError.WRONG_NETWORK;
      this.metamaskNetworkCorrect = false;
      return false;
    }
    this.metamaskNetworkCorrect = true;
    return true;
  }

  /**
   * Call eth_sendTransaction. Display an error message if
   * an error is thrown.
   * @param address The active address
   */
  async sendTransaction(address: string) {
    try {
      const { data, to, value } = this.tx;
      await metamask.sendTransaction({
        data,
        to,
        value: value ? decToHex(value as string) : undefined,
        from: address,
      });
    } catch (error) {
      this.metamaskError = error.message;
    }
  }
}
