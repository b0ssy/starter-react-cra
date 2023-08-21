import { useState } from "react";
import { z } from "zod";

import Button, { ButtonProps } from "./Button";
import Checkbox from "./Checkbox";
import Select, { SelectProps } from "./Select";
import Spinner from "./Spinner";
import Switch from "./Switch";
import Input from "./Input";
import { capitalize } from "../lib/utils";

export function useForm<TZodSchema extends z.AnyZodObject>(
  schema: TZodSchema,
  options?: {
    onClear: () => void;
  }
) {
  type TSchema = z.infer<typeof schema>;

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "update">("create");
  const [fields, setFields] = useState<TSchema | null>(null);

  const [errors, setErrors] = useState<{
    [k in keyof TSchema | "execute"]?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const createHeader = (title: string, first?: boolean) => {
    return (
      <>
        {!first && <div className="h-8" />}
        <div className="text text-md font-semibold">{title}</div>
        <div className="h-4" />
      </>
    );
  };

  const createTextInput = (props: {
    name: keyof TSchema;
    title: string;
    autoFocus?: boolean;
    type?: React.HTMLInputTypeAttribute;
    disabled?: boolean;
    optional?: boolean;
  }) => (
    <>
      <div className="text-dim text-sm">
        {props.title}
        {props.optional && (
          <span className="text-xs text-disabled"> (optional)</span>
        )}
      </div>
      <div className="h-2" />
      <Input
        type={props.type}
        autoFocus={props.autoFocus}
        autoComplete={props.type === "password" ? "new-password" : undefined}
        disabled={props.disabled || loading}
        value={
          fields &&
          fields[props.name] !== undefined &&
          fields[props.name] !== null
            ? fields[props.name]
            : ""
        }
        onChange={(value) => {
          if (props.type === "number") {
            setFields({
              ...fields,
              [props.name]: value !== "" ? parseFloat(value) : null,
            });
          } else {
            setFields({
              ...fields,
              [props.name]: value,
            });
          }
        }}
        onClearError={() => {
          setErrors({});
        }}
      />
      {!!errors[props.name] && (
        <div className="py-1 text-error text-sm">{errors[props.name]}</div>
      )}
      <div className="h-4" />
    </>
  );

  const createCheckbox = (props: {
    name: keyof TSchema;
    title: string;
    disabled?: boolean;
  }) => (
    <>
      <Checkbox
        state={fields && fields[props.name] ? "checked" : undefined}
        label={props.title}
        disabled={props.disabled}
        onClick={(state) => {
          setFields({
            ...fields,
            [props.name]: state === "checked" ? "checked" : "",
          });
        }}
      />
      <div className="h-2" />
      {!!errors[props.name] && (
        <div className="py-1 text-error text-sm">{errors[props.name]}</div>
      )}
      <div className="h-4" />
    </>
  );

  const createSwitch = (props: { name: keyof TSchema; title: string }) => (
    <>
      <Switch
        checked={fields !== null && !!fields[props.name]}
        label={props.title}
        onChecked={(checked) => {
          setFields({
            ...fields,
            [props.name]: checked,
          });
        }}
      />
      <div className="h-2" />
      {!!errors[props.name] && (
        <div className="py-1 text-error text-sm">{errors[props.name]}</div>
      )}
      <div className="h-4" />
    </>
  );

  const createSelect = (props: {
    name: keyof TSchema;
    title: string;
    options: string[];
    optional?: boolean;
    selectProps?: Pick<SelectProps, "noOptionsAvailableText">;
  }) => (
    <>
      <div className="text-dim text-sm">
        {props.title}
        {props.optional && (
          <span className="text-xs text-disabled"> (optional)</span>
        )}
      </div>
      <div className="h-2" />
      <Select
        multiple
        options={props.options}
        selectedOptions={fields && fields[props.name] ? fields[props.name] : []}
        onSelected={(selected) => {
          setFields({
            ...fields,
            [props.name]: selected,
          });
        }}
        {...props.selectProps}
      />
      {!!errors[props.name] && (
        <div className="py-1 text-error text-sm">{errors[props.name]}</div>
      )}
      <div className="h-4" />
    </>
  );

  const createActions = (props: {
    buttons: {
      position?: "start" | "end";
      title: string;
      ButtonProps?: ButtonProps;
      onClick: () => void;
    }[];
  }) => (
    <>
      <div className="flex flex-row items-center mt-2 gap-2">
        {props.buttons
          .filter((btn) => (btn.position ?? "end") === "start")
          .map((btn) => (
            <Button
              key={btn.title}
              size="sm"
              disabled={loading}
              onClick={btn.onClick}
              {...btn.ButtonProps}
            >
              {btn.title}
            </Button>
          ))}
        <div className="flex-grow" />
        {loading && <Spinner />}
        {props.buttons
          .filter((btn) => (btn.position ?? "end") === "end")
          .map((btn) => (
            <Button
              key={btn.title}
              size="sm"
              disabled={loading}
              onClick={btn.onClick}
              {...btn.ButtonProps}
            >
              {btn.title}
            </Button>
          ))}
      </div>
      {!!errors.execute && (
        <div className="pt-2 text-error text-sm text-right">
          {errors.execute}
        </div>
      )}
    </>
  );

  const openCreate = (item?: TSchema) => {
    setOpen(true);
    setMode("create");
    setFields({ ...fields, ...item });
  };

  const openUpdate = (item: TSchema) => {
    setOpen(true);
    setMode("update");
    setFields({ ...fields, ...item });
  };

  const close = () => {
    setOpen(false);
  };

  const sleep = async (milliseconds: number) => {
    if (milliseconds > 0) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, milliseconds);
      });
    }
  };

  const execute = async <T,>(fn: Promise<T>, milliseconds?: number) => {
    setErrors({});
    setLoading(true);
    const start = Date.now();
    const result = await fn.catch(() => null);
    const duration = Date.now() - start;
    if (milliseconds !== undefined && duration < milliseconds) {
      await sleep(milliseconds - duration);
    }
    setLoading(false);
    return result;
  };

  const clear = () => {
    if (options?.onClear) {
      options.onClear();
    }
    setOpen(false);
    setFields({});
    setErrors({});
    setLoading(false);
  };

  return {
    open,
    setOpen,
    close,
    mode,
    modeCapitalized: capitalize(mode),
    setMode,
    fields,
    setFields,
    errors,
    setErrors,
    loading,
    setLoading,
    openCreate,
    openUpdate,
    execute,
    clear,
    createHeader,
    createTextInput,
    createCheckbox,
    createSwitch,
    createSelect,
    createActions,
  };
}
