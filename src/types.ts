export interface Order {
  chainId: number;
  exchangeAddress: string;
  makerAddress: string;
  makerAssetData: string;
  makerAssetAmount: string;
  makerFeeAssetData: string;
  makerFee: string;
  takerAddress: string;
  takerAssetData: string;
  takerAssetAmount: string;
  takerFeeAssetData: string;
  takerFee: string;
  senderAddress: string;
  feeRecipientAddress: string;
  expirationTimeSeconds: string;
  salt: string;
  signature: string;
}

export interface Stats {
  version: string;
  pubSubTopic: string;
  rendezvous: string;
  peerID: string;
  ethereumChainID: number;
  latestBlock: LatestBlock;
  numPeers: number;
  numOrders: number;
  numOrdersIncludingRemoved: number;
  startOfCurrentUTCDay: string;
  ethRPCRequestsSentInCurrentUTCDay: number;
  ethRPCRateLimitExpiredRequests: number;
  maxExpirationTime: string;
}

export interface LatestBlock {
  hash: string;
  number: string;
}

export interface OrderWithMetadata extends Order {
  hash: string;
  remainingFillableTakerAssetAmount: string;
}

export interface OrderArgs {
  hash: string;
}

export type OrderField = keyof OrderWithMetadata;

export enum FilterKind {
  Equal = "EQUAL",
  NotEqual = "NOT_EQUAL",
  Greater = "GREATER",
  GreaterOrEqual = "GREATER_OR_EQUAL",
  Less = "LESS",
  LessOrEqual = "LESS_OR_EQUAL",
}

export interface OrderFilter {
  field: OrderField;
  kind: FilterKind;
  value: number | string;
}

export enum SortDirection {
  Asc = "ASC",
  Desc = "DESC",
}

export interface OrderSort {
  field: OrderField;
  direction: SortDirection;
}

export interface OrdersArgs {
  sort: OrderSort[];
  filters: OrderFilter[];
  limit: number;
}

export interface AddOrdersArgs {
  orders: NewOrder[];
}

export interface NewOrder {
  chainId: number;
  exchangeAddress: string;
  makerAddress: string;
  makerAssetData: string;
  makerAssetAmount: string;
  makerFeeAssetData: string;
  makerFee: string;
  takerAddress: string;
  takerAssetData: string;
  takerAssetAmount: string;
  takerFeeAssetData: string;
  takerFee: string;
  senderAddress: string;
  feeRecipientAddress: string;
  expirationTimeSeconds: string;
  salt: string;
  signature: string;
}

export interface AddOrdersResults {
  accepted: AcceptedOrderResult[];
  rejected: RejectedOrderResult[];
}

export interface AcceptedOrderResult {
  order: OrderWithMetadata;
  isNew: boolean;
}

export interface RejectedOrderResult {
  orderHash?: string;
  order: Order;
  code: RejectedOrderCode;
  message: string;
}

export enum RejectedOrderCode {
  EthRPCRequestFailed = "ETH_RPC_REQUEST_FAILED",
  InvalidMakerAssetAmount = "INVALID_MAKER_ASSET_AMOUNT",
  InvalidTakerAssetAmount = "INVALID_TAKER_ASSET_AMOUNT",
  // Note(albrow): Not all codes are listed here.
}
