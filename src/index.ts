import { ApolloServer } from "apollo-server";
import { mockOrders } from "./mock_orders";
import {
  OrderArgs,
  OrderWithMetadata,
  OrderFilter,
  FilterKind,
  OrdersArgs,
  OrderSort,
  SortDirection,
  Stats,
  AddOrdersArgs,
  AddOrdersResults,
  AcceptedOrderResult,
  RejectedOrderResult,
  RejectedOrderCode,
} from "./types";
import { typeDefs } from "./schema";
import * as R from "ramda";

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

function statsResolver(): Stats {
  return {
    version: "development",
    pubSubTopic: "/0x-orders/network/1/version/1",
    rendezvous: "/0x-mesh/network/1/version/1",
    peerID: "16Uiu2HAmGx8Z6gdq5T5AQE54GMtqDhDFhizywTy1o28NJbAMMumF",
    ethereumChainID: 1,
    latestBlock: {
      number: "8253150",
      hash:
        "0x84aaae84147fc42fc77b33e2d3e05d86272663792d9cacaa8dc89f207b4d0642",
    },
    numPeers: 18,
    numOrders: 1095,
    numOrdersIncludingRemoved: 1134,
    startOfCurrentUTCDay: "2020-06-19T00:00:00.000Z",
    ethRPCRequestsSentInCurrentUTCDay: 5039,
    ethRPCRateLimitExpiredRequests: 0,
    maxExpirationTime: "717784680",
  };
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

const resolvers = {
  Query: {
    order: orderResolver,
    orders: ordersResolver,
    stats: statsResolver,
  },
  Mutation: {
    addOrders: addOrdersResolver,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cacheControl: false,
});

server.listen().then((result: { url: string }) => {
  console.log(`👺 Server ready at ${result.url}`);
});
