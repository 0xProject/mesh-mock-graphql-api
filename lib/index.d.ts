declare const ApolloServer: any, gql: any;
declare const typeDefs: any;
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
interface Metadata {
    orderHash: string;
    remainingFillableTakerAssetAmount: string;
}
interface OrderWithMetadata {
    order: Order;
    metadata: Metadata;
}
interface OrderArgs {
    orderHash: String;
}
declare const resolvers: {
    Query: {
        order: typeof orderResolver;
        orders: typeof ordersResolver;
    };
};
declare function orderResolver(_: any, args: OrderArgs): OrderWithMetadata | undefined;
declare function ordersResolver(): OrderWithMetadata[];
declare const server: any;
declare const result: {
    url: string;
};
declare const mockOrders: OrderWithMetadata[];
//# sourceMappingURL=index.d.ts.map