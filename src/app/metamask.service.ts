import { Injectable } from '@angular/core';
import { keccak_256 } from 'js-sha3';
import { from, map, Observable, single } from 'rxjs';
import { NFT8878ABI } from './nft8878.abi';

const G = 1000000000;
const ethereum = (window as any).ethereum;
const ethers = (window as any).ethers;
const provider = new ethers.providers.Web3Provider(ethereum);
const signer = provider.getSigner();

const contract = new ethers.Contract(
  '0x8FE290395E2242B514b36396CaEbfbccc6f72a51',
  NFT8878ABI,
  provider
);

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

  signMessage = (data: string): Observable<string> => {
    return from(signer.signMessage(data)).pipe(
      map((signData) => (signData || '') as string)
    );
  };

  unsignMessage = (data: string, hash: string): string => {
    console.log(signer);

    console.log(this.accounts[0]);
    return ethers.utils.verifyMessage(data, hash);
  };

  request = (method: string, params?: any): Observable<any> => {
    return from(ethereum.request({ method: method, params: params }));
  };

  methodID = (f: string) => {
    return `0x${keccak_256(f).slice(0, 8)}`;
  };
}
