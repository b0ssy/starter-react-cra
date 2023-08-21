export {};

// import { useState, useEffect } from "react";\

// import Alert from "../components/Alert";
// import Button from "../components/Button";
// import { useBackend } from "../lib/backend";
// import { V1AdminConfigsGet200ResponseDataDataInnerKeyEnum } from "../lib/backend/api";

// export default function Settings() {
//   const backend = useBackend();
//   const [configs, setConfigs] = useState<{
//     [k in V1AdminConfigsGet200ResponseDataDataInnerKeyEnum]?:
//       | string
//       | undefined;
//   }>({});
//   const [showRootApiKey, setShowRootApiKey] = useState(false);

//   useEffect(() => {
//     backend
//       .createAdminApi()
//       .v1AdminConfigsGet()
//       .then((res) => {
//         const configs: {
//           [k in V1AdminConfigsGet200ResponseDataDataInnerKeyEnum]?:
//             | string
//             | undefined;
//         } = {};
//         for (const config of res.data.data.data) {
//           configs[config.key] = config.value ?? undefined;
//         }
//         setConfigs(configs);
//       });
//   }, []);

//   return (
//     <>
//       <div>
//         <div className="flex flex-row items-center gap-3 pb-2">
//           <div className="text-dim text-lg">Root API Key</div>
//           <Button
//             className="w-20"
//             size="sm"
//             onClick={() => setShowRootApiKey(!showRootApiKey)}
//           >
//             {showRootApiKey ? "Hide" : "Show"}
//           </Button>
//         </div>
//         <Alert
//           color="error"
//           title="Please ensure this API key is kept securely"
//           message="This API key allows root access into all APIs!"
//         />
//         <div className="h-4" />
//         {showRootApiKey && (
//           <textarea
//             readOnly
//             rows={3}
//             className="input w-full resize-none"
//             value={configs.rootApiKey ?? ""}
//           />
//         )}
//       </div>
//     </>
//   );
// }
