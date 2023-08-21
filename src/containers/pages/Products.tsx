import { PhotoIcon } from "@heroicons/react/24/outline";
import { useState, useCallback } from "react";
import moment from "moment";
import { z } from "zod";

// import Button from "../components/Button";
import Modal from "../../components/Modal";
import Table, {
  TableCountOptions,
  TableReadOptions,
} from "../../components/Table";
import { useForm } from "../../components/Form";
import { useAppGlobal } from "../../components/AppGlobal";
import { useDispatch } from "../../redux/store";
import { useBackend } from "../../lib/backend";
import {
  V1AdminProductsGet200Response,
  // V1AdminProductsPostRequestBodyUploadThumbnailMimeEnum,
} from "../../lib/backend/api";
import SelectButton from "../../components/SelectButton";
import ImageDropzone, { ImageDropzoneData } from "../../components/ImageDropzone";

// Currently only supports SGD
const DEFAULT_CURRENCY = "SGD";

export default function Products() {
  const dispatch = useDispatch();
  const backend = useBackend();
  const { showAlert } = useAppGlobal();
  const [, /**imageData */ setImageData] = useState<ImageDropzoneData | null>(
    null
  );

  const form = useForm(
    z.object({
      id: z.string().nullish(),
      name: z.string().nullish(),
      type: z.enum(["basic", "group"]).nullish(),
      description: z.string().nullish(),
      price: z.number().nullish(),
      currency: z.string().nullish(),
      sku: z.string().nullish(),
      stockQuantity: z.number().nullish(),
    }),
    {
      onClear: () => {
        setImageData(null);
      },
    }
  );

  const [refresh, setRefresh] = useState<number | undefined>();

  const onCount = useCallback(
    async (options: TableCountOptions) => {
      const res = await backend
        .createAdminApi()
        .v1AdminProductsGet({
          nameLike: options.searchText ? `%${options.searchText}%` : undefined,
          countOnly: true,
        })
        .catch(() => null);
      return { count: res?.data.data.count ?? 0 };
    },
    [backend]
  );

  const onRead = useCallback(
    async (
      options: TableReadOptions<
        V1AdminProductsGet200Response["data"]["data"][0]
      >
    ) => {
      const res = await backend
        .createAdminApi()
        .v1AdminProductsGet({
          nameLike: options.searchText ? `%${options.searchText}%` : undefined,
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

  // TODO: Upload image
  async function create() {
    if (!form.fields?.name) {
      form.setErrors({ name: "Please enter a valid name" });
      return;
    }
    if (form.fields?.currency !== DEFAULT_CURRENCY) {
      form.setErrors({ currency: "Please enter a valid currency" });
      return;
    }

    const result = await form.execute(
      backend.createAdminApi().v1AdminProductsPost({
        v1AdminProductsPostRequestBody: {
          name: form.fields.name,
          description: form.fields.description ?? undefined,
          price: form.fields.price ?? null,
          currency: form.fields.currency ?? undefined,
          sku: form.fields.sku ?? undefined,
          stockQuantity: form.fields.stockQuantity ?? null,
          // upload: {
          //   thumbnail:
          //     imageData?.mime ===
          //       V1AdminProductsPostRequestBodyUploadThumbnailMimeEnum.Jpg ||
          //     imageData?.mime ===
          //       V1AdminProductsPostRequestBodyUploadThumbnailMimeEnum.Png
          //       ? {
          //           mime: imageData.mime,
          //           size: imageData.size,
          //           dataBase64: imageData.dataBase64,
          //         }
          //       : undefined,
          // },
        },
      }),
      500
    );
    if (result?.data.code !== "success") {
      form.setErrors({
        execute: result?.data.message ?? "Failed to create product",
      });
      return;
    }

    form.clear();
    setRefresh(Date.now());
    dispatch({ type: "app/REFRESH_DASHBOARD" });
    showAlert({
      color: "success",
      title: `Created Product "${form.fields.name}" Successfully`,
    });
  }

  // TODO: Upload image
  async function update() {
    if (!form.fields?.name) {
      form.setErrors({ name: "Please enter a valid name" });
      return;
    }
    if (form.fields?.currency !== DEFAULT_CURRENCY) {
      form.setErrors({ currency: "Please enter a valid currency" });
      return;
    }

    const result = await form.execute(
      backend.createAdminApi().v1AdminProductsIdPatch({
        id: form.fields.id ?? "",
        v1AdminProductsIdPatchRequestBody: {
          name: form.fields.name ?? undefined,
          description: form.fields.description ?? undefined,
          price: form.fields.price ?? null,
          currency: form.fields.currency ?? undefined,
          sku: form.fields.sku ?? undefined,
          stockQuantity: form.fields.stockQuantity ?? null,
          // upload: {
          //   thumbnail:
          //     imageData?.mime ===
          //       V1AdminProductsPostRequestBodyUploadThumbnailMimeEnum.Jpg ||
          //     imageData?.mime ===
          //       V1AdminProductsPostRequestBodyUploadThumbnailMimeEnum.Png
          //       ? {
          //           mime: imageData.mime,
          //           size: imageData.size,
          //           dataBase64: imageData.dataBase64,
          //         }
          //       : undefined,
          // },
        },
      }),
      500
    );
    if (result?.data.code !== "success") {
      form.setErrors({
        execute: result?.data.message ?? "Failed to update product",
      });
      return;
    }

    form.clear();
    setRefresh(Date.now());
    showAlert({
      color: "success",
      title: `Updated Product "${form.fields.name}" Successfully`,
    });
  }

  return (
    <>
      <Table
        sortable
        search={{
          enabled: true,
        }}
        itemSingularNoun="product"
        columns={[
          {
            title: "",
            className: "flex-none w-10",
            onRender: () => {
              // TODO: show image
              return (
                <div className="w-8 h-8 p-2 divider-border border-dashed">
                  <PhotoIcon />
                </div>
              );
            },
          },
          {
            field: "name",
            title: "Name",
            onRender: (item) => (
              <span
                className="font-semibold underline decoration-dotted hover:text-disabled cursor-pointer"
                onClick={() => {
                  form.openUpdate({ ...form.fields, ...item });
                }}
              >
                {item.name ?? <span className="text-disabled">unnamed</span>}
              </span>
            ),
          },
          {
            field: "price",
            title: "Price",
            className: "flex-none w-24",
            onRender: (item) => {
              return typeof item.price === "number"
                ? `${
                    item.currency ? `${item.currency} ` : ""
                  }$${item.price.toFixed(2)}`
                : "";
            },
          },
          {
            field: "stockQuantity",
            title: "Quantity",
            className: "flex-none w-24",
            onRender: (item) => {
              return `${item.stockQuantity ?? ""}`;
            },
          },
          {
            field: "createdAt",
            title: "Created At",
            onRender: (item) => {
              return moment(item.createdAt).format("DD MMM YYYY, h:mm:ss A");
            },
          },
        ]}
        actions={
          <SelectButton
            options={[
              {
                label: "Basic Product",
                onClick: () => {
                  form.openCreate({
                    type: "basic",
                    currency: DEFAULT_CURRENCY,
                  });
                },
              },
              // {
              //   label: "Group Product",
              //   onClick: () => {
              //     form.openCreate({
              //       type: "group",
              //       currency: DEFAULT_CURRENCY,
              //     });
              //   },
              // },
            ]}
            popupWrapperClassName="w-40"
          >
            Create
          </SelectButton>
          // <div className="flex flex-row gap-2">
          //   <Button
          //     size="sm"
          //     onClick={() => form.openCreate({ currency: DEFAULT_CURRENCY })}
          //   >
          //     Create
          //   </Button>
          // </div>
        }
        itemActions={[
          {
            title: "Update",
            singleItemOnly: true,
            buttonProps: {
              className: "mr-2",
            },
            onClick: (items) => {
              if (items.length !== 1) {
                return;
              }
              form.openUpdate({ ...form.fields, ...items[0] });
            },
          },
        ]}
        refresh={refresh}
        onCount={onCount}
        onRead={onRead}
        onDelete={async ({ items }) => {
          const count = { success: 0, error: 0 };
          for (const item of items) {
            const res = await backend
              .createAdminApi()
              .v1AdminProductsIdDelete({ id: item.id })
              .catch(() => null);
            if (res?.data.code === "success") {
              count.success++;
            } else {
              count.error++;
            }
          }
          showAlert({
            color: count.error <= 0 ? "success" : "error",
            title: `Deleted products: Success ${count.success}, Error: ${count.error}`,
          });
          if (count.success > 0) {
            dispatch({ type: "app/REFRESH_DASHBOARD" });
          }
        }}
      />

      {/* Form */}
      <Modal
        disableCloseOnEsc
        open={form.open}
        title={`${form.modeCapitalized}${
          form.fields?.type === "basic"
            ? " Basic"
            : form.fields?.type === "group"
            ? " Group"
            : ""
        } Product`}
        onClose={() => {
          form.clear();
        }}
      >
        <div className="w-96">
          {form.createHeader("General Information", true)}
          {form.mode === "update" &&
            form.createTextInput({
              name: "id",
              title: "ID",
              disabled: true,
            })}
          {form.createTextInput({
            name: "name",
            title: "Name",
            autoFocus: true,
          })}
          {form.createTextInput({
            name: "description",
            title: "Description",
            optional: true,
          })}

          {/* Image */}
          <div className="text-dim text-sm">
            Image
            <span className="text-xs text-disabled"> (optional)</span>
          </div>
          <div className="h-2" />
          <ImageDropzone
            maxSizeBytes={500 * 1024}
            onRead={(data) => {
              setImageData(data);
            }}
          />

          {form.createHeader("Price")}
          {form.createTextInput({
            name: "currency",
            title: "Currency",
          })}
          {form.createTextInput({
            name: "price",
            title: "Price in dollars",
            type: "number",
            optional: true,
          })}

          {form.createHeader("Inventory")}
          {form.createTextInput({
            name: "sku",
            title: "SKU",
            optional: true,
          })}
          {form.createTextInput({
            name: "stockQuantity",
            title: "Stock Quantity",
            type: "number",
            optional: true,
          })}

          {form.createActions({
            buttons: [
              {
                title: form.modeCapitalized,
                onClick: form.mode === "create" ? create : update,
              },
            ],
          })}
        </div>
      </Modal>
    </>
  );
}
