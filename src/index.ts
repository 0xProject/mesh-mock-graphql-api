import { ApolloServer, gql } from "apollo-server";
import * as R from "ramda";

const typeDefs = gql`
  """
  A 32-byte Keccak256 hash encoded as a hexidecimal string.
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
`;

interface Order {
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

interface OrderWithMetadata extends Order {
  hash: string;
  remainingFillableTakerAssetAmount: string;
}

interface OrderArgs {
  hash: String;
}

type OrderField = keyof OrderWithMetadata;

enum FilterKind {
  Equal = "EQUAL",
  NotEqual = "NOT_EQUAL",
  Greater = "GREATER",
  GreaterOrEqual = "GREATER_OR_EQUAL",
  Less = "LESS",
  LessOrEqual = "LESS_OR_EQUAL",
}

interface OrderFilter {
  field: OrderField;
  kind: FilterKind;
  value: number | string;
}

enum SortDirection {
  Asc = "ASC",
  Desc = "DESC",
}

interface OrderSort {
  field: OrderField;
  direction: SortDirection;
}

interface OrdersArgs {
  sort: OrderSort[];
  filters: OrderFilter[];
  limit: number;
}

interface AddOrdersArgs {
  orders: NewOrder[];
}

interface NewOrder {
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

interface AddOrdersResults {
  accepted: AcceptedOrderResult[];
  rejected: RejectedOrderResult[];
}

interface AcceptedOrderResult {
  order: OrderWithMetadata;
  isNew: boolean;
}

interface RejectedOrderResult {
  orderHash?: string;
  order: Order;
  code: RejectedOrderCode;
  message: string;
}

enum RejectedOrderCode {
  EthRPCRequestFailed = "ETH_RPC_REQUEST_FAILED",
  InvalidMakerAssetAmount = "INVALID_MAKER_ASSET_AMOUNT",
  InvalidTakerAssetAmount = "INVALID_TAKER_ASSET_AMOUNT",
  // Note(albrow): Not all codes are listed here.
}

const resolvers = {
  Query: {
    order: orderResolver,
    orders: ordersResolver,
  },
  Mutation: {
    addOrders: addOrdersResolver,
  },
};

function orderResolver(_: any, args: OrderArgs): OrderWithMetadata | undefined {
  return R.find(R.propEq("hash", args.hash), mockOrders);
}

function ordersResolver(_: any, args: OrdersArgs): OrderWithMetadata[] {
  const filters = args.filters.map((filter: OrderFilter) => {
    switch (filter.kind) {
      case FilterKind.Equal:
        return (order: OrderWithMetadata) =>
          order[filter.field] === filter.value;
      case FilterKind.NotEqual:
        return (order: OrderWithMetadata) =>
          order[filter.field] !== filter.value;
      case FilterKind.Greater:
        return (order: OrderWithMetadata) => order[filter.field] > filter.value;
      case FilterKind.GreaterOrEqual:
        return (order: OrderWithMetadata) =>
          order[filter.field] >= filter.value;
      case FilterKind.Less:
        return (order: OrderWithMetadata) => order[filter.field] < filter.value;
      case FilterKind.LessOrEqual:
        return (order: OrderWithMetadata) =>
          order[filter.field] <= filter.value;
      default:
        throw new Error(`unexpected filter kind: ${filter.kind}`);
    }
  });
  const sorters = args.sort.map((sort: OrderSort) => {
    switch (sort.direction) {
      case SortDirection.Asc:
        return R.ascend((order: OrderWithMetadata) => order[sort.field]);
      case SortDirection.Desc:
        return R.descend((order: OrderWithMetadata) => order[sort.field]);
      default:
        throw new Error(`unexpected sort direction: ${sort.direction}`);
    }
  });
  return R.pipe<
    OrderWithMetadata[],
    OrderWithMetadata[],
    OrderWithMetadata[],
    OrderWithMetadata[]
  >(
    R.filter(R.allPass(filters)),
    R.sortWith(sorters),
    R.take(args.limit)
  )(mockOrders);
}

function addOrdersResolver(_: any, args: AddOrdersArgs): AddOrdersResults {
  // Split orders arbitrarily into accepted and rejected.
  const [acceptedOrders, rejectedOrders] = R.splitEvery(1, args.orders);
  const accepted: AcceptedOrderResult[] =
    acceptedOrders == null
      ? []
      : acceptedOrders.map((order) => ({
          order: {
            ...order,
            hash:
              "0x06d15403630b6d83fbacbf0864eb76c2db3d6e6fc8adec8a95fc536593f17c53",
            remainingFillableTakerAssetAmount: "150000",
          },
          isNew: true,
        }));
  const rejected: RejectedOrderResult[] =
    rejectedOrders == null
      ? []
      : rejectedOrders.map((order) => ({
          hash:
            "0x06d15403630b6d83fbacbf0864eb76c2db3d6e6fc8adec8a95fc536593f17c53",
          order,
          code: RejectedOrderCode.EthRPCRequestFailed,
          message: "network request to Ethereum RPC endpoint failed",
        }));
  return {
    accepted,
    rejected,
  };
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cacheControl: false,
});

server.listen().then((result: { url: string }) => {
  console.log(`👺 Server ready at ${result.url}`);
});

// mockOrders is a collection of real orders from SRA. Sorted by order hash.
const mockOrders: OrderWithMetadata[] = [
  {
    signature:
      "0x1c91055b1ce93cdd341c423b889be703ce436e25fe62d94aabbae97528b4d247646c3cd3a20f0566540ac5668336d147d844cf1a7715d700f1a7c3e72f1c60e21502",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xd965a4f8f5b49dd2f5ba83ef4e61880d0646fd00",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "1250000000000000",
    takerFee: "0",
    makerAssetAmount: "50000000000000000",
    takerAssetAmount: "10",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xa7cb5fb7000000000000000000000000d4690a51044db77d91d7aa8f7a3a5ad5da331af0000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000e3a2a1f2146d86a604adc220b4967a898d7fe0700000000000000000000000009a379ef7218bcfd8913faa8b281ebc5a2e0bc040000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001360000000000000000000000000000000000000000000000000000000000000004",
    salt: "1584796917698",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x0d056bb17ad4df5593b93a1efc29cb35ba4aa38d",
    expirationTimeSeconds: "1595164917",
    makerFeeAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x06d15403630b6d73fbacbf0864eb76c2db3d6e6fc8adec8a95fc536593f17c54",
    remainingFillableTakerAssetAmount: "10",
  },
  {
    signature:
      "0x1bf931ab06551bbbd3a7e272ca4833503d768caca2cac564b157b46c906c7b41c57fd6146b500e1ad2dac729c351142764cb76efc975c6d7c64aef6cf7930c075d02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x0c5fa5fa51d84227bfacdc56b36329286b37d051",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "50911000000000000",
    takerAssetAmount: "10000000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b000000000000000000000000058b6a8a3302369daec383334672404ee733ab239",
    salt: "1590244702461",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xa258b39954cef5cb142fd567a46cddb31a670124",
    expirationTimeSeconds: "1592663792",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x181af7476932a167bb95224a0cc0f627c422c49c2f0698bf7b1bf0525518fdf1",
    remainingFillableTakerAssetAmount: "10000000000000000000",
  },
  {
    signature:
      "0x1be71eb13970f5f428843b64b697132c498bff99d878eb496e1bfc1616d3eadc862f622cef8d8766ef5e7180505af723eda590c7d9f580b19c485488dc33ff805402",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x9899beaad8ded0402c39148afdd03850dfe29fda",
    takerAddress: "0x56d9fb185343ff68484abb2964ad319728083cc9",
    makerFee: "30000",
    takerFee: "30000",
    makerAssetAmount: "2000000",
    takerAssetAmount: "1",
    makerAssetData:
      "0xf47261b0000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    takerAssetData:
      "0x0257179200000000000000000000000048acc9ccee8b3581325fdf5171a997b02e95f781000000000000000000000000000000000000000000000000000000000000002c",
    salt: "1591360002494",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xf19c44431b01bc31a18cd69c5e334b6f255b16e8",
    expirationTimeSeconds: "1592208000000",
    makerFeeAssetData:
      "0xf47261b0000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    hash: "0x1c4277bd277bab56cece52d53533361fc5b90428bddfc52eac2c32f6881ba08d",
    remainingFillableTakerAssetAmount: "1",
  },
  {
    signature:
      "0x1be291831d14dbfddf0bc8f7c2b2085c737864b722b15736c718d9504f7e477fae2210ec7ee8936b88d50cf96acdb5e89a0b8767b220158f10aed33448186e4ea402",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xa1785326e82e42803771aa9ebce9901f737bda97",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "5000000000000000000",
    takerAssetAmount: "200000000000000000",
    makerAssetData:
      "0xf47261b00000000000000000000000000f5d2fb29fb7d3cfee444a200298f468908cc942",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt: "1590581246742",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xa258b39954cef5cb142fd567a46cddb31a670124",
    expirationTimeSeconds: "1614430427",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x27e9da9f835fd936e6409ccf562bd0fb6918874efeb85da37f57afc05998235f",
    remainingFillableTakerAssetAmount: "200000000000000000",
  },
  {
    signature:
      "0x1ce8a5713bc5423607f40616568b1b6492c4900f3327ad4f8562a6b493f2d13e193e354eaecd2ca35b236f27470af6697ba3c097ee2594a12c7665488bfa382ece03",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xba782e9fbac2c7bfc1ce409b3909099b6ed61f80",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "168539133748370000",
    takerAssetAmount: "2188819918810000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b00000000000000000000000004fbb350052bca5417566f188eb2ebce5b19bc964",
    salt:
      "42812458307456344235177635129728151489417981906874938319576614302833882180533",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xc898fbee1cc94c0ff077faa5449915a506eff384",
    expirationTimeSeconds: "1598733429",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x2d8d646d62c0b934125c8cbc1fd663d09bc3938610a428680b6a683056e631f5",
    remainingFillableTakerAssetAmount: "2188819918810000000000",
  },
  {
    signature:
      "0x1b3768b08fd0e1d8af68cb815a2568d20fd4a2fa9296aa56c86fbe78f0cc51a72f6ef959c5aa8c1fd7a34052239c4c6e6173065ca9f729a4ddf8767f3bff26b87302",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x6425bb021dabd5d6b443a1ab47b003a1b7a27d4b",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "126009899995338490000",
    takerAssetAmount: "132999923790000000000",
    makerAssetData:
      "0xf47261b00000000000000000000000006b175474e89094c44da98b954eedeac495271d0f",
    takerAssetData:
      "0xf47261b0000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
    salt: "1592426834235",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x1000000000000000000000000000000000000011",
    expirationTimeSeconds: "1592427434",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x35bbc8a1d5d9cd37571a74fd64b26085b30dff8e5e7cd43854cfdbf8ff3cc44c",
    remainingFillableTakerAssetAmount: "132999923790000000000",
  },
  {
    signature:
      "0x1b752cb57c3055d422562c6ddce116b0b5040db91b1f2bd71a06e293a616c528475e3252e49028b45bbe7d7de22b4ec3f1f425730770447649d878703d72a5af0a02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x0c5fa5fa51d84227bfacdc56b36329286b37d051",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "36600000000000000",
    takerAssetAmount: "3000000000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b00000000000000000000000000f5d2fb29fb7d3cfee444a200298f468908cc942",
    salt: "1589280844412",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xa258b39954cef5cb142fd567a46cddb31a670124",
    expirationTimeSeconds: "1613130756",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x38c1b56f95bf168b303e4b62d64f7f475f2ac34124e9678f0bd852f95a4ca377",
    remainingFillableTakerAssetAmount: "3000000000000000000000",
  },
  {
    signature:
      "0x1c90dd78b050b6a8f0df42255c0d04bd1dbbc6110ee153b5aba04848f75d63b6051eeb1faa726855f17d8b577efe830ab5843dbdb91a702ce84dd4135183c73d5d03",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xced732ca92cb4f040239c4e8c85f14acbb5db000",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "1191000000000580000",
    takerAssetAmount: "35981873111800000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498",
    salt: "1591717185851",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xa258b39954cef5cb142fd567a46cddb31a670124",
    expirationTimeSeconds: "1594309163",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x3ee7a5fad1a222532bead735049ea5f2c4b0b096efbe63bdf9a0299192f653e6",
    remainingFillableTakerAssetAmount: "35981873111800000000000",
  },
  {
    signature:
      "0x1b09d681dd0ab38726d2b71586803f98ee1906e8d818eef5c64e410e09dd043a1c1b1915e7d9e90eb1dc4e2b43f815ae808131d718a21d8a2199832cf2798a80b602",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x8ce0e1ded53387bbd84cd0c01114cd7eaedb5a11",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "1260000000000000",
    makerAssetAmount: "630000000000000000",
    takerAssetAmount: "500000000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498",
    salt: "1592229110187",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x10aa8c82e3656170baae80d189b8b7dcea6865c9",
    expirationTimeSeconds: "1604325110",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    hash: "0x46fc0d204158be2c9bd9b9949f734d3c33d702bec7bdfe80ac527df3b88fab94",
    remainingFillableTakerAssetAmount: "500000000000000000000",
  },
  {
    signature:
      "0x1b1d76a196c7247380bab3bafcf8d654d7fc33d56fa371735f8572fe79f682e88e472828da2caf7df63c616c869f683f76b9c8cfba9e263b631f27f0dc194e1d4a02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x915c781d8464bb057c24c5ee7c5aaa387a544ab1",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "525000000000000",
    makerAssetAmount: "1000000000000000",
    takerAssetAmount: "210000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b00000000000000000000000004c327471c44b2dacd6e90525f9d629bd2e4f662c",
    salt:
      "24430350154090114222106673940995434808390424740495940354785031446605180670419",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x68a17b587caf4f9329f0e372e3a78d23a46de6b5",
    expirationTimeSeconds: "1594195642",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b00000000000000000000000004c327471c44b2dacd6e90525f9d629bd2e4f662c",
    hash: "0x48182738c01c3d7435dc0ad07a467ac9f15c5bfb91ddb3d3fe4f0c4cbd2ec3cd",
    remainingFillableTakerAssetAmount: "210000000000000000",
  },
  {
    signature:
      "0x1cab65943bffd0659205adf317d85e985117a16f665b3937b73dd0f2336ed98acf2d2c9b675bf4647e14b99d614319d2a64b34e5713435565e6484500c04776a5b02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x3591d261da9ca19d83de5028d4caa02f22aaf9ee",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "7700000000000000",
    takerAssetAmount: "100000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b0000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    salt: "1585404440306",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xa258b39954cef5cb142fd567a46cddb31a670124",
    expirationTimeSeconds: "1598623639",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x4b8de5549b1dd67756deef8289ec763b548068395a1212f48aad45c7d258500d",
    remainingFillableTakerAssetAmount: "100000000",
  },
  {
    signature:
      "0x1b8822d7e298922b7312fe1948cd83522a4e153a0730c076614de5fcecb8fc213e1c3dc779d096037f465da5beb11ec11b8f4ba6949c231d772f43653fbd82580302",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xb7c3c9e7f9d8eb20b0f4db74728a6d4f6881eb37",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "8277500000000000",
    makerAssetAmount: "550000000000000000000",
    takerAssetAmount: "4138750000000000000",
    makerAssetData:
      "0xf47261b00000000000000000000000004c327471c44b2dacd6e90525f9d629bd2e4f662c",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt: "1592335234216",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x10aa8c82e3656170baae80d189b8b7dcea6865c9",
    expirationTimeSeconds: "1604431234",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    hash: "0x55849b27be97e6cc990f34ebe23e8f79e5be29ea9614a20dd90d9f4a987d81a5",
    remainingFillableTakerAssetAmount: "4138750000000000000",
  },
  {
    signature:
      "0x1c3e5439098041c56f13686e5493a824164fc59f8b3a00472d5272c44fa47bb90b2b1661f193ffdf69806980c3276bcdf4182ebdd9bfb97bf9c4423e1cd9ecb05c02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x556d593954593c71668b23ccb744d289c5dc8c50",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "448447254288233",
    makerAssetAmount: "2000000000000000000",
    takerAssetAmount: "179378901715293315",
    makerAssetData:
      "0xf47261b0000000000000000000000000e48972fcd82a274411c01834e2f031d4377fa2c0",
    takerAssetData:
      "0xf47261b00000000000000000000000006b175474e89094c44da98b954eedeac495271d0f",
    salt:
      "65785070265214953365361486683262938872501806206095173312889802799788725393191",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x68a17b587caf4f9329f0e372e3a78d23a46de6b5",
    expirationTimeSeconds: "1592735327",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b00000000000000000000000006b175474e89094c44da98b954eedeac495271d0f",
    hash: "0x583203c46d07990799ca784bc2dfa98a0bb3e0d0418399515ae7d766281c54f0",
    remainingFillableTakerAssetAmount: "179378901715293315",
  },
  {
    signature:
      "0x1bdf44832e0f1f5d6419cdfdca5c743a092dec25ea1496dc223d2a2441f7c099f06dc43effb3ead7d2038234d78ece5a2a7a1acab6ff4138fd9350f9ee1e31704f02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x06a6b65d93cdd5026729973d835716ba0450b002",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "150000000000",
    takerAssetAmount: "450000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000041fe8df8b4aaa868941eb877952f17babe57da5",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt:
      "40558067075250523482765413605372980419961816932293226924239463600253829535425",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x4524baa98f9a3b9dec57caae7633936ef96bd708",
    expirationTimeSeconds: "1612946113",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x5a0746910c6a8a4730878e6e8a4abb328844c0b58f0cdfbb5b6ad28ee0bae347",
    remainingFillableTakerAssetAmount: "450000000000000000",
  },
  {
    signature:
      "0x1c6e0025730b6d668880bcbfcfa0f2f758550e0ee2ca7f0ed1cbb1809b6a8f5dab1c2bff2e54be9da6fcc6898b1be3cf24a3a111d0b1cb28547d170d77470e775f02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x1fabbc2531735ebdbfddec478c7e5bf5b63eed96",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "56209600000000000",
    makerAssetAmount: "3268000000000000000000",
    takerAssetAmount: "28104800000000000000",
    makerAssetData:
      "0xf47261b00000000000000000000000004c327471c44b2dacd6e90525f9d629bd2e4f662c",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt: "1592068041349",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x10aa8c82e3656170baae80d189b8b7dcea6865c9",
    expirationTimeSeconds: "1604164041",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    hash: "0x5ac775e05cc7d9c9efb2cfc9c741864d2ead2f068c2359603e91eba8813ad2f9",
    remainingFillableTakerAssetAmount: "28104800000000000000",
  },
  {
    signature:
      "0x1b4c9be4022dc21a33f5ca6e75b23fb0450efefd7570adab6a406567a6a93dcfa1335346c720882040ea03e631fcdc54f674813b20372529652948c09a6250f4d902",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x9fe423c9f2de4ec9ea0741d2bf4187649a870862",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "3060000000000",
    makerAssetAmount: "1020000000000000",
    takerAssetAmount: "100000000000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b0000000000000000000000000b53e08b97724126bda6d237b94f766c0b81c90fe",
    salt: "1590594954970",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x5265bde27f57e738be6c1f6ab3544e82cdc92a8f",
    expirationTimeSeconds: "1602690954",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    hash: "0x6020cfb377ae9e9d808cf1e6801106faa5ea43a5aaae0529b951c078fc76a611",
    remainingFillableTakerAssetAmount: "100000000000000000000000",
  },
  {
    signature:
      "0x1b0845a5b4d6518b9c453bb3f0efe504c8a5008e9993ca8f750d34221b44702bae17ef433f12857fdcd64346c76c834f822e6f966767d9206a8ce37d447968862b02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x556d593954593c71668b23ccb744d289c5dc8c50",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "24960228222421",
    makerAssetAmount: "22493977429440309948",
    takerAssetAmount: "9984091288968439",
    makerAssetData:
      "0xf47261b0000000000000000000000000e48972fcd82a274411c01834e2f031d4377fa2c0",
    takerAssetData:
      "0xf47261b00000000000000000000000005e74c9036fb86bd7ecdcb084a0673efc32ea31cb",
    salt:
      "70518635732386815417685780208842118694373824771629307136470334441011704138871",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x68a17b587caf4f9329f0e372e3a78d23a46de6b5",
    expirationTimeSeconds: "1616063827",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b00000000000000000000000005e74c9036fb86bd7ecdcb084a0673efc32ea31cb",
    hash: "0x6f36c1c23ba361a442ba3386f7abed065f06e772d8a64711fe73f6d3138786ac",
    remainingFillableTakerAssetAmount: "9984091288968439",
  },
  {
    signature:
      "0x1ba9fa2acd1068218816cc179ec0e8f96e6eea5960f7068209eb94fddb0df8a669287b56ba37bbced73dd8849b34cbec10fcbbc624e32730d6bb9887f9ee985d5602",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x0c5fa5fa51d84227bfacdc56b36329286b37d051",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "132375000",
    makerAssetAmount: "1000000000000000000",
    takerAssetAmount: "52950000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b000000000000000000000000027054b13b1b798b345b591a4d22e6562d47ea75a",
    salt:
      "55292708311244182203101157348321570262493441632991525804516842391408928704379",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x68a17b587caf4f9329f0e372e3a78d23a46de6b5",
    expirationTimeSeconds: "1850648233",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b000000000000000000000000027054b13b1b798b345b591a4d22e6562d47ea75a",
    hash: "0x73b79d3cf8189f28ada0b3d71124a950505dc705e62420e6aea2e3e40ca0fc0e",
    remainingFillableTakerAssetAmount: "52950000000",
  },
  {
    signature:
      "0x1c9bd3ae5f1780b7146432a7dd679b6e2f2c5788abd073bd5629cde2aca8a5efce514186b280ef97c3d8d79eaa2445f6a515496f81d01956dfad12918daac02bef03",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x69956c5630236845832ed2db86f491f6ef38602b",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "250000000",
    makerAssetAmount: "370000000",
    takerAssetAmount: "100000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7",
    takerAssetData:
      "0xf47261b00000000000000000000000008400d94a5cb0fa0d041a3788e395285d61c9ee5e",
    salt:
      "585873340565143504625508999658211432996493140168479982005219719924635913754",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x68a17b587caf4f9329f0e372e3a78d23a46de6b5",
    expirationTimeSeconds: "1850298364",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b00000000000000000000000008400d94a5cb0fa0d041a3788e395285d61c9ee5e",
    hash: "0x756b6b23d783b6d7151b33c2b7187bc5307bf57a3e8c24959cb54cf255a03bb1",
    remainingFillableTakerAssetAmount: "36546729943",
  },
  {
    signature:
      "0x1b4861f99317491d39e2cc48813dea18517093f632574b6c8b9ae7f01e72959f56023edd7875d3ee0a67ca487be0fb3d272a035b8fd3e75746dc7e6740257adf6a02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x0c5fa5fa51d84227bfacdc56b36329286b37d051",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "1199700000000000",
    takerAssetAmount: "11997000000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b00000000000000000000000000abdace70d3790235af448c88547603b945604ea",
    salt: "1591468152262",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xa258b39954cef5cb142fd567a46cddb31a670124",
    expirationTimeSeconds: "1615058729",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x75d2b56b11f21235ec8faec8be9d081090678cf62f5c69fa118236d829424719",
    remainingFillableTakerAssetAmount: "11997000000000000000000",
  },
  {
    signature:
      "0x1c976153f08c913f3328b721ab12b21ce24df98dfbd80a1c9994ac1f65b9ee77073eae6ded2c4d1b864b45ca2225fae84fa5511d8a42af435e25515fa9ace7577403",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x8a9c00b44bc68debd067fe83b5db4bb953833519",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "1237500000000000",
    makerAssetAmount: "500000000000000000000",
    takerAssetAmount: "495000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000b62132e35a6c13ee1ee0f84dc5d40bad8d815206",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt:
      "31393814891068733023382991263805845390452030513546311586048706705534527142698",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x68a17b587caf4f9329f0e372e3a78d23a46de6b5",
    expirationTimeSeconds: "3600001590000684",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    hash: "0x7b342995cfbc2b76ae33e2a5bbaa60babadb9f7722a0fea9339ac9020fb8427d",
    remainingFillableTakerAssetAmount: "495000000000000000",
  },
  {
    signature:
      "0x1c3f105861e03dc2c108ad1b25d99fa4f988fd683fbed7854e66c64512587125794e07b7c4e5f0f5bdbb89a3ccd69892444d4107b8dcc60f84eb2aa344eddf136a02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xd2f6e23e515f674a6f4d52fce7962e2e0050798f",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "30000000000000000",
    makerAssetAmount: "50000000000000000",
    takerAssetAmount: "15000000000000000000",
    makerAssetData:
      "0xf47261b000000000000000000000000077678cfd0f2b55152adc6599db9f988ab28d72f2",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt: "1592025261880",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x10aa8c82e3656170baae80d189b8b7dcea6865c9",
    expirationTimeSeconds: "1604121261",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    hash: "0x83e7d03072bfebcde119779365010571e7942c88f66b3bd8da89487d2edb822f",
    remainingFillableTakerAssetAmount: "15000000000000000000",
  },
  {
    signature:
      "0x1b90833aec3b87fffc332f3499b4bb34c55e5961f97b14c1e081eece208acf0aaa5fc1ff355388b65f49b5e6de773b305c1864078d67dc2211c9d372f888e97a8603",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xf726a68c13693fd0a680d0b3995517f6df1c8cb1",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "8972376620000016385",
    takerAssetAmount: "4486187412762346192",
    makerAssetData:
      "0xf47261b000000000000000000000000058b6a8a3302369daec383334672404ee733ab239",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt: "1592417108895",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xa258b39954cef5cb142fd567a46cddb31a670124",
    expirationTimeSeconds: "1592503508",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x86133e95799b57f8ba217e8ef9b1888196bc426e55aaf789d16b1d6e0cdd0f66",
    remainingFillableTakerAssetAmount: "4486187412762346192",
  },
  {
    signature:
      "0x1bf31dfd56ea85df817696ca687fc47ae8a1f5161715f251ca038e644027b5cb49504bc5ab491d9a0033000df4dba2150a83d45cb768caaa2fccaa52226ae016a902",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xc1645ad562e1cb9fdf5735233ba4b2a6c9e011c1",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "600000000000000000000",
    takerAssetAmount: "1590000000000000000",
    makerAssetData:
      "0xf47261b00000000000000000000000005bc7e5f0ab8b2e10d2d0a3f21739fce62459aef3",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt: "1592025787695",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xa258b39954cef5cb142fd567a46cddb31a670124",
    expirationTimeSeconds: "1594617786",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x8b45b4201d658fccc6f3066162502c46cbf0928f0ca11738398e811d95ee2206",
    remainingFillableTakerAssetAmount: "1590000000000000000",
  },
  {
    signature:
      "0x1b79c0d58de9f11852d35a1f89edaa6fd4975f14e35312cb7c52e3eb3c12c218f80ef10ba9e09e8c506594785851a49758c5e02ff0ed0b41c832ac623d3a75559303",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x8a9c00b44bc68debd067fe83b5db4bb953833519",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "156650000000000000",
    makerAssetAmount: "1300000000000000000000",
    takerAssetAmount: "62660000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000b62132e35a6c13ee1ee0f84dc5d40bad8d815206",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt:
      "81681686877674709674703696507173653438076202529822323004686306722758945375466",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x68a17b587caf4f9329f0e372e3a78d23a46de6b5",
    expirationTimeSeconds: "360001590005930",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    hash: "0x947798e56f26c668494495ab322eea1aaa3495932dc72ccf2f678b55d73cc206",
    remainingFillableTakerAssetAmount: "62660000000000000000",
  },
  {
    signature:
      "0x1c7d71adce1c91a3bde64147cdbdf0ebeb0333ae35af157380ec3f12b3b23bb3e313f44936ba8bcda2200c7c3a4a9d219e052d313273ef087e056f3bc76bd9fe8702",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x79d049d992f34b8b1326565ef4259d5faa173abe",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "10000000000000",
    takerAssetAmount: "10000000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000130da3e198f092fe2a6e6c21893dc77746d7e406",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt:
      "36143271978302992197299835224310248085018217962944405794698323286140664862478",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x4524baa98f9a3b9dec57caae7633936ef96bd708",
    expirationTimeSeconds: "1594977976",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x95cfae1be89490ffe3d7286c828a3ac0866384dcff427f4541eb1c4ebc93f064",
    remainingFillableTakerAssetAmount: "10000000000000000000",
  },
  {
    signature:
      "0x1b4b9afc0343a6c1d5165f20b6a76b603f9567e528157055bece3ea61f406b92b91b000882bfe079a9d3693662d6c43b9f6506a05606807aac24f5911a7f4b969c02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xa1785326e82e42803771aa9ebce9901f737bda97",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "4200000000000000",
    takerAssetAmount: "10000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b00000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599",
    salt: "1586758053180",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xa258b39954cef5cb142fd567a46cddb31a670124",
    expirationTimeSeconds: "1610519890",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x97eff10edaad0b69e888bd3455a4b4c7dc18b2de7e500832eb88023b11f5c178",
    remainingFillableTakerAssetAmount: "10000",
  },
  {
    signature:
      "0x1bbe05b8d6511894a7ee67b9636e7ce2c7aa117533976fafd1fe8dfde9ae35d9521544a15ae81efa8106645debc8f47260fe50785ce794c6dc85dffdaec997167b02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xb8e17edcd44e3cc08abd1bf678c4c75a14d3e001",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "100000000000000000000000",
    takerAssetAmount: "4000000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000e343245de92181bc06ba5cd1152c705a2c5f3e2f",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt:
      "87704145339074387203942108506562572927743012214986697220781188362201585914030",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x4524baa98f9a3b9dec57caae7633936ef96bd708",
    expirationTimeSeconds: "1623437614",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x9bfb31213aaff7585ccbd5406062aa14d4e8b5bca86f5edcac3a04dfd44fc25a",
    remainingFillableTakerAssetAmount: "4000000000000000000",
  },
  {
    signature:
      "0x1be70c4415a892ecc56a34265ba36d9ddc953ab3d77d6bce6c43eebd2f48ee46851bbc23dd81cfbf2afb6941539b7d9771be632be2668d43d4d2289de190f33e3903",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x56178a0d5f301baf6cf3e1cd53d9863437345bf9",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "6000000000000000000000",
    takerAssetAmount: "6178544835126523200000",
    makerAssetData:
      "0xf47261b00000000000000000000000006b175474e89094c44da98b954eedeac495271d0f",
    takerAssetData:
      "0xf47261b00000000000000000000000000000000000085d4780b73119b644ae5ecd22b376",
    salt: "1592426500813",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xa258b39954cef5cb142fd567a46cddb31a670124",
    expirationTimeSeconds: "1592426950",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0x9db85ba13bc62ca25dd91616b6ac4a81e34c5831c31b4aa5258ad7b6d4cddf3d",
    remainingFillableTakerAssetAmount: "6178544835126523200000",
  },
  {
    signature:
      "0x1bd8fbe5ff7d90ca676316f36d8b846337350cdc610a66bc8355fe376344a467a97e9471509eb791f56a522b58c537f15c63ec7c9eeb262a1aa771cd99e079f1dc02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x89e2aebc454556f60f2b6facd1746bcb58f0b4f3",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "68181818181818182",
    makerAssetAmount: "3000000000000000000",
    takerAssetAmount: "27272727272727273000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b0000000000000000000000000a1d65e8fb6e87b60feccbc582f7f97804b725521",
    salt:
      "21901609914472548641873692100904723214277078003346510602061649448241006737625",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x68a17b587caf4f9329f0e372e3a78d23a46de6b5",
    expirationTimeSeconds: "1594973175",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000a1d65e8fb6e87b60feccbc582f7f97804b725521",
    hash: "0x9f33d40eccc0ad1074b7346e23d0b51c8103de279621d55a67489ce4c6691a41",
    remainingFillableTakerAssetAmount: "27272727272727273000",
  },
  {
    signature:
      "0x1b9900fc888d2d89c8184551ba6e3cd782b38b10f932dcc8fef892701e45178ccd52440101c10fc34d843ac7058de273294a529845cdfa13696703d7e54730c2cc02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x2a1049062c6cfd69bd38fbaf3b0559df1dbbc92c",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "975000000000000000",
    makerAssetAmount: "1000000000000000000",
    takerAssetAmount: "390000000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b0000000000000000000000000b4efd85c19999d84251304bda99e90b92300bd93",
    salt:
      "23446886076593892077093130771648655160385461077306011871125510030663116493466",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x68a17b587caf4f9329f0e372e3a78d23a46de6b5",
    expirationTimeSeconds: "1594136857",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000b4efd85c19999d84251304bda99e90b92300bd93",
    hash: "0xa0d457097887bd74e09100a15e9c4523ffa5ffae6090119c0c2b2d47dabb0fcf",
    remainingFillableTakerAssetAmount: "390000000000000000000",
  },
  {
    signature:
      "0x1ce2cc8bdab9b2b40dcff1f8951b0fcace5622b95c056a6c779126681394896b152c49a88b54c784230a5f8d8552fddb7bd29e9da3943fdf6de3c0a1d0a5c2fce703",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xced732ca92cb4f040239c4e8c85f14acbb5db000",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "1320000000000000000",
    takerAssetAmount: "600000000000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    takerAssetData:
      "0xf47261b0000000000000000000000000960b236a07cf122663c4303350609a66a7b288c0",
    salt: "1591717348059",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0xa258b39954cef5cb142fd567a46cddb31a670124",
    expirationTimeSeconds: "1594309163",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0xa0ff52a055379bcfc51420bbf0b633acbdd993508dca3c7ce3898f21bc939fc2",
    remainingFillableTakerAssetAmount: "600000000000000000000000",
  },
  {
    signature:
      "0x1cf7edee69525fcda8f8836a6520be5fc7011f89a20ef7dcf8ff53c6e929b4b4f51ca431a02cc72c673032a9c8d53c9b42397bcbc558b0e7a7aa6951b38121ae7902",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x27b83a3da0208ffda15af5552ac2a2ba73b1ac8f",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "1000000000000000000000000",
    takerAssetAmount: "1000000000000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000b80112e516dabcac6ab4665f1bd650996403156c",
    takerAssetData:
      "0xf47261b000000000000000000000000066fd97a78d8854fec445cd1c80a07896b0b4851f",
    salt:
      "41253650094022890165363439689157001846570691977089239108645341268233589193205",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x4524baa98f9a3b9dec57caae7633936ef96bd708",
    expirationTimeSeconds: "1594830477",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0xa41e9c5194be105d06025acaedd4768105253aa76dca1f516b5a59a8d885fd94",
    remainingFillableTakerAssetAmount: "1000000000000000000000000",
  },
  {
    signature:
      "0x1cb83ef1d338d98aa602ef58497bd74ae3f1cdf29aaef420cb39acef44706878c2250c3ca82a71fd2d25a1ddbd44304e9eb8934dfa30170f3a458a7cec1886906d02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x035eb0c84a0b3eeb8df0839eb330bdef990108a3",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "150000",
    takerAssetAmount: "993750000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000fb48e0dea837f9438309a7e9f0cfe7ee3353a84e",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt:
      "46832009816692356067862615482636265503794883317486802696404471630990443818733",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x4524baa98f9a3b9dec57caae7633936ef96bd708",
    expirationTimeSeconds: "1625025600",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0xbc1bacf1c8a66d18a9123573872fb5e14dad6d82b0fe07aba4bbdf50aef1ca7a",
    remainingFillableTakerAssetAmount: "993750000000000000000",
  },
  {
    signature:
      "0x1b19587fdfd4a9904f82c757397ccc1f303db2055d2b5cbf633f0fc3060fcd14ce5c4d3d244e9ec8b49fdb16d3a41f46d623d2cfd74c8be63fb2bfd25a46c9f93e02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xf71f01bb0c0cb0739603c55950884a5690772676",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "6300000000000000",
    makerAssetAmount: "21000000000000000000000000",
    takerAssetAmount: "3150000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000b1d22dffb6c9bf70544116b3ce784454cf383577",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt: "1592220781155",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x10aa8c82e3656170baae80d189b8b7dcea6865c9",
    expirationTimeSeconds: "1604316781",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    hash: "0xdb4b545d55ba5c6dbd650fe09288267d1bc3e8b4639877f27cb661932a210646",
    remainingFillableTakerAssetAmount: "3150000000000000000",
  },
  {
    signature:
      "0x1b5ccb4bbad2780f6a236708b3d1413da3b1a1a706e62a54624aa338fe4805248b455c72b4fa520a8ee31d16fcfd910a04da348d92b5a5e193bff82e8194ba046102",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xd2f6e23e515f674a6f4d52fce7962e2e0050798f",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "5000000000000000",
    makerAssetAmount: "50000000000000000",
    takerAssetAmount: "2500000000000000000",
    makerAssetData:
      "0xf47261b000000000000000000000000077678cfd0f2b55152adc6599db9f988ab28d72f2",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt: "1592025827621",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x10aa8c82e3656170baae80d189b8b7dcea6865c9",
    expirationTimeSeconds: "1604121827",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    hash: "0xebc4b679783d3b2526baafd50ea00cd93e3152fb5eab848ea53e492c8b00641c",
    remainingFillableTakerAssetAmount: "2500000000000000000",
  },
  {
    signature:
      "0x1b70d766bf5eb47e6b2e94a24fec47f215fca6c075b88a8f06b9edd9049046d056046f54bbc7f9d99a321df478c196c71be8cea2d1f99afe0fff615459c0ec965102",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x91a85f552c9d0bb8a04a626f2b8a6edeebda63a2",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "300000000000000",
    makerAssetAmount: "10000000000000",
    takerAssetAmount: "100000000000000000",
    makerAssetData:
      "0xf47261b000000000000000000000000034b85a27ef6f06c536d8e549b9aac66bd8af3335",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt: "1589431460100",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x5265bde27f57e738be6c1f6ab3544e82cdc92a8f",
    expirationTimeSeconds: "1601527460",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    hash: "0xedd6dbddca8f7b63d7fcbd6ba9dfb7b3d444fd0b633354bf0fd7fd7b8cfb1d8c",
    remainingFillableTakerAssetAmount: "100000000000000000",
  },
  {
    signature:
      "0xa77e413edeaef2d3d54b0bb487c79643ccbbb5ca9804ffd47035c608ac3b066316a227b7d6ba53e9e47c1a597b48f22b54e6492e93b4eb7367ccf708c0ec3c0e1b07",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xa3a5fdb12ac63eaff286d7bbd196f9d440d75653",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "300000000000000000",
    takerAssetAmount: "300000000000000000",
    makerAssetData:
      "0x94cfcdd7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000124a7cb5fb7000000000000000000000000429ea12df8c3ab5413022d43eb04c9240029af2d000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000016903c19151b7f5ec83906e8b5bb13fe277599bfb0000000000000000002f0100000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024f47261b00000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e4a7cb5fb70000000000000000000000000ffbb6cada44e049ce635686c423a5d467a01b7b000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    takerAssetData:
      "0xa7cb5fb7000000000000000000000000429ea12df8c3ab5413022d43eb04c9240029af2d000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    salt: "1591728577811",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x0000000000000000000000000000000000000000",
    expirationTimeSeconds: "1623286177",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0xf3d0d6b5bc9603366f4f5e2414a2e6a609a6b234c73eed8a1f1d9a95cde9536c",
    remainingFillableTakerAssetAmount: "100000000000000000",
  },
  {
    signature:
      "0x1cf2ec87151eae73164ff64ab8df2006c1f2e3e4f3c235b3cce1cd7ca6f0b2b7de7d33cfa2f358513bad607a15c3289e22bf70c5aa08fdf1097101567403527dde02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0x998497ffc64240d6a70c38e544521d09dcd23293",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "126009972",
    takerAssetAmount: "133000000000000000000",
    makerAssetData:
      "0xf47261b0000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    takerAssetData:
      "0xf47261b0000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
    salt: "1592426834218",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x1000000000000000000000000000000000000011",
    expirationTimeSeconds: "1592427434",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0xf92788011f74d725ab903ad6314fd79a31a65c74c15458c2728abb0d2c5833cd",
    remainingFillableTakerAssetAmount: "133000000000000000000",
  },
  {
    signature:
      "0x1bb1eef5d30b295e8af67980f223a45a1e0126ec59148651ece982076d6b936bff6377b60072aec260e4b47b1786ece485d6d6db3ec7655dd6b017df96e4804dde02",
    senderAddress: "0x0000000000000000000000000000000000000000",
    makerAddress: "0xbf2df5663fc9cd51843d4ac5ccb28cdf92d773d5",
    takerAddress: "0x0000000000000000000000000000000000000000",
    makerFee: "0",
    takerFee: "0",
    makerAssetAmount: "32322000000000000000000",
    takerAssetAmount: "1001982000000000000",
    makerAssetData:
      "0xf47261b000000000000000000000000076540b005587b6146b3f23a6bc97a6e620a3e639",
    takerAssetData:
      "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    salt:
      "79508605842864342110297260529401394423599232685117621030225242018543247867714",
    exchangeAddress: "0x61935cbdd02287b511119ddb11aeb42f1593b7ef",
    feeRecipientAddress: "0x4524baa98f9a3b9dec57caae7633936ef96bd708",
    expirationTimeSeconds: "1593218042",
    makerFeeAssetData: "0x",
    chainId: 1,
    takerFeeAssetData: "0x",
    hash: "0xfe198638aecf1f9c0ebb028bd66b2ea02ceebcb3913ed644f246a81a71ada863",
    remainingFillableTakerAssetAmount: "1001982000000000000",
  },
];
