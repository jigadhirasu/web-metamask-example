import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MetamaskService } from './metamask.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  accounts: string[] = [];
  coin: any;

  to = new FormControl('', [
    Validators.required,
    Validators.pattern(/[0-9a-fA-Fx]+/),
  ]);

  amount = new FormControl('', [
    Validators.required,
    Validators.pattern(/([0-9]+)?.?([0-9]+)?[1-9]$/),
  ]);

  constructor(private metamask: MetamaskService) {}

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
