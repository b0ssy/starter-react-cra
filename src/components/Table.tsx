import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import React, { useRef, useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

import Button, { ButtonProps } from "./Button";
import Checkbox from "./Checkbox";
import Modal from "./Modal";
import Spinner from "./Spinner";
import { sleep, capitalize, formatNumber } from "../lib/utils";
import Input from "./Input";

// Operation
export type Op = ({ type: "init" } | { type: "refresh" } | { type: "done" }) & {
  loading?: boolean;
  immediate?: boolean;
};

// Options for counting data
export interface TableCountOptions {
  searchText: string;
}

// Options for reading data
export interface TableReadOptions<T> {
  searchText: string;
  from: number;
  to: number;
  sort?: {
    column: keyof T;
    orderBy: "asc" | "desc";
  };
}

// Options for deleting data
export interface TableDeleteOptions<T> {
  items: T[];
}

export interface TableProps<T> {
  columns: {
    field?: keyof T;
    title: string;
    className?: string;
    disableSort?: boolean;
    onRender: (item: T) => string | React.ReactNode;
  }[];
  itemsPerPage?: number;
  actions?: React.ReactNode;
  itemActions?: {
    title: string;
    singleItemOnly?: boolean;
    buttonProps?: ButtonProps;
    onClick: (items: T[]) => void;
  }[];
  itemSingularNoun?: string;
  itemPluralNoun?: string;
  search?: {
    enabled?: boolean;
    placeholderLabel?: string;
  };
  disableMultiselect?: boolean;
  sortable?: boolean;
  refresh?: number;
  onCount: (options: TableCountOptions) => Promise<{
    count: number;
    data?: T[];
  }>;
  onRead?: (options: TableReadOptions<T>) => Promise<T[]>;
  onDelete?: (options: TableDeleteOptions<T>) => Promise<void>;
  onItemSelectable?: (item: T) => boolean;
}

export default function Table<T>(props: TableProps<T>) {
  const [op, setOp] = useState<Op>({ type: "init" });
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<T[]>([]);
  const [fullItems, setFullItems] = useState<T[] | null>(null);
  const [selectedItemsMap, setSelectedItemsMap] = useState<{
    [k: number]: boolean;
  }>({});
  const [sort, setSort] = useState<{
    column: keyof T;
    orderBy: "asc" | "desc";
  } | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searchTextTemp, setSearchTextTemp] = useState("");
  const [openDeletePrompt, setOpenDeletePrompt] = useState(false);
  const opId = useRef(Date.now());

  const itemsPerPage = Math.max(props.itemsPerPage ?? 10, 1);
  const totalPages = Math.max(Math.ceil(count / itemsPerPage), 1);
  const numSelectableItems = props.onItemSelectable
    ? items.filter((item) => props.onItemSelectable!(item)).length
    : items.length;

  const { onCount, onRead } = props;

  // Run operation
  useEffect(() => {
    if (op.loading || op.type === "done") {
      return;
    }

    const id = Date.now();
    opId.current = id;
    setOp({ ...op, loading: true });

    const startMs = Date.now();

    const init = async () => {
      let { count, data } = await onCount({ searchText });
      const isFullItems = !!data?.length;
      if (!data && count > 0) {
        const from = 0;
        const to = itemsPerPage;
        data = onRead
          ? await onRead({
              from,
              to,
              sort: sort ?? undefined,
              searchText: "",
            })
          : undefined;
      }
      if (opId.current !== id) {
        return;
      }
      const diff = 500 - (Date.now() - startMs);
      if (!op.immediate && diff > 0) {
        await sleep(diff);
      }
      setPage(1);
      setCount(count);
      if (isFullItems) {
        setFullItems(data ?? []);
      } else {
        setItems(data ?? []);
      }
      setOp({ type: "done" });
    };

    const refresh = async () => {
      const from = (page - 1) * itemsPerPage;
      const to = (page - 1) * itemsPerPage + itemsPerPage;
      const data = onRead
        ? await onRead({
            searchText,
            from,
            to,
            sort: sort ?? undefined,
          })
        : (await onCount({ searchText })).data;
      if (opId.current !== id) {
        return;
      }
      const diff = 500 - (Date.now() - startMs);
      if (!op.immediate && diff > 0) {
        await sleep(diff);
      }
      if (onRead) {
        setItems(data ?? []);
      } else {
        setFullItems(data ?? []);
      }
      setOp({ type: "done" });
    };

    if (op.type === "init") {
      init();
    } else if (op.type === "refresh") {
      refresh();
    } else {
      setOp({ type: "done" });
    }
  }, [op, page, itemsPerPage, sort, searchText, onCount, onRead]);

  // Refresh page
  useEffect(() => {
    if (props.refresh === undefined) {
      return;
    }
    setOp({ type: "init", immediate: true });
  }, [props.refresh]);

  // Set items from full items
  useEffect(() => {
    if (!fullItems) {
      return;
    }
    const from = (page - 1) * itemsPerPage;
    const to = (page - 1) * itemsPerPage + itemsPerPage - 1;
    const items = fullItems.slice(from, to);
    setItems(items);
  }, [fullItems, page, itemsPerPage]);

  // Get item singular/plural noun
  function getItemNoun(count?: number) {
    count = count ?? 0;
    if (count > 1) {
      return props.itemPluralNoun ?? `${props.itemSingularNoun ?? "item"}s`;
    } else {
      return props.itemSingularNoun ?? "item";
    }
  }

  // Navigate to first page
  function firstPage() {
    if (page <= 1) {
      return;
    }
    setPage(1);
    if (!fullItems) {
      refreshPage();
    }
  }

  // Navigate to previous page
  function prevPage() {
    if (page <= 1) {
      return;
    }
    setPage(page - 1);
    if (!fullItems) {
      refreshPage();
    }
  }

  // Navigate to next page
  function nextPage() {
    if (page >= totalPages) {
      return;
    }
    setPage(page + 1);
    if (!fullItems) {
      refreshPage();
    }
  }

  // Navigate to last page
  function lastPage() {
    if (page >= totalPages) {
      return;
    }
    setPage(totalPages);
    if (!fullItems) {
      refreshPage();
    }
  }

  // Refresh current page
  async function refreshPage(options?: { page?: number; immediate?: boolean }) {
    const { count } = await onCount({ searchText });
    setCount(count);

    // Clear selection because right now it indexes by item index
    setSelectedItemsMap({});
    if (options?.page !== undefined) {
      setPage(options.page);
    }
    setOp({
      type: "refresh",
      immediate: options?.immediate,
    });
  }

  // Delete items
  async function deleteItems(items: T[]) {
    if (!props.onDelete) {
      return;
    }
    await props.onDelete({ items });
    setSelectedItemsMap({});
    refreshPage({ immediate: true });
  }

  const selectedItems = items.filter((_, index) => selectedItemsMap[index]);
  const itemActions = [...(props.itemActions ?? [])];

  // Add item action to delete items
  if (props.onDelete) {
    itemActions.push({
      title: "Delete",
      buttonProps: {
        color: "error",
      },
      onClick: () => {
        setOpenDeletePrompt(true);
      },
    });
  }

  return (
    <>
      {/* Top bar */}
      <div className="flex flex-row py-3 items-center text-dim">
        {/* Actions */}
        {Object.keys(selectedItemsMap).length === 0 && props.actions}

        {/* Item actions */}
        {itemActions.length > 0 && Object.keys(selectedItemsMap).length > 0 && (
          <>
            <span className="pr-2">
              Selected {Object.keys(selectedItemsMap).length}{" "}
              {getItemNoun(Object.keys(selectedItemsMap).length)}
            </span>
            {itemActions
              .filter(
                (action) =>
                  !action.singleItemOnly ||
                  Object.keys(selectedItemsMap).length === 1
              )
              .map((action) => {
                return (
                  <Button
                    key={action.title}
                    size="sm"
                    onClick={() => {
                      if (action.onClick) {
                        action.onClick(selectedItems);
                      }
                    }}
                    {...action.buttonProps}
                  >
                    {action.title}
                  </Button>
                );
              })}
          </>
        )}

        <div className="flex-grow" />

        {/* Actions */}
        {/* {props.actions} */}

        {/* Refresh */}
        <Button
          variant="filled-dim"
          size="sm"
          className="ml-2"
          onClick={async () => {
            refreshPage();
          }}
        >
          Refresh
        </Button>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-row gap-2 ml-2">
            <Button
              variant="outlined"
              size="sm"
              className="px-2"
              onClick={firstPage}
            >
              <ChevronDoubleLeftIcon className="icon w-4 h-4" />
            </Button>
            <Button
              variant="outlined"
              size="sm"
              className="px-2"
              onClick={prevPage}
            >
              <ChevronLeftIcon className="icon w-4 h-4" />
            </Button>
            <div className="px-3 py-1 text">
              {page} of {totalPages}
            </div>
            <Button
              variant="outlined"
              size="sm"
              className="px-2"
              onClick={nextPage}
            >
              <ChevronRightIcon className="icon w-4 h-4" />
            </Button>
            <Button
              variant="outlined"
              size="sm"
              className="px-2"
              onClick={lastPage}
            >
              <ChevronDoubleRightIcon className="icon w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="relative paper px-6 pt-2 pb-3">
        {/* Filters bar */}
        {props.search?.enabled && (
          <div className="flex flex-row mt-4 mb-6">
            <div className="flex-grow" />
            <Input
              className="w-auto placeholder-base-400 dark:placeholder-base-400 bg-base-100 dark:bg-base-800 ring-1"
              icon={
                <MagnifyingGlassIcon
                  className="hover:text-dim cursor-pointer"
                  onClick={() => {
                    setSearchText(searchTextTemp);
                    refreshPage();
                  }}
                />
              }
              value={searchTextTemp}
              onChange={(searchTextTemp) => {
                setSearchTextTemp(searchTextTemp);
              }}
              onEnterPressed={() => {
                setSearchText(searchTextTemp);
                refreshPage();
              }}
              inputProps={{
                placeholder: props.search?.placeholderLabel,
              }}
            />
          </div>
        )}

        {/* Columns */}
        <div className="flex flex-row gap-2 items-end my-2">
          {/* Selection checkbox */}
          {!props.disableMultiselect && (
            <span className="w-12 flex flex-row justify-center">
              <Checkbox
                state={
                  Object.keys(selectedItemsMap).length === numSelectableItems &&
                  numSelectableItems > 0
                    ? "checked"
                    : Object.keys(selectedItemsMap).length > 0
                    ? "partial"
                    : undefined
                }
                disabled={itemActions.length <= 0 || numSelectableItems <= 0}
                onClick={() => {
                  if (
                    Object.keys(selectedItemsMap).length === numSelectableItems
                  ) {
                    setSelectedItemsMap({});
                  } else {
                    const selectedItems: { [k: number]: boolean } = {};
                    for (let i = 0; i < items.length; i++) {
                      if (
                        !props.onItemSelectable ||
                        props.onItemSelectable(items[i])
                      ) {
                        selectedItems[i] = true;
                      }
                    }
                    setSelectedItemsMap(selectedItems);
                  }
                }}
              />
            </span>
          )}

          {/* Data columns */}
          {props.columns.map((column) => {
            const sortable =
              props.sortable &&
              !column.disableSort &&
              column.field !== undefined;
            return (
              <span
                key={column.title}
                className={twMerge(
                  `flex flex-row items-center gap-2 flex-1 text-dim text-sm hover:select-none ${
                    sortable ? "cursor-pointer group" : ""
                  }`,
                  column.className
                )}
                onClick={
                  sortable
                    ? () => {
                        if (column.field === undefined) {
                          return;
                        }
                        if (sort?.column !== column.field) {
                          setSort({
                            column: column.field,
                            orderBy: "desc",
                          });
                          refreshPage({ page: 1 });
                        } else {
                          setSort(
                            sort.orderBy === "desc"
                              ? {
                                  column: column.field,
                                  orderBy: "asc",
                                }
                              : null
                          );
                          refreshPage({ page: 1 });
                        }
                      }
                    : undefined
                }
              >
                {column.title}
                {column.field !== undefined &&
                  sort?.column === column.field &&
                  sort?.orderBy === "asc" && (
                    <ChevronUpIcon className="w-4 h-4 text dark:stroke-white" />
                  )}
                {column.field !== undefined &&
                  sort?.column === column.field &&
                  sort?.orderBy === "desc" && (
                    <ChevronDownIcon className="w-4 h-4 text dark:stroke-white" />
                  )}
                {column.field !== undefined &&
                  sort?.column !== column.field && (
                    <ChevronUpDownIcon className="w-4 h-4 text-disabled hidden group-hover:block" />
                  )}
              </span>
            );
          })}
        </div>
        <div className="divider mt-4 mb-2" />

        {/* No item available */}
        {count <= 0 && (
          <div className="flex justify-center py-4">
            <span className="text text-dim">No {getItemNoun(2)} available</span>
          </div>
        )}

        {/* Items */}
        {items.map((item, index) => {
          return (
            <div key={index}>
              <div className="flex flex-row items-center gap-2">
                {/* Selection checkbox */}
                {!props.disableMultiselect && (
                  <span
                    className={`w-12 flex flex-row justify-center ${
                      props.onItemSelectable && !props.onItemSelectable(item)
                        ? "invisible"
                        : ""
                    }`}
                  >
                    <Checkbox
                      state={selectedItemsMap[index] ? "checked" : undefined}
                      disabled={
                        itemActions.length <= 0 && numSelectableItems <= 0
                      }
                      onClick={() => {
                        if (selectedItemsMap[index]) {
                          delete selectedItemsMap[index];
                          setSelectedItemsMap({ ...selectedItemsMap });
                        } else {
                          setSelectedItemsMap({
                            ...selectedItemsMap,
                            [index]: true,
                          });
                        }
                      }}
                    />
                  </span>
                )}

                {props.columns.map((column) => {
                  return (
                    <div
                      key={column.title}
                      className={twMerge(
                        "flex-1 text text-dim text-sm truncate",
                        column.className
                      )}
                    >
                      {column.onRender(item)}
                    </div>
                  );
                })}
              </div>
              {index !== items.length - 1 ? (
                <div className="divider my-2" />
              ) : null}
            </div>
          );
        })}

        {/* Spinner */}
        {op.loading && (
          <>
            <div className="absolute top-0 left-0 w-full h-full bg-black rounded-xl opacity-25 dark:opacity-50" />
            <div className="flex absolute top-0 left-0 w-full h-full items-center justify-center">
              <Spinner />
            </div>
          </>
        )}
      </div>

      {/* Total count */}
      <div className="flex flex-row mt-2 mr-2">
        <span className="flex-grow" />
        <span className="text text-dim">Total: {formatNumber(count)}</span>
      </div>

      {/* Delete prompt */}
      {!!props.onDelete && (
        <Modal
          open={openDeletePrompt}
          title={`Confirm Delete ${selectedItems.length} ${capitalize(
            getItemNoun(selectedItems.length)
          )}?`}
          onClose={() => {
            setOpenDeletePrompt(false);
          }}
        >
          <div className="flex flex-row justify-end w-72">
            <Button
              color="error"
              size="sm"
              onClick={() => {
                deleteItems(selectedItems);
                setOpenDeletePrompt(false);
              }}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
