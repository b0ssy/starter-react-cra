import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useState, useCallback } from "react";
import moment from "moment";
import { z } from "zod";

import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import Modal from "../../components/Modal";
import Table, { TableReadOptions } from "../../components/Table";
import { useForm } from "../../components/Form";
import { useAppGlobal } from "../../components/AppGlobal";
import { useAuth } from "../../lib/auth";
import {
  V1AdminRolesGet200Response,
  V1AdminUsersGet200Response,
} from "../../lib/auth/api";
import { useDispatch } from "../../redux/store";

const SYSTEM_USERNAMES = ["root"];

export default function Administrators() {
  const dispatch = useDispatch();
  const auth = useAuth();
  const { showAlert } = useAppGlobal();
  const filtersForm = useForm(
    z.object({
      username: z.string().nullish(),
      email: z.string().nullish(),
    })
  );
  const createForm = useForm(
    z.object({
      username: z.string().nullish(),
      email: z.string().nullish(),
      pw: z.string().nullish(),
      roles: z.string().nullish(),
      firstName: z.string().nullish(),
      lastName: z.string().nullish(),
      autoVerify: z.boolean().nullish(),
    })
  );
  const updateForm = useForm(
    z.object({
      id: z.string().nullish(),
      username: z.string().nullish(),
      email: z.string().nullish(),
      pw: z.string().nullish(),
      roles: z.string().array().nullish(),
      firstName: z.string().nullish(),
      lastName: z.string().nullish(),
      autoVerify: z.string().nullish(),
    })
  );

  const [refresh, setRefresh] = useState<number | undefined>();

  const [roles, setRoles] = useState<V1AdminRolesGet200Response["data"] | null>(
    null
  );

  const refreshRoles = useCallback(() => {
    auth
      .createAdminApi()
      .v1AdminRolesGet()
      .then((res) => {
        setRoles(res.data.data);
      })
      .catch(() => null);
  }, [auth]);

  const onCount = useCallback(async () => {
    const res = await auth
      .createAdminApi()
      .v1AdminUsersGet({
        typeIsNull: true,
        username: filtersForm.fields?.username ?? undefined,
        email: filtersForm.fields?.email ?? undefined,
        countOnly: true,
      })
      .catch(() => null);
    return { count: res?.data.data.count ?? 0 };
  }, [auth, filtersForm.fields]);

  const onRead = useCallback(
    async (
      options: TableReadOptions<V1AdminUsersGet200Response["data"]["data"][0]>
    ) => {
      const res = await auth
        .createAdminApi()
        .v1AdminUsersGet({
          typeIsNull: true,
          offset: options.from,
          limit: options.to - options.from,
          sortColumn:
            options.sort &&
            options.sort.column !== "roles" &&
            options.sort.column !== "groups" &&
            options.sort.column !== "attributes"
              ? options.sort.column
              : undefined,
          sortBy: options.sort ? options.sort.orderBy : undefined,
          username: filtersForm.fields?.username ?? undefined,
          email: filtersForm.fields?.email ?? undefined,
        })
        .catch(() => null);
      return res?.data.data.data ?? [];
    },
    [auth, filtersForm.fields]
  );

  async function create() {
    if (!createForm.fields?.username && !createForm.fields?.email) {
      createForm.setErrors({
        username: "Please enter a username and/or email",
        email: "Please enter a username and/or email",
      });
      return;
    }
    if (
      createForm.fields.username &&
      SYSTEM_USERNAMES.includes(createForm.fields.username.trim())
    ) {
      createForm.setErrors({
        username: `The username "${createForm.fields.username}" is reserved for system use`,
      });
      return;
    }

    const roleIds = roles?.data
      .filter((role) =>
        createForm.fields?.roles?.split(",")?.includes(role.name)
      )
      .map((role) => role.id);

    const res = await createForm.execute(
      auth.createAdminApi().v1AdminUsersPost({
        v1AdminUsersPostRequestBody: {
          username: createForm.fields.username ?? undefined,
          email: createForm.fields.email ?? undefined,
          pw: createForm.fields.pw ?? undefined,
          firstName: createForm.fields.firstName ?? undefined,
          lastName: createForm.fields.lastName ?? undefined,
          autoVerify: !!createForm.fields.autoVerify,
          roleIds,
        },
      }),
      500
    );
    if (res?.data.code !== "success") {
      createForm.setErrors({
        execute: res?.data.message ?? "Failed to create staff",
      });
      return;
    }

    createForm.clear();
    setRefresh(Date.now());
    dispatch({ type: "app/REFRESH_DASHBOARD" });
    showAlert({
      color: "success",
      title: "Created User Successfully",
    });
  }

  async function update() {
    const roleIds = roles?.data
      .filter((role) => updateForm.fields?.roles?.includes(role.name))
      .map((role) => role.id);

    const res = await updateForm.execute(
      auth.createAdminApi().v1AdminUsersIdPatch({
        id: updateForm.fields?.id ?? "",
        v1AdminUsersIdPatchRequestBody: {
          firstName: updateForm.fields?.firstName ?? undefined,
          lastName: updateForm.fields?.lastName ?? undefined,
          roleIds,
        },
      }),
      500
    );
    if (res?.data.code !== "success") {
      updateForm.setErrors({
        execute: res?.data.message ?? "Failed to update staff",
      });
      return;
    }

    updateForm.clear();
    setRefresh(Date.now());
    showAlert({
      color: "success",
      title: "Updated User Successfully",
    });
  }

  const numFilters = Object.keys(filtersForm.fields ?? {}).filter(
    (k) => !!(filtersForm.fields as any)[k]
  ).length;

  return (
    <>
      <Table
        sortable
        itemSingularNoun="staff"
        columns={[
          {
            field: "username",
            title: "Username",
            onRender: (item) => {
              return item.username;
            },
          },
          {
            field: "email",
            title: "Email",
            onRender: (item) => {
              return item.email;
            },
          },
          {
            title: "Status",
            disableSort: true,
            className: "flex-none w-24",
            onRender: (item) => {
              return (
                <div className="m-1">
                  <Chip
                    color={item.emailSignupCodeVerifiedAt ? "success" : "warn"}
                  >
                    {item.emailSignupCodeVerifiedAt ? "verified" : "unverified"}
                  </Chip>
                </div>
              );
            },
          },
          {
            field: "emailSignupCodeVerifiedAt",
            title: "Verified At",
            onRender: (item) => {
              const date = moment(item.emailSignupCodeVerifiedAt).format(
                "DD MMM YYYY, h:mm:ss A"
              );
              return (
                <span title={date}>
                  {item.emailSignupCodeVerifiedAt ? date : ""}
                </span>
              );
            },
          },
          {
            field: "createdAt",
            title: "Created At",
            onRender: (item) => {
              const date = moment(item.createdAt).format(
                "DD MMM YYYY, h:mm:ss A"
              );
              return <span title={date}>{item.createdAt ? date : ""}</span>;
            },
          },
        ]}
        actions={
          <div className="flex flex-row gap-2">
            <Button
              className="relative flex flex-row items-center gap-2"
              variant="outlined"
              size="sm"
              onClick={() => {
                filtersForm.setOpen(true);
              }}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              Filters
              <span className="">
                {numFilters > 0 ? ` (${numFilters})` : ""}
              </span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                refreshRoles();
                createForm.setOpen(true);
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
              refreshRoles();
              auth
                .createAdminApi()
                .v1AdminUsersIdGet({ id: items[0].id })
                .then((res) => {
                  updateForm.setFields({
                    ...updateForm.fields,
                    ...items[0],
                    roles: res.data.data.data.roles?.map((role) => role.name),
                  });
                });
              const { roles, ...item } = items[0];
              updateForm.setFields({
                ...updateForm.fields,
                ...item,
                roles: roles?.map((r) => r.id),
              });
              updateForm.setOpen(true);
            },
          },
        ]}
        refresh={refresh}
        onCount={onCount}
        onRead={onRead}
        // onDelete={async ({ items }) => {
        //   const res = await auth
        //     .createAdminApi()
        //     .v1AdminUsersDelete({
        //       v1AdminUsersDeleteRequestBody: {
        //         userIds: items.map((item) => item.id),
        //       },
        //     })
        //     .catch(() => null);
        //   if (res?.data.code === "success") {
        //     dispatch({ type: "app/REFRESH_DASHBOARD" });
        //     // showAlert({
        //     //   type: "success",
        //     //   title: `Deleted ${items.length} item${
        //     //     items.length > 1 ? "s" : ""
        //     //   } successfully`,
        //     // });
        //   } else {
        //     showAlert({ color: "error", title: "Failed to delete items" });
        //   }
        // }}
        onItemSelectable={(item) =>
          !SYSTEM_USERNAMES.includes(item.username ?? "")
        }
      />

      {/* Filters modal */}
      <Modal
        disableCloseOnEsc
        open={filtersForm.open}
        title="Filter Users"
        onClose={() => {
          filtersForm.setOpen(false);
        }}
      >
        <div className="w-96">
          {filtersForm.createTextInput({
            name: "username",
            title: "Username",
            autoFocus: true,
          })}
          {filtersForm.createTextInput({
            name: "email",
            title: "Email",
          })}
          {filtersForm.createActions({
            buttons: [
              {
                title: "Clear",
                ButtonProps: {
                  variant: "outlined",
                },
                onClick: () => {
                  filtersForm.clear();
                  setRefresh(Date.now());
                },
              },
              {
                title: "Save",
                onClick: () => {
                  filtersForm.setOpen(false);
                  setRefresh(Date.now());
                },
              },
            ],
          })}
        </div>
      </Modal>

      {/* Create modal */}
      <Modal
        disableCloseOnEsc
        open={createForm.open}
        title="Create Staff"
        onClose={() => {
          createForm.clear();
        }}
      >
        <div className="w-96">
          <Alert color="info" message="Please enter a username and/or email" />
          <div className="h-4" />
          {createForm.createTextInput({
            name: "username",
            title: "Username",
            autoFocus: true,
          })}
          {createForm.createTextInput({
            name: "email",
            title: "Email",
          })}
          {createForm.createSwitch({
            name: "autoVerify",
            title: "Auto Verify",
          })}
          <div className="divider mb-5" />
          {createForm.createTextInput({
            name: "pw",
            title: "Password",
            type: "password",
            optional: true,
          })}
          {createForm.createSelect({
            name: "roles",
            title: "Roles",
            options: roles?.data.map((role) => role.name) ?? [],
            optional: true,
            selectProps: {
              noOptionsAvailableText: "No roles available",
            },
          })}
          {createForm.createTextInput({
            name: "firstName",
            title: "First Name",
            optional: true,
          })}
          {createForm.createTextInput({
            name: "lastName",
            title: "Last Name",
            optional: true,
          })}
          {createForm.createActions({
            buttons: [
              {
                title: "Create",
                onClick: create,
              },
            ],
          })}
        </div>
      </Modal>

      {/* Update modal */}
      <Modal
        open={updateForm.open}
        title="Update Staff"
        onClose={() => {
          updateForm.clear();
        }}
      >
        <div className="w-96">
          {updateForm.createTextInput({
            name: "id",
            title: "ID",
            disabled: true,
          })}
          {updateForm.createTextInput({
            name: "username",
            title: "Username",
            disabled: true,
          })}
          {updateForm.createTextInput({
            name: "email",
            title: "Email",
            disabled: true,
          })}
          {updateForm.createSelect({
            name: "roles",
            title: "Roles",
            options: roles?.data.map((role) => role.name) ?? [],
            optional: true,
            selectProps: {
              noOptionsAvailableText: "No roles available",
            },
          })}
          {updateForm.createTextInput({
            name: "firstName",
            title: "First name",
          })}
          {updateForm.createTextInput({
            name: "lastName",
            title: "Last name",
          })}
          {updateForm.createActions({
            buttons: [
              {
                title: "Update",
                onClick: update,
              },
            ],
          })}
        </div>
      </Modal>
    </>
  );
}
