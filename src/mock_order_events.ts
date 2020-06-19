import { OrderEvent, OrderEndState } from "./types";
import { mockOrders } from "./mock_orders";

// mockOrders is a collection of real orders from SRA. Sorted by order hash.
export const mockOrderEvents: OrderEvent[] = [
  {
    timestamp: "2020-06-19T01:03:15.000Z",
    order: mockOrders[0],
    endState: OrderEndState.CANCELLED,
    contractEvents: [
      {
        blockHash:
          "0x1be2eb6174dbf0458686bdae44c9a330d9a9eb563962512a7be545c4ec11a4d2",
        txHash:
          "0xbcce172374dbf0458686bdae44c9a330d9a9eb563962512a7be545c4ec232e3a",
        txIndex: 23,
        logIndex: 0,
        isRemoved: false,
        address: "0x4f833a24e1f95d70f028921e27040ca56e09ab0b",
        kind: "ExchangeCancelEvent",
        parameters: {
          makerAddress: "0x50f84bbee6fb250d6f49e854fa280445369d64d9",
          senderAddress: "0x0000000000000000000000000000000000000000",
          feeRecipientAddress: "0xa258b39954cef5cb142fd567a46cddb31a670124",
          orderHash:
            "0x96e6eb6174dbf0458686bdae44c9a330d9a9eb563962512a7be545c4ecc13fd4",
          makerAssetData:
            "0xf47261b00000000000000000000000000f5d2fb29fb7d3cfee444a200298f468908cc942",
          takerAssetData:
            "0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        },
      },
    ],
  },
];
