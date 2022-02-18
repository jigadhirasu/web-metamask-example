import { Injectable } from '@angular/core';
import { keccak_256 } from 'js-sha3';
import { from, map, Observable } from 'rxjs';

const G = 1000000000;
const ethereum = (window as any).ethereum;

export interface EthRequest {
  method: string;
  params?: any;
}

export interface ConnectInfo {
  chainId: string;
}

export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

export interface Web3WalletPermission {
  // The name of the method corresponding to the permission
  parentCapability: string;

  // The date the permission was granted, in UNIX epoch time
  date?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MetamaskService {
  accounts: string[] = [];
  chainId: string = '';

  constructor() {
    console.log(ethereum);
    console.log(ethereum.isMetaMask);
    console.log();

    this.request('eth_chainId').subscribe((chainId) => {
      console.log('chainId', chainId);
    });

    this.request('eth_accounts')
      .pipe(map((accounts) => accounts as string[]))
      .subscribe((accounts) => {
        this.accounts = accounts;
      });

    ethereum.on('connect', (cf: ConnectInfo) => {
      console.log(cf);
    });
    ethereum.on('disconnect', (err: Error) => {
      console.log(err);
    });
    ethereum.on('accountsChanged', (accounts: string[]) => {
      console.log(accounts);
    });
    ethereum.on('chainChanged', (chainId: string) => {
      console.log(chainId);
      location.reload();
    });
  }

  isConnected = (): boolean => {
    return ethereum.isConnected();
  };

  login = (): Observable<any> => {
    return this.request('eth_requestAccounts');
  };

  balance = () => {
    return this.request('eth_getBalance', [this.accounts[0], 'latest']);
  };

  transaction = (_to: string, _amount: string) => {
    return this.request('eth_sendTransaction', [
      {
        from: this.accounts[0],
        to: _to,
        value: _amount,
        gasPrice: G.toString(16),
        gas: (90000).toString(16),
      },
    ]);
  };

  request = (method: string, params?: any): Observable<any> => {
    return from(ethereum.request({ method: method, params: params }));
  };

  methodID = (f: string) => {
    return `0x${keccak_256(f).slice(0, 8)}`;
  };
}
