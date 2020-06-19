import { gql } from "apollo-server";

export const typeDefs = gql`
  """
  A 32-byte Keccak256 hash encoded as a hexadecimal string.
  """
  scalar Hash
  """
  An Ethereum address encoded as a hexadecimal string.
  """
  scalar Address
  """
  A BigNumber or uint256 value encoded as a numerical string.
  """
  scalar BigNumber
  """
  An array of arbitrary bytes encoded as a hexadecimal string.
  """
  scalar Bytes
  """
  A time encoded as a string using the RFC3339 standard.
  """
  scalar Timestamp
  """
  An arbitrary set of key-value pairs. Encoded as a JSON object.
  """
  scalar Object

  """
  A signed 0x order according to the [protocol specification](https://github.com/0xProject/0x-protocol-specification/blob/master/v3/v3-specification.md#order-message-format.)
  """
  type Order {
    chainId: Int!
    exchangeAddress: Address!
    makerAddress: Address!
    makerAssetData: Bytes!
    makerAssetAmount: BigNumber!
    makerFeeAssetData: Bytes!
    makerFee: BigNumber!
    takerAddress: Address!
    takerAssetData: Bytes!
    takerAssetAmount: BigNumber!
    takerFeeAssetData: Bytes!
    takerFee: BigNumber!
    senderAddress: Address!
    feeRecipientAddress: Address!
    expirationTimeSeconds: BigNumber!
    salt: BigNumber!
    signature: Bytes!
  }

  """
  A signed 0x order along with some additional metaddata about an order which is not part of the 0x protocol specification.
  """
  type OrderWithMetadata {
    chainId: Int!
    exchangeAddress: Address!
    makerAddress: Address!
    makerAssetData: Bytes!
    makerAssetAmount: BigNumber!
    makerFeeAssetData: Bytes!
    makerFee: BigNumber!
    takerAddress: Address!
    takerAssetData: Bytes!
    takerAssetAmount: BigNumber!
    takerFeeAssetData: Bytes!
    takerFee: BigNumber!
    senderAddress: Address!
    feeRecipientAddress: Address!
    expirationTimeSeconds: BigNumber!
    salt: BigNumber!
    signature: Bytes!
    """
    The hash, which can be used to uniquely identify an order.
    """
    hash: Hash!
    """
    The remaining amount of the maker asset which has not yet been filled.
    """
    remainingFillableTakerAssetAmount: BigNumber!
  }

  """
  An enum containing all the order fields for which filters and/or sorting is supported.
  """
  enum OrderField {
    hash
    chainId
    exchangeAddress
    makerAddress
    makerAssetData
    makerAssetAmount
    makerFeeAssetData
    makerFee
    takerAddress
    takerAssetData
    takerAssetAmount
    takerFeeAssetData
    takerFee
    senderAddress
    feeRecipientAddress
    expirationTimeSeconds
    salt
    remainingFillableTakerAssetAmount
  }

  """
  The kind of comparison to be used in a filter.
  """
  enum FilterKind {
    EQUAL
    NOT_EQUAL
    GREATER
    GREATER_OR_EQUAL
    LESS
    LESS_OR_EQUAL
  }

  """
  The direction to sort in. Ascending means lowest to highest. Descending means highest to lowest.
  """
  enum SortDirection {
    ASC
    DESC
  }

  """
  The value to filter with. Must be the same type as the field you are filtering by.
  """
  scalar FilterValue

  """
  A filter on orders. Can be used in queries to only return orders that meet certain criteria.
  """
  input OrderFilter {
    field: OrderField
    kind: FilterKind
    value: FilterValue
  }

  """
  A sort ordering for orders. Can be used in queries to control the order in which results are returned.
  """
  input OrderSort {
    field: OrderField
    direction: SortDirection
  }

  """
  The block number and block hash for the latest block that has been processed by Mesh.
  """
  type LatestBlock {
    number: BigNumber
    hash: Hash
  }

  """
  Contains configuration options and various stats for Mesh.
  """
  type Stats {
    version: String
    pubSubTopic: String
    rendezvous: String
    peerID: String
    ethereumChainID: Int
    latestBlock: LatestBlock
    numPeers: Int
    numOrders: Int
    numOrdersIncludingRemoved: Int
    startOfCurrentUTCDay: Timestamp
    ethRPCRequestsSentInCurrentUTCDay: Int
    ethRPCRateLimitExpiredRequests: Int
    maxExpirationTime: BigNumber
  }

  type Query {
    """
    Returns the order with the specified hash, or null if no order is found with that hash.
    """
    order(hash: Hash!): OrderWithMetadata
    """
    Returns an array of orders that satisfy certain criteria.
    """
    orders(
      """
      Determines the order of the results. If more than one sort option is provided, results we be sorted by the
      first option first, then by any subsequent options. By default, orders are sorted by hash in ascending order.
      """
      sort: [OrderSort!] = [{ field: hash, direction: ASC }]
      """
      A set of filters. Only the orders that match all filters will be included in the results. By default no
      filters are used.
      """
      filters: [OrderFilter!] = []
      """
      The maximum number of orders to be included in the results. Defaults to 20.
      """
      limit: Int = 20
    ): [OrderWithMetadata!]!
    """
    Returns the current stats.
    """
    stats: Stats
  }

  """
  A signed 0x order according to the [protocol specification](https://github.com/0xProject/0x-protocol-specification/blob/master/v3/v3-specification.md#order-message-format).
  """
  input NewOrder {
    chainId: Int!
    exchangeAddress: Address!
    makerAddress: Address!
    makerAssetData: Bytes!
    makerAssetAmount: BigNumber!
    makerFeeAssetData: Bytes!
    makerFee: BigNumber!
    takerAddress: Address!
    takerAssetData: Bytes!
    takerAssetAmount: BigNumber!
    takerFeeAssetData: Bytes!
    takerFee: BigNumber!
    senderAddress: Address!
    feeRecipientAddress: Address!
    expirationTimeSeconds: BigNumber!
    salt: BigNumber!
    signature: Bytes!
  }

  """
  The results of the addOrders mutation. Includes which orders were accepted and which orders where rejected.
  """
  type AddOrdersResults {
    accepted: [AcceptedOrderResult!]!
    rejected: [RejectedOrderResult!]!
  }

  type AcceptedOrderResult {
    """
    The order that was accepted, including metadata.
    """
    order: OrderWithMetadata!
    """
    Whether or not the order is new. Set to true if this is the first time this Mesh node has accepted the order
    and false otherwise.
    """
    isNew: Boolean!
  }

  type RejectedOrderResult {
    """
    The hash of the order. May be null if the hash could not be computed.
    """
    hash: Hash!
    """
    The order that was rejected.
    """
    order: Order!
    """
    A machine-readable code indicating why the order was rejected. This code is designed to
    be used by programs and applications and will never change without breaking backwards-compatibility.
    """
    code: RejectedOrderCode!
    """
    A human-readable message indicating why the order was rejected. This message may change
    in future releases and is not covered by backwards-compatibility guarantees.
    """
    message: String!
  }

  """
  A set of all possible codes included in RejectedOrderResult. Note that more codes will be added
  to the final spec. See the [current Mesh docs](https://godoc.org/github.com/0xProject/0x-mesh/zeroex/ordervalidator#pkg-variables)
  for a list of all codes currently in use.
  """
  enum RejectedOrderCode {
    ETH_RPC_REQUEST_FAILED
    INVALID_MAKER_ASSET_AMOUNT
    INVALID_TAKER_ASSET_AMOUNT
  }

  type Mutation {
    """
    Used to add one or more new orders to Mesh.
    """
    addOrders(orders: [NewOrder!]!, pinned: Boolean = true): AddOrdersResults!
  }

  type OrderEvent {
    """
    The order that was affected.
    """
    order: OrderWithMetadata!
    """
    A way of classifying the effect that the order event had on the order. You can
    think of this as different "types" of order events.
    """
    endState: OrderEndState!
    """
    The timestamp for the order event, which can be used for bookkeeping purposes.
    If the order event was generated as a direct result of on-chain events (e.g., FILLED,
    UNFUNDED, CANCELED), then it is set to the latest block timestamp at which the order
    was re-validated. Otherwise (e.g., for ADDED, STOPPED_WATCHING), the timestamp corresponds
    when the event was generated on the server side.
    """
    timestamp: Timestamp!
    """
    Contains all the contract events that triggered the order to be re-validated.
    All events that _may_ have affected the state of the order are included here.
    It is gauranteed that at least one of the events included here will have affected
    the order's state, but there may also be some false positives.
    """
    contractEvents: [ContractEvent!]!
  }

  enum OrderEndState {
    """
    The order was successfully validated and added to the Mesh node. The order is now being watched and any changes to
    the fillability will result in subsequent order events.
    """
    ADDED
    """
    The order was filled for a partial amount. The order is still fillable up to the remainingFillableTakerAssetAmount.
    """
    FILLED
    """
    The order was fully filled and its remaining fillableTakerAssetAmount is 0. The order is no longer fillable.
    """
    FULLY_FILLED
    """
    The order was cancelled and is no longer fillable.
    """
    CANCELLED
    """
    The order expired and is no longer fillable.
    """
    EXPIRED
    """
    The order was previously expired, but due to a block re-org it is no longer considered expired (should be rare).
    """
    UNEXPIRED
    """
    The order has become unfunded and is no longer fillable. This can happen if the maker makes a transfer or changes their allowance.
    """
    UNFUNDED
    """
    The fillability of the order has increased. This can happen if a previously processed fill event gets reverted due to a block re-org,
    or if a maker makes a transfer or changes their allowance.
    """
    FILLABILITY_INCREASED
    """
    The order is potentially still valid but was removed for a different reason (e.g.
    the database is full or the peer that sent the order was misbehaving). The order will no longer be watched
    and no further events for this order will be emitted. In some cases, the order may be re-added in the
    future.
    """
    STOPPED_WATCHING
  }

  type ContractEvent {
    blockHash: Hash!
    txHash: Hash!
    txIndex: Int!
    logIndex: Int!
    isRemoved: Boolean!
    address: Address!
    kind: String!
    parameters: Object!
  }

  type Subscription {
    orderEvents: [OrderEvent!]!
  }
`;
