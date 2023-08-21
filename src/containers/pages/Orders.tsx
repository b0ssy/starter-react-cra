import { useCallback } from "react";
import moment from "moment";

import Table, { TableReadOptions } from "../../components/Table";
import { useBackend } from "../../lib/backend";
import { V1AdminOrdersGet200Response } from "../../lib/backend/api";

export default function Orders() {
  const backend = useBackend();

  const onCount = useCallback(async () => {
    const res = await backend
      .createAdminApi()
      .v1AdminOrdersGet({ countOnly: true })
      .catch(() => null);
    return { count: res?.data.data.count ?? 0 };
  }, [backend]);

  const onRead = useCallback(
    async (
      options: TableReadOptions<V1AdminOrdersGet200Response["data"]["data"][0]>
    ) => {
      const res = await backend
        .createAdminApi()
        .v1AdminOrdersGet({
          offset: options.from,
          limit: options.to - options.from,
          sortColumn: options.sort ? options.sort.column : undefined,
          sortBy: options.sort ? options.sort.orderBy : undefined,
        })
        .catch(() => null);
      return res?.data.data.data ?? [];
    },
    [backend]
  );

  return (
    <>
      <Table
        sortable
        itemSingularNoun="order"
        columns={[
          {
            field: "createdAt",
            title: "Created At",
            onRender: (item) => {
              return moment(item.createdAt).format("DD MMM YYYY, h:mm:ss A");
            },
          },
          {
            field: "id",
            title: "Order ID",
            onRender: (item) => {
              return item.id;
            },
          },
          {
            field: "customerId",
            title: "Customer ID",
            onRender: (item) => {
              return item.customerId;
            },
          },
          {
            field: "totalPrice",
            title: "Total Price",
            onRender: (item) => {
              return item.totalPrice;
            },
          },
          {
            field: "totalDiscount",
            title: "Total Discount",
            onRender: (item) => {
              return item.totalDiscount;
            },
          },
        ]}
        onCount={onCount}
        onRead={onRead}
      />
    </>
  );
}
