import { useCallback } from "react";
import moment from "moment";

import Table, { TableReadOptions } from "../../components/Table";
import { useAuth } from "../../lib/auth";
import { V1AdminEventLogsGet200Response } from "../../lib/auth/api";

export default function EventLogs() {
  const auth = useAuth();

  const onCount = useCallback(async () => {
    const res = await auth
      .createAdminApi()
      .v1AdminEventLogsGet({ countOnly: true })
      .catch(() => null);
    return { count: res?.data.data.count ?? 0 };
  }, [auth]);

  const onRead = useCallback(
    async (
      options: TableReadOptions<
        V1AdminEventLogsGet200Response["data"]["data"][0]
      >
    ) => {
      const res = await auth
        .createAdminApi()
        .v1AdminEventLogsGet({
          offset: options.from,
          limit: options.to - options.from,
          sortColumn: options.sort ? options.sort.column : undefined,
          sortBy: options.sort ? options.sort.orderBy : undefined,
        })
        .catch(() => null);
      return res?.data.data.data ?? [];
    },
    [auth]
  );

  return (
    <>
      <Table
        sortable
        disableMultiselect
        itemSingularNoun="event log"
        columns={[
          {
            field: "createdAt",
            title: "Created At",
            className: "flex-none w-56",
            onRender: (item) => {
              return moment(item.createdAt).format("DD MMM YYYY, h:mm:ss A");
            },
          },
          {
            field: "type",
            title: "Type",
            className: "flex-none w-32",
            onRender: (item) => {
              return item.type;
            },
          },
          {
            field: "dataId",
            title: "Data ID",
            onRender: (item) => {
              return item.dataId;
            },
          },
        ]}
        onCount={onCount}
        onRead={onRead}
      />
    </>
  );
}
