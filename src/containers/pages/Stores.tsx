import { PhotoIcon } from "@heroicons/react/24/outline";
import { useState, useCallback } from "react";
import moment from "moment";
import { z } from "zod";

import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Table, {
  TableCountOptions,
  TableReadOptions,
} from "../../components/Table";
import { useForm } from "../../components/Form";
import ImageDropzone, { ImageDropzoneData } from "../../components/ImageDropzone";
import { useAppGlobal } from "../../components/AppGlobal";
import { useDispatch } from "../../redux/store";
import { useBackend } from "../../lib/backend";
import {
  // V1AdminProductsPostRequestBodyUploadThumbnailMimeEnum,
  V1AdminStoresGet200Response,
} from "../../lib/backend/api";

export default function Store() {
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
      description: z.string().nullish(),
      addressLine1: z.string().nullish(),
      addressPostalCode: z.string().nullish(),
    })
  );

  const [refresh, setRefresh] = useState<number | undefined>();

  const onCount = useCallback(
    async (options: TableCountOptions) => {
      const res = await backend
        .createAdminApi()
        .v1AdminStoresGet({
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
      options: TableReadOptions<V1AdminStoresGet200Response["data"]["data"][0]>
    ) => {
      const res = await backend
        .createAdminApi()
        .v1AdminStoresGet({
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

  // TODO: Create store image
  async function create() {
    if (!form.fields?.name) {
      form.setErrors({ name: "Please enter a valid name" });
      return;
    }

    const result = await form.execute(
      backend.createAdminApi().v1AdminStoresPost({
        v1AdminStoresPostRequestBody: {
          name: form.fields.name,
          description: form.fields.description ?? undefined,
          addressLine1: form.fields.addressLine1 ?? undefined,
          addressPostalCode: form.fields.addressPostalCode ?? undefined,
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
        execute: result?.data.message ?? "Failed to create store",
      });
      return;
    }

    form.clear();
    setRefresh(Date.now());
    dispatch({ type: "app/REFRESH_DASHBOARD" });
    showAlert({
      color: "success",
      title: `Created Store "${form.fields.name}" Successfully`,
    });
  }

  // TODO: Update store image
  async function update() {
    if (!form.fields?.name) {
      form.setErrors({ name: "Please enter a valid name" });
      return;
    }

    const result = await form.execute(
      backend.createAdminApi().v1AdminStoresIdPatch({
        id: form.fields.id ?? "",
        v1AdminStoresIdPatchRequestBody: {
          name: form.fields.name ?? undefined,
          description: form.fields.description ?? undefined,
          addressLine1: form.fields.addressLine1 ?? undefined,
          addressPostalCode: form.fields.addressPostalCode ?? undefined,
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
        execute: result?.data.message ?? "Failed to update store",
      });
      return;
    }

    form.clear();
    setRefresh(Date.now());
    showAlert({
      color: "success",
      title: `Updated Store "${form.fields.name}" Successfully`,
    });
  }

  return (
    <>
      <Table
        sortable
        search={{
          enabled: true,
        }}
        itemSingularNoun="store"
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
            onRender: (item) => {
              return (
                <span
                  className="font-semibold underline decoration-dotted hover:text-disabled cursor-pointer"
                  onClick={() => {
                    form.openUpdate({ ...form.fields, ...item });
                  }}
                >
                  {item.name ?? <span className="text-disabled">unnamed</span>}
                </span>
              );
            },
          },
          {
            field: "description",
            title: "Description",
            onRender: (item) => {
              return item.description;
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
          <div className="flex flex-row gap-2">
            <Button
              size="sm"
              onClick={() => {
                form.openCreate();
              }}
            >
              Create
            </Button>
          </div>
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
              .v1AdminStoresIdDelete({ id: item.id })
              .catch(() => null);
            if (res?.data.code === "success") {
              count.success++;
            } else {
              count.error++;
            }
          }
          showAlert({
            color: count.error <= 0 ? "success" : "error",
            title: `Deleted stores: Success ${count.success}, Error: ${count.error}`,
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
        title={`${form.modeCapitalized} Store`}
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

          {form.createHeader("Location")}
          {form.createTextInput({
            name: "addressLine1",
            title: "Address",
            optional: true,
          })}
          {form.createTextInput({
            name: "addressPostalCode",
            title: "Postal Code",
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
