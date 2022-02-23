import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MetamaskService } from './metamask.service';
import { NFT8878ABI } from './nft8878.abi';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  accounts: string[] = [];
  coin: any;
  contractResult: any;
  signData = '';
  verify = '';

  to = new FormControl('', [
    Validators.required,
    Validators.pattern(/[0-9a-fA-Fx]+/),
  ]);

  amount = new FormControl('', [
    Validators.required,
    Validators.pattern(/([0-9]+)?.?([0-9]+)?[1-9]$/),
  ]);

  data = new FormControl('', [Validators.required]);

  contractInput = new FormControl('', [Validators.required]);

  constructor(
    private metamask: MetamaskService // private contract: ContractService
  ) {
    console.log(this.metamask.methodID('MAX_SUPPLY()'));
  }

  login = () => {
    this.metamask.login().subscribe((data) => (this.accounts = data));
  };

  balance = () => {
    this.metamask.balance().subscribe((data) => {
      this.coin = parseInt(data, 16);
    });
  };

  transaction = () => {
    const G = 1000000000;
    const amount = Number(this.amount.value || 0);
    if (this.amount.invalid) {
      return;
    }

    this.metamask
      .transaction(
        '0xaBff234B872b090D75E17DA7F84af5A603eF43db',
        (amount * G * G).toString(16)
      )
      .subscribe((data) => console.log(data));
  };

  contract = () => {
    const params = this.contractInput.value.toString().split(' ');
    const method = params[0];
    const args = params.slice(1);

    const abi = NFT8878ABI.filter((abi) => abi.name === method).pop();

    const vars = abi?.inputs.map((i) => i.type);
    const f = `${abi?.name}(${vars?.join(',')})`;
    const methodID = this.metamask.methodID(f);

    this.metamask
      .request('eth_call', [
        {
          from: this.accounts[0],
          to: '0x8FE290395E2242B514b36396CaEbfbccc6f72a51',
          input: methodID,
        },
      ])
      .subscribe((data) => (this.contractResult = data));
  };

  personalSign = () => {
    if (this.data.invalid) {
      return;
    }

    this.metamask.signMessage(this.data.value).subscribe((signData) => {
      this.signData = signData;

      this.verify = this.metamask.unsignMessage(this.data.value, signData)
    });
  };

  toError = (): string => {
    if (this.amount.hasError('required')) {
      return '輸入收款地址';
    }

    if (this.amount.getError('pattern')) {
      return '請輸入有效的收款地址';
    }
    return '';
  };
  amountError = (): string => {
    if (this.amount.hasError('required')) {
      return '輸入交易金額數量';
    }

    if (this.amount.getError('pattern')) {
      return '請輸入有效的數量';
    }
    return '';
  };
}
